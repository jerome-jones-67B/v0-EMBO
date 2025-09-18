// Status mapping utilities for API data to UI display

export interface StatusMapping {
  apiStatus: string;
  displayStatus: string;
  workflowState: string;
  priority: string;
  qcStatus: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  isMapped: boolean;
}

// API status to UI mapping
export const STATUS_MAPPINGS: Record<string, StatusMapping> = {
  'received': {
    apiStatus: 'received',
    displayStatus: 'New submission',
    workflowState: 'ready-for-curation',
    priority: 'normal',
    qcStatus: 'needs-validation',
    badgeVariant: 'outline',
    isMapped: true
  },
  'segmented': {
    apiStatus: 'segmented',
    displayStatus: 'In Progress',
    workflowState: 'ready-for-curation',
    priority: 'normal',
    qcStatus: 'needs-validation',
    badgeVariant: 'secondary',
    isMapped: true
  },
  'submitted': {
    apiStatus: 'submitted',
    displayStatus: 'New submission',
    workflowState: 'ready-for-curation',
    priority: 'medium',
    qcStatus: 'needs-validation',
    badgeVariant: 'default',
    isMapped: true
  },
  'in_progress': {
    apiStatus: 'in_progress',
    displayStatus: 'In Progress',
    workflowState: 'ready-for-curation',
    priority: 'high',
    qcStatus: 'needs-validation',
    badgeVariant: 'secondary',
    isMapped: true
  },
  'needs_revision': {
    apiStatus: 'needs_revision',
    displayStatus: 'Needs Revision',
    workflowState: 'ready-for-curation',
    priority: 'high',
    qcStatus: 'needs-validation',
    badgeVariant: 'destructive',
    isMapped: true
  },
  'approved': {
    apiStatus: 'approved',
    displayStatus: 'Approved',
    workflowState: 'deposited-to-biostudies',
    priority: 'low',
    qcStatus: 'validated',
    badgeVariant: 'outline',
    isMapped: true
  },
  'published': {
    apiStatus: 'published',
    displayStatus: 'Published',
    workflowState: 'deposited-to-biostudies',
    priority: 'low',
    qcStatus: 'validated',
    badgeVariant: 'outline',
    isMapped: true
  },
  'rejected': {
    apiStatus: 'rejected',
    displayStatus: 'Rejected',
    workflowState: 'no-pipeline-results',
    priority: 'low',
    qcStatus: 'validated',
    badgeVariant: 'destructive',
    isMapped: true
  },
  'deposited': {
    apiStatus: 'deposited',
    displayStatus: 'Deposited',
    workflowState: 'deposited-to-biostudies',
    priority: 'low',
    qcStatus: 'validated',
    badgeVariant: 'outline',
    isMapped: true
  },
  'api-error': {
    apiStatus: 'api-error',
    displayStatus: 'API Error',
    workflowState: 'no-pipeline-results',
    priority: 'high',
    qcStatus: 'needs-validation',
    badgeVariant: 'destructive',
    isMapped: true
  }
};

// Unmapped status fallback
export const UNMAPPED_STATUS: StatusMapping = {
  apiStatus: 'unknown',
  displayStatus: 'Unknown Status',
  workflowState: 'no-pipeline-results',
  priority: 'medium',
  qcStatus: 'needs-validation',
  badgeVariant: 'destructive',
  isMapped: false
};

// Get status mapping for an API status
export function getStatusMapping(apiStatus: string): StatusMapping {
  const normalizedStatus = apiStatus.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return STATUS_MAPPINGS[normalizedStatus] || {
    ...UNMAPPED_STATUS,
    apiStatus: apiStatus,
    displayStatus: `Unmapped: ${apiStatus}`,
  };
}

// Get all valid statuses for a workflow tab
export function getValidStatusesForTab(tab: string): string[] {
  const statuses = Object.values(STATUS_MAPPINGS)
    .filter(mapping => mapping.workflowState === tab)
    .map(mapping => mapping.displayStatus);
  
  return statuses;
}

// Check if a field is mapped correctly
export function isFieldMapped(fieldName: string, value: any): boolean {
  switch (fieldName) {
    case 'status':
      return getStatusMapping(value).isMapped;
    case 'priority':
      return ['low', 'medium', 'high', 'urgent'].includes(value);
    case 'qcStatus':
      return ['needs-validation', 'validated', 'failed'].includes(value);
    case 'workflowState':
      return ['ready-for-curation', 'deposited-to-biostudies', 'no-pipeline-results'].includes(value);
    default:
      return true; // Assume mapped if we don't have specific validation
  }
}

// Get unmapped fields for highlighting
export function getUnmappedFields(manuscript: any): string[] {
  const unmappedFields: string[] = [];
  
  if (!isFieldMapped('status', manuscript.status)) {
    unmappedFields.push('status');
  }
  
  if (manuscript.priority && !isFieldMapped('priority', manuscript.priority)) {
    unmappedFields.push('priority');
  }
  
  if (manuscript.qcStatus && !isFieldMapped('qcStatus', manuscript.qcStatus)) {
    unmappedFields.push('qcStatus');
  }
  
  if (manuscript.workflowState && !isFieldMapped('workflowState', manuscript.workflowState)) {
    unmappedFields.push('workflowState');
  }
  
  return unmappedFields;
}
