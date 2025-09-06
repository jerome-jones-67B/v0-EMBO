// Configuration for API endpoints and environment settings

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
    retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '3'),
  },
  
  // Feature flags
  features: {
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development',
    enableRealTimeUpdates: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  // File upload limits
  upload: {
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '52428800'), // 50MB default
    allowedTypes: ['pdf', 'docx', 'xlsx', 'csv', 'zip', 'png', 'jpg', 'tiff', 'fcs', 'mzML'],
  },
} as const;

// API Endpoints - Data4Rev API structure
export const endpoints = {
  manuscripts: '/api/v1/manuscripts',
  manuscriptDetails: (id: string) => `/api/v1/manuscripts/${id}`,
  manuscriptContent: (id: string) => `/api/v1/manuscripts/${id}/content`,
  manuscriptDeposit: (id: string) => `/api/v1/manuscripts/${id}/deposit`,
  figures: (manuscriptId: string) => `/api/v1/manuscripts/${manuscriptId}/figures`,
  figure: (manuscriptId: string, figureId: string) => `/api/v1/manuscripts/${manuscriptId}/figures/${figureId}`,
  panels: (manuscriptId: string, figureId: string) => `/api/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels`,
  panel: (manuscriptId: string, figureId: string, panelId: string) => `/api/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels/${panelId}`,
  links: (manuscriptId: string) => `/api/v1/manuscripts/${manuscriptId}/links`,
  link: (manuscriptId: string, linkId: string) => `/api/v1/manuscripts/${manuscriptId}/links/${linkId}`,
  sourceData: (manuscriptId: string) => `/api/v1/manuscripts/${manuscriptId}/source-data`,
  sourceDataItem: (manuscriptId: string, sourceDataId: string) => `/api/v1/manuscripts/${manuscriptId}/source-data/${sourceDataId}`,
  files: '/api/v1/files',
  file: (fileId: string) => `/api/v1/files/${fileId}`,
  checkResults: (manuscriptId: string) => `/api/v1/manuscripts/${manuscriptId}/check-results`,
} as const;