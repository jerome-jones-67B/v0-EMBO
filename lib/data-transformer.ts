// Data transformation utilities to convert API data to UI format

// Transform API manuscript to UI manuscript structure
export function transformApiManuscriptToUI(apiManuscript: any): any {
  return {
    // UI structure (matching mock data)
    id: apiManuscript.id, // Keep as integer for API calls
    msid: apiManuscript.msid,
    title: apiManuscript.title,
    authors: apiManuscript.authors,
    doi: apiManuscript.doi,
    abstract: apiManuscript.abstract || apiManuscript.note,
    notes: apiManuscript.notes || apiManuscript.note,
    status: apiManuscript.status,
    displayStatus: getStatusMapping(apiManuscript.status).displayStatus,
    workflowState: getStatusMapping(apiManuscript.status).workflowState,
    receivedDate: apiManuscript.received_at,
    lastModified: apiManuscript.modified_at || apiManuscript.received_at,
    assignedTo: apiManuscript.assigned_to || 'Unassigned',
    modifiedBy: apiManuscript.modified_by || 'System',
    priority: apiManuscript.priority || 'normal',
    dataAvailability: apiManuscript.data_availability || 'Not specified',
    keywords: apiManuscript.keywords || [],
    figures: apiManuscript.figures?.map(transformApiFigureToUI) || [],
    linkedData: transformLinksToLinkedData(apiManuscript.links || []),
    qcChecks: transformCheckResultsToQCChecks(apiManuscript.check_results || []),
    
    // API fields for compatibility
    received_at: apiManuscript.received_at,
    modified_at: apiManuscript.modified_at,
    assigned_to: apiManuscript.assigned_to,
    modified_by: apiManuscript.modified_by,
    data_availability: apiManuscript.data_availability,
    check_results: apiManuscript.check_results || [],
    links: apiManuscript.links || [],
    
    // Mapping status
    isMapped: true,
    unmappedFields: ['assignedTo', 'modifiedBy', 'dataAvailability']
  };
}

// Transform API figure to UI figure structure
export function transformApiFigureToUI(apiFigure: any): any {
  return {
    // UI structure (matching mock data)
    id: apiFigure.id.toString(),
    title: apiFigure.label,
    legend: apiFigure.caption,
    panels: apiFigure.panels?.map(transformApiPanelToUI) || [],
    qcChecks: transformCheckResultsToQCChecks(apiFigure.check_results || []),
    
    // API fields for compatibility
    label: apiFigure.label,
    caption: apiFigure.caption,
    sort_order: apiFigure.sort_order,
    links: apiFigure.links || [],
    source_data: apiFigure.source_data || [],
    check_results: apiFigure.check_results || [],
    linkedData: transformLinksToLinkedData(apiFigure.links || [])
  };
}

// Transform API panel to UI panel structure
export function transformApiPanelToUI(apiPanel: any): any {
  return {
    // UI structure (matching mock data)
    id: apiPanel.id.toString(),
    description: apiPanel.label,
    legend: apiPanel.caption,
    hasIssues: hasPanelIssues(apiPanel.check_results || []),
    
    // API fields for compatibility
    label: apiPanel.label,
    caption: apiPanel.caption,
    coordinates: apiPanel.coordinates,
    check_results: apiPanel.check_results || []
  };
}

// Transform check results to QC checks format
export function transformCheckResultsToQCChecks(checkResults: any[]): any[] {
  return checkResults.map(check => ({
    id: check.id?.toString() || Math.random().toString(),
    type: mapCheckStatusToType(check.status),
    message: check.message || check.description,
    details: check.details || check.message,
    aiGenerated: check.ai_generated || false,
    dismissed: check.dismissed || false,
    panelId: check.panel_id?.toString(),
    timestamp: check.timestamp || new Date().toISOString()
  }));
}

// Transform links to linked data format
export function transformLinksToLinkedData(links: any[]): any[] {
  return links.map(link => ({
    id: link.id?.toString() || Math.random().toString(),
    type: link.type || 'Repository',
    identifier: link.identifier || link.url,
    url: link.url,
    description: link.description || `${link.type || 'Repository'} link`,
    panelId: link.panel_id?.toString()
  }));
}

// Status mapping utility
export function getStatusMapping(status: string) {
  const statusMap: Record<string, any> = {
    'submitted': {
      displayStatus: 'Submitted',
      workflowState: 'Under Review',
      badgeVariant: 'secondary',
      priority: 'normal'
    },
    'under_review': {
      displayStatus: 'Under Review',
      workflowState: 'In Progress',
      badgeVariant: 'default',
      priority: 'normal'
    },
    'revision_requested': {
      displayStatus: 'Revision Requested',
      workflowState: 'Awaiting Author',
      badgeVariant: 'destructive',
      priority: 'high'
    },
    'accepted': {
      displayStatus: 'Accepted',
      workflowState: 'Complete',
      badgeVariant: 'default',
      priority: 'normal'
    },
    'rejected': {
      displayStatus: 'Rejected',
      workflowState: 'Complete',
      badgeVariant: 'destructive',
      priority: 'normal'
    }
  };
  
  return statusMap[status] || {
    displayStatus: status,
    workflowState: 'Unknown',
    badgeVariant: 'outline',
    priority: 'normal'
  };
}

// Helper functions
function mapCheckStatusToType(status: string): string {
  const typeMap: Record<string, string> = {
    'error': 'error',
    'warning': 'warning',
    'info': 'info',
    'success': 'info'
  };
  return typeMap[status] || 'info';
}

function hasPanelIssues(checkResults: any[]): boolean {
  return checkResults.some(check => 
    check.status === 'error' || check.status === 'warning'
  );
}

