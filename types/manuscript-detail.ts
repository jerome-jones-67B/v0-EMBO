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
}

export interface Figure {
  id: string
  title: string
  legend: string
  panels: FigurePanel[]
  qualityChecks: QualityCheck[]
}

export interface FigurePanel {
  id: string
  description: string
  legend: string
  imagePath: string
  qualityChecks: QualityCheck[]
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
  selectedView: 'manuscript' | 'list'
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