export interface ManuscriptDetailData {
  id: string
  msid: string
  title: string
  authors: string
  receivedDate: string
  doi?: string
  accessionNumber?: string
  assignedTo?: string
  status: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes: string
  lastModified: string
  figures: Figure[]
  qcChecks: QualityCheck[]
  source_data?: Array<{
    file_id: number
    id: number
  }>
  links?: any[]
}

export interface Figure {
  id: number
  label: string
  title: string
  caption: string
  caption_confidence: number
  image_file_id: number
  sort_order: number
  source_data: Array<{
    file_id: number
    id: number
  }>
  links: any[]
  check_results: any[]
  panels: FigurePanel[]
}

export interface FigurePanel {
  id: number
  label: string
  caption: string
  x1: number | null
  y1: number | null
  x2: number | null
  y2: number | null
  confidence: number | null
  sort_order: number
  source_data: Array<{
    file_id: number
    id: number
  }>
  links: any[]
  check_results: any[]
}

export interface QualityCheck {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  message: string
  severity: 'low' | 'medium' | 'high'
  category: string
  details?: string
}

export interface LinkedDataItem {
  id: string
  type: string
  identifier: string
  url: string
  description: string
  isCustom?: boolean
}

export interface SourceDataFile {
  id: string
  type: string
  name: string
  size: string
  url: string
  description: string
  mappedElements?: string[] // Elements this file is mapped to (from API)
  originalUri?: string // Original file path for tree structure
}

export interface ManuscriptDetailState {
  selectedView: 'manuscript' | 'figure-list' | 'file-tree' | 'validation' | 'ai-qc'
  selectedFigureIndex: number
  linkedData: LinkedDataItem[]
  sourceData: SourceDataFile[]
  manuscript: ManuscriptDetailData | null
  notes: string
  dataAvailability: {
    hasSourceData: boolean
    hasLinkedData: boolean
    hasQcData: boolean
  }
  isLoading: boolean
  error: string | null
}
