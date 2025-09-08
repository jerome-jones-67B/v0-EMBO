// TypeScript interfaces for API responses and data structures

// Data4Rev API Types - matching the OpenAPI schema
export interface ManuscriptOverview {
  msid: string;
  journal: string;
  doi: string;
  accession_number: string;
  title: string;
  authors: string;
  id: number;
  received_at: string;
  status: string;
  note: string | null;
}

export interface ManuscriptDetails {
  msid: string;
  journal: string;
  doi: string;
  accession_number: string;
  title: string;
  authors: string;
  id: number;
  received_at: string;
  status: string;
  note: string | null;
  errors: string | null;
  files: FileDetails[];
  figures: FigureDetails[];
  links: LinkDetails[];
  check_results: CheckResultDetails[];
  source_data: SourceDataDetails[];
  deposition_events: DepositionEventDetails[];
}

// Keep the old interface for backward compatibility
export interface Manuscript {
  // Data4Rev API fields
  msid: string;
  journal: string;
  doi: string;
  accession_number: string;
  title: string;
  authors: string;
  id: number;
  received_at: string;
  status: string;
  note: string | null;
  
  // Backward compatibility fields (mapped from above)
  received: string; // maps to received_at
  lastModified: string; // maps to received_at for now
  assignedTo: string | null; // not in API, will be null
  priority: string; // not in API, will be derived from status
  figureCount: number; // will be calculated from figures array
  qcStatus: string; // will be derived from check_results
  abstract?: string;
  keywords?: string[];
  submissionType?: string;
  wordCount?: number;
  collaborators?: string[];
  
  // UI-specific fields for proper status mapping
  displayStatus?: string; // mapped display status
  workflowState?: string; // mapped workflow state
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'; // badge styling
  isMapped?: boolean; // whether this field is properly mapped
  unmappedFields?: string[]; // list of unmapped fields for highlighting
}

// Data4Rev API Figure types
export interface FigureDetails {
  label: string;
  caption: string;
  sort_order: number;
  id: number;
  panels: PanelDetails[];
  links: LinkDetails[];
  source_data: SourceDataDetails[];
  check_results: CheckResultDetails[];
}

export interface PanelDetails {
  label: string;
  caption: string;
  x1: number | null;
  y1: number | null;
  x2: number | null;
  y2: number | null;
  confidence: number | null;
  sort_order: number;
  id: number;
  links: LinkDetails[];
  source_data: SourceDataDetails[];
  check_results: CheckResultDetails[];
}

export interface LinkDetails {
  name: string;
  uri: string;
  identifier: string | null;
  database: string | null;
  id: number;
}

export interface CheckResultDetails {
  check_name: string;
  status: string;
  message: string | null;
  details: string | null;
  id: number;
}

export interface SourceDataDetails {
  file_id: number;
  id: number;
}

export interface FileDetails {
  filename: string;
  content_type: string;
  size: number;
  id: number;
}

export interface DepositionEventDetails {
  repository: string;
  status: string;
  message: string | null;
  details: string | null;
  timestamp: string;
  id: number;
}

// Backward compatibility interfaces
export interface Figure extends FigureDetails {
  title: string; // maps to label
  legend: string; // maps to caption
  linkedData: LinkedDataEntry[]; // maps to links
  panels: Panel[];
  qcChecks: QCCheck[]; // maps to check_results
}

export interface Panel extends PanelDetails {
  description: string; // maps to label
  legend: string; // maps to caption
  hasIssues: boolean; // derived from check_results
}

export interface QCCheck {
  type: 'info' | 'warning' | 'error';
  message: string;
  details: string;
  aiGenerated: boolean;
  dismissed: boolean;
}

export interface LinkedDataEntry {
  type: string; // maps to database
  identifier: string; // maps to identifier
  url: string; // maps to uri
  description: string; // maps to name
}

export interface SourceData {
  name: string;
  filename: string;
  url: string;
  size?: string;
  type?: string;
  uploadDate?: string;
  description?: string;
}

export interface Author {
  id: string;
  name: string;
  email: string;
  institution: string;
  orcid: string;
}

export interface Editor {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

export interface Reviewer {
  id: string;
  name: string;
  email: string;
  institution: string;
  expertise: string[];
  reviewCount: number;
  averageReviewTime: number;
}

export interface Comment {
  id: string;
  manuscriptId: string;
  author: string;
  authorRole: string;
  timestamp: string;
  content: string;
  type: string;
  resolved: boolean;
}

export interface Version {
  id: string;
  manuscriptId: string;
  version: string;
  uploadDate: string;
  status: string;
  changes: string;
  fileCount: number;
  totalSize: string;
}

export interface Task {
  id: string;
  manuscriptId: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: string;
  status: string;
  dueDate: string;
  createdDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: string;
}

export interface CollaborationRequest {
  id: string;
  fromUser: string;
  toUser: string;
  manuscriptId: string;
  type: string;
  status: string;
  message: string;
  timestamp: string;
}

// Data4Rev API Response types
export interface ManuscriptsOverviewPage {
  manuscripts: ManuscriptOverview[];
  total: number;
}

// Generic API Response types (for our wrapper)
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  success: boolean;
  message?: string;
}

// Create/Update types for Data4Rev API
export interface FigureCreate {
  label: string;
  caption: string;
  sort_order: number;
  panels: PanelCreate[];
  links: LinkCreate[];
  source_data: SourceDataCreate[];
  check_results?: CheckResultCreate[];
}

export interface PanelCreate {
  label: string;
  caption: string;
  x1: number | null;
  y1: number | null;
  x2: number | null;
  y2: number | null;
  confidence: number | null;
  sort_order: number;
  links: LinkCreate[];
  source_data: SourceDataCreate[];
  check_results?: CheckResultCreate[];
}

export interface LinkCreate {
  name: string;
  uri: string;
  identifier?: string | null;
  database?: string | null;
}

export interface SourceDataCreate {
  file_id: number;
}

export interface CheckResultCreate {
  check_name: string;
  status: string;
  message?: string | null;
  details?: string | null;
}