// Data service layer that switches between mock data and real API calls

import { config } from './config';
import { api } from './api-client';
import { getStatusMapping, getUnmappedFields } from './status-mapping';
import {
  mockManuscripts,
  mockFigures,
  mockLinkedData,
  mockSourceData,
} from './mock';
import { realFigures } from './real-figures-data';
import type {
  Manuscript,
  ManuscriptOverview,
  Figure,
  LinkedDataEntry,
  SourceData,
  Author,
  Editor,
  Reviewer,
  Comment,
  Version,
  Task,
  Notification,
  CollaborationRequest,
  ApiResponse,
  PaginatedResponse,
} from './types';

// Mock data wrapper to simulate API responses
function createMockResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    success: true,
    message: 'Success',
  };
}

function createMockPaginatedResponse<T>(
  data: T[],
  page = 1,
  limit = 20
): PaginatedResponse<T> {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      pages: Math.ceil(data.length / limit),
    },
    success: true,
    message: 'Success',
  };
}

// Data service class
export class DataService {
  private useMockData: boolean;

  constructor() {
    this.useMockData = config.features.useMockData;
  }

  // Toggle between mock and real API (useful for development/testing)
  setUseMockData(useMock: boolean) {
    this.useMockData = useMock;
  }

  // Get current mock data setting
  getUseMockData(): boolean {
    return this.useMockData;
  }

  // Add real figures to specific manuscripts
  private async addRealFiguresToManuscript(manuscript: any): Promise<any> {
    try {
      console.log('🔧 Adding real figures to manuscript:', manuscript.id)
      console.log('📊 Real figures available:', realFigures.length)
      
      // Add real figures to specific manuscripts
      if (manuscript.id === 'EMBO-2024-001') {
        // Add your real figures to this manuscript
        console.log('✅ Adding real figures to EMBO-2024-001')
        console.log('📋 Real figures data:', realFigures)
        
        const result = {
          ...manuscript,
          figures: realFigures,
          figureCount: realFigures.length
        };
        
        console.log('🎯 Final manuscript with figures:', result)
        console.log('📊 Final figures count:', result.figures?.length || 0)
        
        return result;
      }
      
      // For other manuscripts, add some mock figures
      console.log('⚠️ Not EMBO-2024-001, using mock figures for:', manuscript.id)
      const mockFiguresForManuscript = mockFigures.slice(0, manuscript.figureCount || 2);
      const result = {
        ...manuscript,
        figures: mockFiguresForManuscript,
        figureCount: mockFiguresForManuscript.length
      };
      console.log('📊 Mock figures count:', result.figures?.length || 0)
      return result;
    } catch (error) {
      console.error('Error adding real figures to manuscript:', error);
      return manuscript;
    }
  }

  // Helper function to transform Data4Rev manuscript to our format
  private transformManuscript(manuscript: ManuscriptOverview): Manuscript {
    const statusMapping = getStatusMapping(manuscript.status);
    const unmappedFields = getUnmappedFields(manuscript);
    
    return {
      // Data4Rev API fields (keep as-is)
      msid: manuscript.msid,
      journal: manuscript.journal,
      doi: manuscript.doi,
      accession_number: manuscript.accession_number,
      title: manuscript.title,
      authors: manuscript.authors, // Keep as string (Data4Rev format)
      id: manuscript.id,
      received_at: manuscript.received_at,
      status: manuscript.status,
      note: manuscript.note,
      
      // Backward compatibility fields (mapped with proper status mapping)
      received: manuscript.received_at,
      lastModified: manuscript.received_at,
      assignedTo: null, // Not available in Data4Rev API
      priority: statusMapping.priority,
      figureCount: 0, // Will be populated when we have figure data
      qcStatus: statusMapping.qcStatus,
      
      // UI-specific fields for dashboard
      displayStatus: statusMapping.displayStatus,
      workflowState: statusMapping.workflowState,
      badgeVariant: statusMapping.badgeVariant,
      isMapped: statusMapping.isMapped,
      unmappedFields: unmappedFields,
    };
  }

  private derivePriorityFromStatus(status: string): string {
    // Map Data4Rev statuses to priority levels
    const priorityMap: Record<string, string> = {
      'submitted': 'medium',
      'in_progress': 'high',
      'needs_revision': 'high',
      'approved': 'low',
      'published': 'low',
      'rejected': 'low',
    };
    return priorityMap[status.toLowerCase()] || 'medium';
  }

