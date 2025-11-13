// Data service layer that switches between mock data and real API calls

import { config } from './config';
import { api } from './api-client';
import { getStatusMapping, getUnmappedFields } from './status-mapping';
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


  // Manuscripts
  async getManuscripts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    assignedTo?: string;
    priority?: string;
  }): Promise<PaginatedResponse<Manuscript>> {
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
    const transformedManuscripts = response.data.manuscripts.map((m: any) => this.transformManuscript(m));

    return {
      data: transformedManuscripts,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: response.data.total,
        pages: Math.ceil(response.data.total / (params?.limit || 20)),
      },
      success: true,
      message: 'Success',
    };
  }

  async getManuscriptById(id: string): Promise<ApiResponse<Manuscript>> {
    // Call Data4Rev API
    const response = await api.manuscripts.getById(id);

    // Transform the detailed manuscript data
    const transformedManuscript: Manuscript = {
      ...this.transformManuscript(response.data),
      figureCount: response.data.figures.length,
      // Additional fields from detailed response
      abstract: response.data.note || undefined,
      keywords: [], // Not available in Data4Rev API
      submissionType: 'Research Article', // Default value
      wordCount: undefined, // Not available in Data4Rev API
      collaborators: [], // Not available in Data4Rev API
    };

    return createMockResponse(transformedManuscript);
  }

  async createManuscript(data: Partial<Manuscript>): Promise<ApiResponse<Manuscript>> {
    // Data4Rev API doesn't support creating manuscripts via API
    throw new Error('Creating manuscripts is not supported by Data4Rev API');
  }

  async updateManuscript(id: string, data: Partial<Manuscript>): Promise<ApiResponse<Manuscript>> {
    // Data4Rev API doesn't support updating manuscripts via API
    throw new Error('Updating manuscripts is not supported by Data4Rev API');
  }

  // Figures - Data from manuscript details
  async getFigures(params?: {
    manuscriptId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Figure>> {
    // For Data4Rev API, figures are part of manuscript details
    if (params?.manuscriptId) {
      const manuscript = await api.manuscripts.getById(params.manuscriptId);
      const transformedFigures = manuscript.data.figures.map((f: any) => this.transformFigure(f));
      return createMockPaginatedResponse(
        transformedFigures,
        params?.page || 1,
        params?.limit || 20
      );
    }

    // Can't get all figures without manuscript context in Data4Rev API
    return createMockPaginatedResponse([], 1, 20);
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
    // Data4Rev API doesn't have standalone source data endpoints
    // Source data is accessed through manuscript details
    return createMockPaginatedResponse([], 1, 20);
  }

  // Additional utility methods
  async searchManuscripts(query: string): Promise<PaginatedResponse<Manuscript>> {
    // Data4Rev API doesn't have search functionality
    // We'll get all manuscripts and filter client-side for now
    const response = await api.manuscripts.getAll();
    const filteredData = response.data.manuscripts
      .map((m: any) => this.transformManuscript(m))
      .filter((m: any) =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.authors.toLowerCase().includes(query.toLowerCase()) ||
        m.msid.toLowerCase().includes(query.toLowerCase())
      );

    return createMockPaginatedResponse(filteredData);
  }

  // Statistics and analytics
  async getStatistics(): Promise<ApiResponse<any>> {
    // Get statistics from Data4Rev API
    const response = await api.manuscripts.getAll();
    const manuscripts = response.data.manuscripts.map((m: any) => this.transformManuscript(m));

    const stats = {
      totalManuscripts: response.data.total,
      manuscriptsByStatus: manuscripts.reduce((acc: any, m: any) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      manuscriptsByPriority: manuscripts.reduce((acc: any, m: any) => {
        acc[m.priority] = (acc[m.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalFigures: manuscripts.reduce((acc: any, m: any) => acc + (m.figureCount || 0), 0),
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
