// API client for making HTTP requests to your backend

import { config, endpoints } from './config';
import type { 
  ApiResponse, 
  PaginatedResponse,
  ManuscriptsOverviewPage,
  ManuscriptDetails,
  FigureDetails,
  FigureCreate,
  PanelDetails,
  PanelCreate,
  LinkDetails,
  LinkCreate,
  SourceDataDetails,
  SourceDataCreate,
  FileDetails,
  CheckResultDetails,
  DepositionEventDetails
} from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.timeout = config.api.timeout;
    this.retries = config.api.retries;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    // Get auth token from environment or localStorage
    const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN || 
      (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      // Retry logic for network errors
      if (attempt < this.retries && error instanceof Error) {
        console.warn(`API request failed, retrying... (${attempt}/${this.retries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.makeRequest<T>(endpoint, options, attempt + 1);
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0
      );
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    return this.makeRequest<ApiResponse<T>>(url);
  }

  async getList<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    return this.makeRequest<PaginatedResponse<T>>(url);
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Data4Rev API convenience methods
export const api = {
  // Manuscripts
  manuscripts: {
    getAll: (params?: { 
      page?: number; 
      pagesize?: number; 
      states?: string[]; 
      sort?: string; 
      ascending?: boolean; 
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.append('page', params.page.toString());
      if (params?.pagesize !== undefined) searchParams.append('pagesize', params.pagesize.toString());
      if (params?.states) params.states.forEach(state => searchParams.append('states', state));
      if (params?.sort !== undefined) searchParams.append('sort', params.sort);
      if (params?.ascending !== undefined) searchParams.append('ascending', params.ascending.toString());
      const url = searchParams.toString() ? `${endpoints.manuscripts}?${searchParams}` : endpoints.manuscripts;
      return apiClient.get<ManuscriptsOverviewPage>(url);
    },
    getById: (id: string) =>
      apiClient.get<ManuscriptDetails>(endpoints.manuscriptDetails(id)),
    getContent: (id: string) =>
      apiClient.get<any>(endpoints.manuscriptContent(id)),
    deposit: (id: string) =>
      apiClient.post<DepositionEventDetails[]>(endpoints.manuscriptDeposit(id), {}),  
  },

  // Figures
  figures: {
    create: (manuscriptId: string, data: FigureCreate) =>
      apiClient.post<FigureDetails>(endpoints.figures(manuscriptId), data),
    update: (manuscriptId: string, figureId: string, data: Partial<FigureDetails>) =>
      apiClient.put<FigureDetails>(endpoints.figure(manuscriptId, figureId), data),
    delete: (manuscriptId: string, figureId: string) =>
      apiClient.delete<void>(endpoints.figure(manuscriptId, figureId)),
  },

  // Panels
  panels: {
    create: (manuscriptId: string, figureId: string, data: PanelCreate) =>
      apiClient.post<PanelDetails>(endpoints.panels(manuscriptId, figureId), data),
    update: (manuscriptId: string, figureId: string, panelId: string, data: Partial<PanelDetails>) =>
      apiClient.put<PanelDetails>(endpoints.panel(manuscriptId, figureId, panelId), data),
    delete: (manuscriptId: string, figureId: string, panelId: string) =>
      apiClient.delete<void>(endpoints.panel(manuscriptId, figureId, panelId)),
  },

  // Links
  links: {
    create: (manuscriptId: string, data: LinkCreate) =>
      apiClient.post<LinkDetails>(endpoints.links(manuscriptId), data),
    update: (manuscriptId: string, linkId: string, data: Partial<LinkDetails>) =>
      apiClient.put<LinkDetails>(endpoints.link(manuscriptId, linkId), data),
    delete: (manuscriptId: string, linkId: string) =>
      apiClient.delete<void>(endpoints.link(manuscriptId, linkId)),
  },

  // Source Data
  sourceData: {
    create: (manuscriptId: string, data: SourceDataCreate) =>
      apiClient.post<SourceDataDetails>(endpoints.sourceData(manuscriptId), data),
    delete: (manuscriptId: string, sourceDataId: string) =>
      apiClient.delete<void>(endpoints.sourceDataItem(manuscriptId, sourceDataId)),
  },

  // Files
  files: {
    upload: (formData: FormData) =>
      apiClient.upload<FileDetails>(endpoints.files, formData),
    getById: (fileId: string) =>
      apiClient.get<FileDetails>(endpoints.file(fileId)),
    delete: (fileId: string) =>
      apiClient.delete<void>(endpoints.file(fileId)),
  },

  // Check Results
  checkResults: {
    getByManuscriptId: (manuscriptId: string) =>
      apiClient.get<CheckResultDetails[]>(endpoints.checkResults(manuscriptId)),
  },
};