  private deriveQCStatusFromStatus(status: string): string {
    // Map Data4Rev statuses to QC status
    const qcMap: Record<string, string> = {
      'submitted': 'needs-validation',
      'in_progress': 'needs-validation',
      'needs_revision': 'needs-validation',
      'approved': 'validated',
      'published': 'validated',
      'rejected': 'validated',
    };
    return qcMap[status.toLowerCase()] || 'needs-validation';
  }

  // Helper to transform old mock data to new format
  private transformMockManuscript(mockManuscript: any): Manuscript {
    return {
      // Data4Rev API fields
      msid: mockManuscript.id || `EMBO-${Date.now()}`,
      journal: mockManuscript.journal || 'EMBO Journal',
      doi: mockManuscript.doi || `10.1038/s41586-${Date.now()}`,
      accession_number: mockManuscript.accessionNumber || `ACC-${mockManuscript.id}`,
      title: mockManuscript.title,
      authors: Array.isArray(mockManuscript.authors) 
        ? mockManuscript.authors.join(', ') 
        : mockManuscript.authors || 'Unknown Author',
      id: parseInt(mockManuscript.id.replace(/\D/g, '')) || Date.now(),
      received_at: mockManuscript.received ? `${mockManuscript.received}T08:00:00Z` : new Date().toISOString(),
      status: mockManuscript.status?.toLowerCase().replace(' ', '_') || 'submitted',
      note: mockManuscript.abstract || null,
      
      // Backward compatibility fields
      received: mockManuscript.received || new Date().toISOString().split('T')[0],
      lastModified: mockManuscript.lastModified || new Date().toISOString().split('T')[0],
      assignedTo: mockManuscript.assignedTo || null,
      priority: mockManuscript.priority || 'medium',
      figureCount: mockManuscript.figureCount || 0,
      qcStatus: mockManuscript.qcStatus || 'needs-validation',
      abstract: mockManuscript.abstract,
      keywords: mockManuscript.keywords || [],
      submissionType: mockManuscript.submissionType || 'Research Article',
      wordCount: mockManuscript.wordCount,
      collaborators: mockManuscript.collaborators || [],
      figures: mockManuscript.figures || [],
    };
  }

