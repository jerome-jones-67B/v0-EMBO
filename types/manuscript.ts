export interface Manuscript {
  id: string
  msid: string
  receivedDate: string
  title: string
  authors: string
  doi?: string
  accessionNumber?: string
  assignedTo?: string
  status: string
  workflowState: 'pending' | 'in-review' | 'ready' | 'completed' | 'on-hold'
  priority: Priority
  hasErrors: boolean
  hasWarnings: boolean
  notes: string
  lastModified: string
  displayStatus: string
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
  isMapped: boolean
  unmappedFields: string[]
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type SortField = 'receivedDate' | 'title' | 'authors' | 'status' | 'assignedTo' | 'priority' | 'lastModified'

export type SortDirection = 'asc' | 'desc'

export interface FilterState {
  search: string
  status: string
  priority: string
  assignedTo: string
}

export interface SortState {
  field: SortField
  direction: SortDirection
}

export interface ColumnVisibility {
  receivedDate: boolean
  title: boolean
  authors: boolean
  doi: boolean
  assignedTo: boolean
  status: boolean
  priority: boolean
  actions: boolean
}

export interface DownloadProgress {
  [key: string]: {
    progress: number
    status: 'downloading' | 'completed' | 'error'
    filename?: string
  }
}

export interface ManuscriptDashboardState {
  manuscripts: Manuscript[]
  apiManuscripts: Manuscript[]
  filteredManuscripts: Manuscript[]
  selectedManuscripts: Set<string>
  activeTab: string
  filters: FilterState
  sort: SortState
  columnVisibility: ColumnVisibility
  downloadProgress: DownloadProgress
  useApiData: boolean
  isLoadingApi: boolean
  isInitialLoadComplete: boolean
  showOnlyMine: boolean
}