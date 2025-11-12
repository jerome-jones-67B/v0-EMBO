// Configuration for API endpoints and environment settings


export const config = {
  // API Configuration - Now points directly to Data4Rev API for static builds
  api: {
    baseUrl: process.env.NEXT_PUBLIC_DATA4REV_API_BASE_URL || 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
    retries: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '3'),
    token: process.env.NEXT_PUBLIC_DATA4REV_AUTH_TOKEN,
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

  // Data4Rev API Configuration (kept for backward compatibility)
  DATA4REV_API_BASE: process.env.NEXT_PUBLIC_DATA4REV_API_BASE_URL || 'https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api',
} as const;

// Utility function to build full API URLs
export function buildApiUrl(endpoint: string): string {
  if (!endpoint) {
    return config.api.baseUrl;
  }
  const baseUrl = config.api.baseUrl.endsWith('/') ? config.api.baseUrl.slice(0, -1) : config.api.baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

// API Endpoints - paths relative to base URL (no /api prefix needed)
export const endpoints = {
  manuscripts: '/v1/manuscripts',
  manuscriptDetails: (id: string) => `/v1/manuscripts/${id}`,
  manuscriptContent: (id: string) => `/v1/manuscripts/${id}/content`,
  manuscriptDeposit: (id: string) => `/v1/manuscripts/${id}/deposit`,
  figures: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/figures`,
  figure: (manuscriptId: string, figureId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}`,
  figuresMove: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/figures/move`,
  panels: (manuscriptId: string, figureId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels`,
  panel: (manuscriptId: string, figureId: string, panelId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels/${panelId}`,
  panelsMove: (manuscriptId: string, figureId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels/move`,
  links: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/links`,
  link: (manuscriptId: string, linkId: string) => `/v1/manuscripts/${manuscriptId}/links/${linkId}`,
  figureLinks: (manuscriptId: string, figureId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/links`,
  figureLink: (manuscriptId: string, figureId: string, linkId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/links/${linkId}`,
  panelLinks: (manuscriptId: string, figureId: string, panelId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels/${panelId}/links`,
  panelLink: (manuscriptId: string, figureId: string, panelId: string, linkId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels/${panelId}/links/${linkId}`,
  sourceData: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/source-data`,
  sourceDataItem: (manuscriptId: string, sourceDataId: string) => `/v1/manuscripts/${manuscriptId}/source-data/${sourceDataId}`,
  figureSourceData: (manuscriptId: string, figureId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/source-data`,
  panelSourceData: (manuscriptId: string, figureId: string, panelId: string) => `/v1/manuscripts/${manuscriptId}/figures/${figureId}/panels/${panelId}/source-data`,
  files: '/v1/files',
  file: (fileId: string) => `/v1/files/${fileId}`,
  manuscriptFiles: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/files`,
  manuscriptFileDownload: (manuscriptId: string, fileId: string) => `/v1/manuscripts/${manuscriptId}/files/${fileId}/download`,
  manuscriptFilePreview: (manuscriptId: string, fileId: string) => `/v1/manuscripts/${manuscriptId}/files/${fileId}/preview`,
  checkResults: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/check-results`,
  checks: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/checks`,
  messages: '/v1/messages',
  manuscriptValidation: (manuscriptId: string) => `/v1/manuscripts/${manuscriptId}/validation`,
} as const;
