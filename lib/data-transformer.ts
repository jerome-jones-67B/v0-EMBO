// Data transformation utilities for converting API data to UI data structures

import { 
  ManuscriptDetails, 
  FigureDetails, 
  PanelDetails, 
  CheckResultDetails, 
  LinkDetails,
  SourceDataDetails,
  Manuscript,
  Figure,
  Panel,
  QCCheck,
  LinkedDataEntry
} from './types';

// Transform API manuscript details to UI manuscript structure
export function transformApiManuscriptToUI(apiManuscript: ManuscriptDetails): any {
  return {
    // UI structure (matching mock data)
    id: apiManuscript.id, // Keep as integer for API calls
    msid: apiManuscript.msid,
    title: apiManuscript.title,
    authors: apiManuscript.authors.split(',').map((author: string) => author.trim()),
    received: apiManuscript.received_at.split('T')[0],
    doi: apiManuscript.doi,
    lastModified: apiManuscript.received_at,
    status: apiManuscript.status,
    assignedTo: "Dr. Sarah Wilson", // Not available in API
    currentStatus: mapStatusToDisplay(apiManuscript.status),
    modifiedBy: "Dr. Sarah Chen", // Not available in API
    priority: derivePriorityFromStatus(apiManuscript.status).toLowerCase(),
    
    // Content fields
    abstract: apiManuscript.note || "No abstract available",
    keywords: [], // Not in API, will be empty
    notes: apiManuscript.note || "No additional notes",
    dataAvailability: "Available", // Not in API
    
    // Transform figures to match expected structure
    figures: apiManuscript.figures?.map(transformApiFigureToUI) || [],
    
    // Transform other data
    linkedData: transformLinksToLinkedData(apiManuscript.links || []),
    linkedInfo: transformLinksToLinkedData(apiManuscript.links || []),
    
    // Status mapping
    displayStatus: mapStatusToDisplay(apiManuscript.status),
    workflowState: mapStatusToWorkflow(apiManuscript.status),
    badgeVariant: mapStatusToBadgeVariant(apiManuscript.status),
    isMapped: true,
    unmappedFields: ['assignedTo', 'modifiedBy', 'dataAvailability']
  };
}

// Transform API figure to UI figure structure
export function transformApiFigureToUI(apiFigure: FigureDetails): any {
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
export function transformApiPanelToUI(apiPanel: PanelDetails): any {
  return {
    // UI structure (matching mock data)
    id: apiPanel.id.toString(),
    description: apiPanel.label,
    legend: apiPanel.caption,
    hasIssues: hasPanelIssues(apiPanel.check_results || []),
    
    // API fields for compatibility
    label: apiPanel.label,
    caption: apiPanel.caption,
    x1: apiPanel.x1,
    y1: apiPanel.y1,
    x2: apiPanel.x2,
    y2: apiPanel.y2,
    confidence: apiPanel.confidence,
    sort_order: apiPanel.sort_order,
    links: apiPanel.links || [],
    source_data: apiPanel.source_data || [],
    check_results: apiPanel.check_results || []
  };
}

// Transform API check results to UI QC checks
export function transformCheckResultsToQCChecks(checkResults: CheckResultDetails[]): QCCheck[] {
  return checkResults.map(check => ({
    type: mapCheckStatusToType(check.status),
    message: check.message || check.check_name,
    details: check.details || '',
    aiGenerated: true, // Assume all API checks are AI generated
    dismissed: false
  }));
}

// Transform API links to UI linked data
export function transformLinksToLinkedData(links: LinkDetails[]): LinkedDataEntry[] {
  return links.map(link => ({
    type: link.database || 'Unknown',
    identifier: link.identifier || link.id.toString(),
    url: link.uri,
    description: link.name
  }));
}

// Helper functions for status mapping
function derivePriorityFromStatus(status: string): string {
  const priorityMap: { [key: string]: string } = {
    'submitted': 'High',
    'under_review': 'High',
    'revision_requested': 'Medium',
    'accepted': 'Low',
    'rejected': 'Low'
  };
  return priorityMap[status] || 'Medium';
}

function deriveQCStatusFromCheckResults(checkResults: CheckResultDetails[]): string {
  if (!checkResults || checkResults.length === 0) return 'Pending';
  
  const hasErrors = checkResults.some(check => check.status === 'error');
  const hasWarnings = checkResults.some(check => check.status === 'warning');
  
  if (hasErrors) return 'Issues Found';
  if (hasWarnings) return 'Warnings';
  return 'Passed';
}

function mapStatusToDisplay(status: string): string {
  const statusMap: { [key: string]: string } = {
    'submitted': 'Submitted',
    'under_review': 'Under Review',
    'revision_requested': 'Revision Requested',
    'accepted': 'Accepted',
    'rejected': 'Rejected'
  };
  return statusMap[status] || status;
}

function mapStatusToWorkflow(status: string): string {
  const workflowMap: { [key: string]: string } = {
    'submitted': 'Initial Review',
    'under_review': 'Peer Review',
    'revision_requested': 'Author Revision',
    'accepted': 'Production',
    'rejected': 'Archived'
  };
  return workflowMap[status] || 'Unknown';
}

function mapStatusToBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variantMap: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'submitted': 'secondary',
    'under_review': 'default',
    'revision_requested': 'outline',
    'accepted': 'default',
    'rejected': 'destructive'
  };
  return variantMap[status] || 'default';
}

function mapCheckStatusToType(status: string): 'info' | 'warning' | 'error' {
  const typeMap: { [key: string]: 'info' | 'warning' | 'error' } = {
    'pass': 'info',
    'warning': 'warning',
    'error': 'error',
    'fail': 'error'
  };
  return typeMap[status] || 'info';
}

function hasPanelIssues(checkResults: CheckResultDetails[]): boolean {
  return checkResults.some(check => 
    check.status === 'error' || check.status === 'warning' || check.status === 'fail'
  );
}
