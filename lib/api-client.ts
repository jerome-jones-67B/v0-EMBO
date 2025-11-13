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
  ManuscriptFileDetails,
  CheckResultDetails,
  DepositionEventDetails,
  SortOrderUpdate
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
  private requestCache: Map<string, { promise: Promise<any>, timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5000; // 5 seconds cache for duplicate prevention

  constructor() {
    // For static builds, always use the full Data4Rev API URL
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
    // Create cache key for GET requests only (avoid caching mutations)
    const method = options.method || 'GET';
    const cacheKey = method === 'GET' ? `${method}:${url}` : null;

    // Check cache for duplicate GET requests
    if (cacheKey && this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey)!;
      const now = Date.now();

      // If cache is still valid, return the existing promise
      if (now - cached.timestamp < this.CACHE_DURATION) {
        console.log(`🔄 Using cached request:`, method, url);
        return cached.promise;
      } else {
        // Clean up expired cache
        this.requestCache.delete(cacheKey);
      }
    }

    console.log(`🌐 API Request (attempt ${attempt}/${this.retries + 1}):`, method, url);

    // Create the request promise
    const requestPromise = (async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Get auth token from config (for Data4Rev API)
      const authToken = config.api.token;

      try {
        // Determine if this is a FormData request
        const isFormData = options.body instanceof FormData;

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            // Only set Content-Type for non-FormData requests
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

        // For DELETE requests, return empty response if no content
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          return {} as T;
        }

        const data = await response.json();
        return data;
      } catch (error) {
        clearTimeout(timeoutId);

        // Remove from cache on error
        if (cacheKey) {
          this.requestCache.delete(cacheKey);
        }

        throw error;
      }
    })();

    // Cache GET requests
    if (cacheKey) {
      this.requestCache.set(cacheKey, {
        promise: requestPromise,
        timestamp: Date.now()
      });
    }

    return requestPromise;
  }

  private async makeTextRequest(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<string> {
    const url = `${this.baseUrl}${endpoint}`;

    // Create cache key for GET requests only (avoid caching mutations)
    const method = options.method || 'GET';
    const cacheKey = method === 'GET' ? `${method}:${url}:text` : null;

    // Check cache for duplicate GET requests
    if (cacheKey && this.requestCache.has(cacheKey)) {
      const cached = this.requestCache.get(cacheKey)!;
      const now = Date.now();

      // If cache is still valid, return the existing promise
      if (now - cached.timestamp < this.CACHE_DURATION) {
        console.log(`🔄 Using cached text request:`, method, url);
        return cached.promise;
      } else {
        // Clean up expired cache
        this.requestCache.delete(cacheKey);
      }
    }

    console.log(`🌐 Text API Request (attempt ${attempt}/${this.retries + 1}):`, method, url);

    // Create the request promise for text response
    const requestPromise = (async (): Promise<string> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Get auth token from config (for Data4Rev API)
      const authToken = config.api.token;

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            // Don't set Content-Type for text requests
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

        const text = await response.text();
        return text;
      } catch (error) {
        clearTimeout(timeoutId);

        // Remove from cache on error
        if (cacheKey) {
          this.requestCache.delete(cacheKey);
        }

        throw error;
      }
    })();

    // Cache GET requests
    if (cacheKey) {
      this.requestCache.set(cacheKey, {
        promise: requestPromise,
        timestamp: Date.now()
      });
    }

    return requestPromise;
  }

  // Generic CRUD operations
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    return this.makeRequest<ApiResponse<T>>(url);
  }

  async getText(endpoint: string, params?: Record<string, any>): Promise<string> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    return this.makeTextRequest(url);
  }

  async getBlob(endpoint: string, params?: Record<string, any>): Promise<Blob> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${this.baseUrl}${endpoint}?${searchParams}` : `${this.baseUrl}${endpoint}`;

    const authToken = config.api.token;
    const response = await fetch(url, {
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
    });

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }

    return response.blob();
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
    console.log('Uploading to endpoint:', endpoint)
    console.log('FormData contents:')
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    return this.makeRequest<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: formData,
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
      apiClient.getText(endpoints.manuscriptContent(id)),
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
    move: (manuscriptId: string, sortOrderUpdates: SortOrderUpdate[]) =>
      apiClient.put<FigureDetails[]>(endpoints.figuresMove(manuscriptId), sortOrderUpdates),
  },

  // Panels
  panels: {
    create: (manuscriptId: string, figureId: string, data: PanelCreate) =>
      apiClient.post<PanelDetails>(endpoints.panels(manuscriptId, figureId), data),
    update: (manuscriptId: string, figureId: string, panelId: string, data: Partial<PanelDetails>) =>
      apiClient.put<PanelDetails>(endpoints.panel(manuscriptId, figureId, panelId), data),
    delete: (manuscriptId: string, figureId: string, panelId: string) =>
      apiClient.delete<void>(endpoints.panel(manuscriptId, figureId, panelId)),
    move: (manuscriptId: string, figureId: string, sortOrderUpdates: SortOrderUpdate[]) =>
      apiClient.put<PanelDetails[]>(endpoints.panelsMove(manuscriptId, figureId), sortOrderUpdates),
  },

  // Links
  links: {
    // Manuscript level links
    createManuscript: (manuscriptId: string, data: LinkCreate) =>
      apiClient.post<LinkDetails>(endpoints.links(manuscriptId), data),
    updateManuscript: (manuscriptId: string, linkId: string, data: Partial<LinkCreate>) =>
      apiClient.put<LinkDetails>(endpoints.link(manuscriptId, linkId), data),
    deleteManuscript: (manuscriptId: string, linkId: string) =>
      apiClient.delete<void>(endpoints.link(manuscriptId, linkId)),

    // Figure level links
    createFigure: (manuscriptId: string, figureId: string, data: LinkCreate) =>
      apiClient.post<LinkDetails>(endpoints.figureLinks(manuscriptId, figureId), data),
    updateFigure: (manuscriptId: string, figureId: string, linkId: string, data: Partial<LinkCreate>) =>
      apiClient.put<LinkDetails>(endpoints.figureLink(manuscriptId, figureId, linkId), data),
    deleteFigure: (manuscriptId: string, figureId: string, linkId: string) =>
      apiClient.delete<void>(endpoints.figureLink(manuscriptId, figureId, linkId)),

    // Panel level links
    createPanel: (manuscriptId: string, figureId: string, panelId: string, data: LinkCreate) =>
      apiClient.post<LinkDetails>(endpoints.panelLinks(manuscriptId, figureId, panelId), data),
    updatePanel: (manuscriptId: string, figureId: string, panelId: string, linkId: string, data: Partial<LinkCreate>) =>
      apiClient.put<LinkDetails>(endpoints.panelLink(manuscriptId, figureId, panelId, linkId), data),
    deletePanel: (manuscriptId: string, figureId: string, panelId: string, linkId: string) =>
      apiClient.delete<void>(endpoints.panelLink(manuscriptId, figureId, panelId, linkId)),
  },

  // Source Data
  sourceData: {
    create: (manuscriptId: string, data: SourceDataCreate) =>
      apiClient.post<SourceDataDetails>(endpoints.sourceData(manuscriptId), data),
    delete: (manuscriptId: string, sourceDataId: string) =>
      apiClient.delete<void>(endpoints.sourceDataItem(manuscriptId, sourceDataId)),

    // File assignment methods
    assignToManuscript: (manuscriptId: string, fileId: number) =>
      apiClient.post<SourceDataDetails>(endpoints.sourceData(manuscriptId), { file_id: fileId }),
    assignToFigure: (manuscriptId: string, figureId: string, fileId: number) =>
      apiClient.post<SourceDataDetails>(endpoints.figureSourceData(manuscriptId, figureId), { file_id: fileId }),
    assignToPanel: (manuscriptId: string, figureId: string, panelId: string, fileId: number) =>
      apiClient.post<SourceDataDetails>(endpoints.panelSourceData(manuscriptId, figureId, panelId), { file_id: fileId }),

    // Batch file assignment methods (for bulk operations)
    // These call the individual endpoints in sequence for now, but can be optimized with batch API endpoints in the future
    batchAssignToManuscript: async (manuscriptId: string, fileIds: number[]) => {
      const results = await Promise.allSettled(
        fileIds.map(fileId => apiClient.post<SourceDataDetails>(endpoints.sourceData(manuscriptId), { file_id: fileId }))
      )
      return results
    },
    batchAssignToFigure: async (manuscriptId: string, figureId: string, fileIds: number[]) => {
      const results = await Promise.allSettled(
        fileIds.map(fileId => apiClient.post<SourceDataDetails>(endpoints.figureSourceData(manuscriptId, figureId), { file_id: fileId }))
      )
      return results
    },
    batchAssignToPanel: async (manuscriptId: string, figureId: string, panelId: string, fileIds: number[]) => {
      const results = await Promise.allSettled(
        fileIds.map(fileId => apiClient.post<SourceDataDetails>(endpoints.panelSourceData(manuscriptId, figureId, panelId), { file_id: fileId }))
      )
      return results
    },

    // Delete source data mappings
    deleteFromManuscript: (manuscriptId: string, sourceDataId: string) =>
      apiClient.delete<void>(endpoints.sourceDataItem(manuscriptId, sourceDataId)),
    deleteFromFigure: (manuscriptId: string, figureId: string, sourceDataId: string) =>
      apiClient.delete<void>(endpoints.figureSourceData(manuscriptId, figureId) + `/${sourceDataId}`),
    deleteFromPanel: (manuscriptId: string, figureId: string, panelId: string, sourceDataId: string) =>
      apiClient.delete<void>(endpoints.panelSourceData(manuscriptId, figureId, panelId) + `/${sourceDataId}`),
  },

  // Files
  files: {
    upload: (manuscriptId: string, formData: FormData) =>
      apiClient.upload<FileDetails>(endpoints.manuscriptFiles(manuscriptId), formData),
    getById: (fileId: string) =>
      apiClient.get<FileDetails>(endpoints.file(fileId)),
    delete: (manuscriptId: string, fileId: string) =>
      apiClient.delete<void>(endpoints.manuscriptFileDownload(manuscriptId, fileId)),
    // Get files for a specific manuscript
    getByManuscriptId: (manuscriptId: string) =>
      apiClient.get<ManuscriptFileDetails[]>(endpoints.manuscriptFiles(manuscriptId)),
    // Get file preview
    getPreview: (manuscriptId: string, fileId: string) =>
      apiClient.getBlob(endpoints.manuscriptFilePreview(manuscriptId, fileId)),
    // Download file
    download: (manuscriptId: string, fileId: string) =>
      apiClient.getBlob(endpoints.manuscriptFileDownload(manuscriptId, fileId)),
    // Note: The old /download?format=list endpoint doesn't exist in Data4Rev API
    // Use getByManuscriptId instead to get all files for a manuscript
  },

  // Check Results
  checkResults: {
    getByManuscriptId: (manuscriptId: string) =>
      apiClient.get<CheckResultDetails[]>(endpoints.checkResults(manuscriptId)),
  },

  // Checks
  checks: {
    getByManuscriptId: (manuscriptId: string) =>
      apiClient.get<any[]>(endpoints.checks(manuscriptId)),
    create: (manuscriptId: string, data: any) =>
      apiClient.post<any>(endpoints.checks(manuscriptId), data),
    update: (manuscriptId: string, checkId: string, data: any) =>
      apiClient.put<any>(`${endpoints.checks(manuscriptId)}/${checkId}`, data),
  },

  // Messages
  messages: {
    getAll: () =>
      apiClient.get<any[]>(endpoints.messages),
  },

  // Validation
  validation: {
    getByManuscriptId: (manuscriptId: string) =>
      apiClient.get<any>(endpoints.manuscriptValidation(manuscriptId)),
    submit: (manuscriptId: string, data: any) =>
      apiClient.post<any>(endpoints.manuscriptValidation(manuscriptId), data),
  },

  // Deposit
  deposit: {
    submit: (manuscriptId: string) =>
      apiClient.post<any>(endpoints.manuscriptDeposit(manuscriptId), {}),
  },
};