  // Manuscripts
  async getManuscripts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    assignedTo?: string;
    priority?: string;
  }): Promise<PaginatedResponse<Manuscript>> {
    if (this.useMockData) {
      let filteredData = mockManuscripts.map(m => this.transformMockManuscript(m));

      // Apply filters
      if (params?.status) {
        filteredData = filteredData.filter(m => m.status === params.status);
      }
      if (params?.assignedTo) {
        filteredData = filteredData.filter(m => m.assignedTo === params.assignedTo);
      }
      if (params?.priority) {
        filteredData = filteredData.filter(m => m.priority === params.priority);
      }

      return createMockPaginatedResponse(
        filteredData,
        params?.page || 1,
        params?.limit || 20
      );
    }

    // Call Data4Rev API
    const data4revParams = {
      page: (params?.page || 1) - 1, // Data4Rev uses 0-based pagination
      pagesize: params?.limit || 20,
      states: params?.status ? [params.status] : undefined,
      sort: 'received_at',
      ascending: false,
    };

    const response = await api.manuscripts.getAll(data4revParams);
    
    // Transform the response to match our format
    const transformedManuscripts = response.manuscripts.map(m => this.transformManuscript(m));
    
    return {
      data: transformedManuscripts,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: response.total,
        pages: Math.ceil(response.total / (params?.limit || 20)),
      },
      success: true,
      message: 'Success',
    };
  }

  async getManuscriptById(id: string): Promise<ApiResponse<Manuscript>> {
    if (this.useMockData) {
      const manuscript = mockManuscripts.find(m => m.id === id);
      if (!manuscript) {
        throw new Error(`Manuscript ${id} not found`);
      }
      
      // Add real figures to specific manuscripts
      const manuscriptWithFigures = await this.addRealFiguresToManuscript(manuscript);
      return createMockResponse(this.transformMockManuscript(manuscriptWithFigures));
    }

    // Call Data4Rev API
    const response = await api.manuscripts.getById(id);
    
    // Transform the detailed manuscript data
    const transformedManuscript: Manuscript = {
      ...this.transformManuscript(response),
      figureCount: response.figures.length,
      // Additional fields from detailed response
      abstract: response.note || undefined,
      keywords: [], // Not available in Data4Rev API
      submissionType: 'Research Article', // Default value
      wordCount: undefined, // Not available in Data4Rev API
      collaborators: [], // Not available in Data4Rev API
    };

    return createMockResponse(transformedManuscript);
  }

  async createManuscript(data: Partial<Manuscript>): Promise<ApiResponse<Manuscript>> {
    if (this.useMockData) {
      const newManuscript: Manuscript = {
        // Data4Rev API fields
        msid: `EMBO-${Date.now()}`,
        journal: data.journal || 'EMBO Journal',
        doi: `10.1038/s41586-${Date.now()}`,
        accession_number: `ACC-${Date.now()}`,
        title: data.title || 'Untitled Manuscript',
        authors: typeof data.authors === 'string' ? data.authors : 'Unknown Author',
        id: Date.now(),
        received_at: new Date().toISOString(),
        status: data.status || 'submitted',
        note: null,
        
        // Backward compatibility fields
        received: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        assignedTo: data.assignedTo || null,
        priority: data.priority || 'medium',
        figureCount: data.figureCount || 0,
        qcStatus: data.qcStatus || 'needs-validation',
        ...data,
      };
      // Note: We can't actually modify the mock array, so we'll just return the new manuscript
      return createMockResponse(newManuscript);
    }

    // Data4Rev API doesn't support creating manuscripts via API
    throw new Error('Creating manuscripts is not supported by Data4Rev API');
  }

  async updateManuscript(id: string, data: Partial<Manuscript>): Promise<ApiResponse<Manuscript>> {
    if (this.useMockData) {
      const manuscript = mockManuscripts.find(m => m.id === id);
      if (!manuscript) {
        throw new Error(`Manuscript ${id} not found`);
      }
      // Transform and merge the data
      const transformed = this.transformMockManuscript(manuscript);
      const updated = { ...transformed, ...data };
      return createMockResponse(updated);
    }

    // Data4Rev API doesn't support updating manuscripts via API
    throw new Error('Updating manuscripts is not supported by Data4Rev API');
  }

  // Figures - Data from manuscript details
  async getFigures(params?: {
    manuscriptId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Figure>> {
    if (this.useMockData) {
      // Combine mock figures with real figures
      const allFigures = [...mockFigures, ...realFigures];
      let filteredData = allFigures.map(f => this.transformMockFigure(f));

      if (params?.manuscriptId) {
        // In a real scenario, figures would be linked to manuscripts
        // For mock data, we'll return all figures
        filteredData = allFigures.map(f => this.transformMockFigure(f));
      }

      return createMockPaginatedResponse(
        filteredData,
        params?.page || 1,
        params?.limit || 20
      );
    }

    // For Data4Rev API, figures are part of manuscript details
    if (params?.manuscriptId) {
      const manuscript = await api.manuscripts.getById(params.manuscriptId);
      const transformedFigures = manuscript.figures.map(f => this.transformFigure(f));
      return createMockPaginatedResponse(
        transformedFigures,
        params?.page || 1,
        params?.limit || 20
      );
    }

    // Can't get all figures without manuscript context in Data4Rev API
    return createMockPaginatedResponse([], 1, 20);
  }

  // Helper to transform mock figures to new format
  private transformMockFigure(mockFigure: any): Figure {
    return {
      // Data4Rev API fields
      label: mockFigure.title || mockFigure.label,
      caption: mockFigure.legend || mockFigure.caption,
      sort_order: parseInt(mockFigure.id.replace(/\D/g, '')) || 1,
      id: parseInt(mockFigure.id.replace(/\D/g, '')) || Date.now(),
      panels: mockFigure.panels || [],
      links: mockFigure.linkedData?.map((l: any) => ({
        name: l.description,
        uri: l.url,
        identifier: l.identifier,
        database: l.type,
        id: Date.now()
      })) || [],
      source_data: [],
      check_results: mockFigure.qcChecks?.map((c: any) => ({
        check_name: 'QC Check',
        status: c.type,
        message: c.message,
        details: c.details,
        id: Date.now()
      })) || [],
      
      // Backward compatibility fields
      title: mockFigure.title,
      legend: mockFigure.legend,
      linkedData: mockFigure.linkedData || [],
      qcChecks: mockFigure.qcChecks || []
    };
  }

  private transformFigure(figure: any): Figure {
    return {
      // Data4Rev API fields
      label: figure.label,
      caption: figure.caption,
      sort_order: figure.sort_order,
      id: figure.id,
      panels: figure.panels,
      links: figure.links,
      source_data: figure.source_data,
      check_results: figure.check_results,
      
      // Backward compatibility fields
      title: figure.label,
      legend: figure.caption,
      linkedData: figure.links.map((l: any) => ({
        type: l.database || 'unknown',
        identifier: l.identifier || '',
        url: l.uri,
        description: l.name
      })),
      qcChecks: figure.check_results.map((c: any) => ({
        type: c.status === 'error' ? 'error' : c.status === 'warning' ? 'warning' : 'info',
        message: c.message || '',
        details: c.details || '',
        aiGenerated: true,
        dismissed: false
      }))
    };
  }

  async getFigureById(id: string): Promise<ApiResponse<Figure>> {
    if (this.useMockData) {
      const figure = mockFigures.find(f => f.id === id);
      if (!figure) {
        throw new Error(`Figure ${id} not found`);
      }
      return createMockResponse(this.transformMockFigure(figure));
    }

    // Data4Rev API doesn't have standalone figure endpoints
    // Figures are accessed through manuscript details
    throw new Error('Getting individual figures requires manuscript context in Data4Rev API');
  }

  // Linked Data - from manuscript details
  async getLinkedData(params?: {
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<LinkedDataEntry>> {
    if (this.useMockData) {
      let filteredData = [...mockLinkedData];

      if (params?.type) {
        filteredData = filteredData.filter(d => d.type === params.type);
      }

      return createMockPaginatedResponse(
        filteredData,
        params?.page || 1,
        params?.limit || 20
      );
    }

    // Data4Rev API doesn't have standalone linked data endpoints
    // Linked data is accessed through manuscript details
    return createMockPaginatedResponse([], 1, 20);
  }

  // Source Data - from manuscript details
  async getSourceData(params?: {
    manuscriptId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SourceData>> {
    if (this.useMockData) {
      let filteredData = [...mockSourceData];

      return createMockPaginatedResponse(
        filteredData,
        params?.page || 1,
        params?.limit || 20
      );
    }

    // Data4Rev API doesn't have standalone source data endpoints
    // Source data is accessed through manuscript details
    return createMockPaginatedResponse([], 1, 20);
  }

  // Additional utility methods
  async searchManuscripts(query: string): Promise<PaginatedResponse<Manuscript>> {
    if (this.useMockData) {
      const transformedData = mockManuscripts.map(m => this.transformMockManuscript(m));
      const filteredData = transformedData.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.authors.toLowerCase().includes(query.toLowerCase()) ||
        m.msid.toLowerCase().includes(query.toLowerCase())
      );
      return createMockPaginatedResponse(filteredData);
    }

    // Data4Rev API doesn't have search functionality
    // We'll get all manuscripts and filter client-side for now
    const response = await api.manuscripts.getAll();
    const filteredData = response.manuscripts
      .map(m => this.transformManuscript(m))
      .filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.authors.toLowerCase().includes(query.toLowerCase()) ||
        m.msid.toLowerCase().includes(query.toLowerCase())
      );
    
    return createMockPaginatedResponse(filteredData);
  }

  // Statistics and analytics
  async getStatistics(): Promise<ApiResponse<any>> {
    if (this.useMockData) {
      const stats = {
        totalManuscripts: mockManuscripts.length,
        manuscriptsByStatus: mockManuscripts.reduce((acc, m) => {
          acc[m.status] = (acc[m.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        manuscriptsByPriority: mockManuscripts.reduce((acc, m) => {
          acc[m.priority] = (acc[m.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalFigures: mockFigures.length,
        totalAuthors: 0, // Not available in Data4Rev API
        pendingTasks: 0, // Not available in Data4Rev API
        unreadNotifications: 0, // Not available in Data4Rev API
      };
      return createMockResponse(stats);
    }

    // Get statistics from Data4Rev API
    const response = await api.manuscripts.getAll();
    const manuscripts = response.manuscripts.map(m => this.transformManuscript(m));
    
    const stats = {
      totalManuscripts: response.total,
      manuscriptsByStatus: manuscripts.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      manuscriptsByPriority: manuscripts.reduce((acc, m) => {
        acc[m.priority] = (acc[m.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalFigures: manuscripts.reduce((acc, m) => acc + m.figureCount, 0),
      totalAuthors: 0, // Not available in Data4Rev API
      pendingTasks: 0, // Not available in Data4Rev API
      unreadNotifications: 0, // Not available in Data4Rev API
    };
    
    return createMockResponse(stats);
  }
}

// Export singleton instance
export const dataService = new DataService();

// Export convenience methods
export const {
  getManuscripts,
  getManuscriptById,
  createManuscript,
  updateManuscript,
  getFigures,
  getFigureById,
  getLinkedData,
  getSourceData,
  searchManuscripts,
  getStatistics,
} = dataService;