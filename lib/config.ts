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
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true', // Toggle based on environment variable
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
  
  // Data4Rev API Configuration
  DATA4REV_API_BASE: process.env.DATA4REV_API_BASE_URL || 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api',
} as const;

// API Endpoints - paths relative to base URL (no /api prefix needed)
export const endpoints = {
  manuscripts: '/v1/manuscripts',
  manuscriptDetails: (id: string) => `/v1/manuscripts/${id}`,
  manuscriptContent: (id: string) => `/v1/manuscripts/${id}/content`,
  manuscriptDeposit: (id: string) => `/v1/manuscripts/${id}/deposit`,
  figures: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/figures`,
  figure: (manuscriptId: string, figureId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}`,
  panels: (manuscriptId: string, figureId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels`,
  panel: (manuscriptId: string, figureId: string, panelId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels/${panelId}`,
  links: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/links`,
  link: (manuscriptId: string, linkId: string) => `/v1/manuscripts/${manuscriptId}/links/${linkId}`,
  sourceData: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/source-data`,
  sourceDataItem: (manuscriptId: string, sourceDataId: string) => `/v1/manuscripts/${manuscriptId}/source-data/${sourceDataId}`,
  files: '/v1/files',
  file: (fileId: string) => `/v1/files/${fileId}`,
  checkResults: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/check-results`,
} as const;