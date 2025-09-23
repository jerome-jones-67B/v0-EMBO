import { useState, useMemo } from 'react'
import type { 
  Manuscript, 
  FilterState, 
  SortState, 
  ColumnVisibility, 
  DownloadProgress,
  ManuscriptDashboardState 
} from '@/types/manuscript'

const initialFilters: FilterState = {
  search: '',
  status: 'all',
  priority: 'all',
  assignedTo: 'all'
}

const initialSort: SortState = {
  field: 'receivedDate',
  direction: 'desc'
}

const initialColumnVisibility: ColumnVisibility = {
  receivedDate: true,
  title: true,
  authors: true,
  doi: true,
  assignedTo: true,
  status: true,
  priority: true,
  actions: true
}

export function useManuscriptState() {
  // Core manuscript data
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([])
  const [apiManuscripts, setApiManuscripts] = useState<Manuscript[]>([])
  const [selectedManuscripts, setSelectedManuscripts] = useState<Set<string>>(new Set())
  
  // UI state
  const [activeTab, setActiveTab] = useState('all')
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [sort, setSort] = useState<SortState>(initialSort)
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(initialColumnVisibility)
  const [showOnlyMine, setShowOnlyMine] = useState(false)
  
  // Loading and data source state
  const [useApiData, setUseApiData] = useState(false)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({})

  // Computed state
  const state: ManuscriptDashboardState = useMemo(() => ({
    manuscripts,
    apiManuscripts,
    filteredManuscripts: [], // Will be computed by useManuscriptOperations
    selectedManuscripts,
    activeTab,
    filters,
    sort,
    columnVisibility,
    downloadProgress,
    useApiData,
    isLoadingApi,
    isInitialLoadComplete,
    showOnlyMine
  }), [
    manuscripts,
    apiManuscripts,
    selectedManuscripts,
    activeTab,
    filters,
    sort,
    columnVisibility,
    downloadProgress,
    useApiData,
    isLoadingApi,
    isInitialLoadComplete,
    showOnlyMine
  ])

  return {
    // State
    state,
    
    // Setters
    setManuscripts,
    setApiManuscripts,
    setSelectedManuscripts,
    setActiveTab,
    setFilters,
    setSort,
    setColumnVisibility,
    setShowOnlyMine,
    setUseApiData,
    setIsLoadingApi,
    setIsInitialLoadComplete,
    setDownloadProgress,
    
    // Helper functions
    updateFilter: (key: keyof FilterState, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }))
    },
    
    updateSort: (field: SortState['field'], direction?: SortState['direction']) => {
      setSort(prev => ({
        field,
        direction: direction || (prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc')
      }))
    },
    
    toggleColumnVisibility: (column: keyof ColumnVisibility) => {
      setColumnVisibility(prev => ({ ...prev, [column]: !prev[column] }))
    },
    
    clearFilters: () => {
      setFilters(initialFilters)
    },
    
    selectAllManuscripts: (manuscripts: Manuscript[]) => {
      setSelectedManuscripts(new Set(manuscripts.map(m => m.id)))
    },
    
    clearSelection: () => {
      setSelectedManuscripts(new Set())
    },
    
    toggleManuscriptSelection: (manuscriptId: string) => {
      setSelectedManuscripts(prev => {
        const newSet = new Set(prev)
        if (newSet.has(manuscriptId)) {
          newSet.delete(manuscriptId)
        } else {
          newSet.add(manuscriptId)
        }
        return newSet
      })
    }
  }
}