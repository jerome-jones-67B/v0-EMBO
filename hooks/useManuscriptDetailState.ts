import { useState, useMemo } from 'react'
import type { 
  ManuscriptDetailData, 
  LinkedDataItem, 
  SourceDataFile, 
  ManuscriptDetailState 
} from '@/types/manuscript-detail'

const initialLinkedData: LinkedDataItem[] = [
  {
    id: '1',
    type: 'Database Entry',
    identifier: 'UniProt:P12345',
    url: 'https://www.uniprot.org/uniprot/P12345',
    description: 'Hsp70 protein sequence and annotations',
    isCustom: false
  },
  {
    id: '2',
    type: 'Structure',
    identifier: 'PDB:8ABC',
    url: 'https://www.rcsb.org/structure/8ABC',
    description: 'Crystal structure of Hsp70 ATPase domain',
    isCustom: false
  },
  {
    id: '3',
    type: 'Dataset',
    identifier: 'GEO:GSE123456',
    url: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE123456',
    description: 'RNA-seq data for heat shock response',
    isCustom: false
  }
]

const initialSourceData: SourceDataFile[] = [
  {
    id: '1',
    type: 'Raw Data',
    name: 'western_blot_quantification.xlsx',
    size: '2.1 MB',
    url: '/api/files/western_blot_quantification.xlsx',
    description: 'Quantification data for all Western blot experiments'
  },
  {
    id: '2',
    type: 'Analysis Script',
    name: 'statistical_analysis.R',
    size: '45 KB',
    url: '/api/files/statistical_analysis.R',
    description: 'R script used for statistical analysis and plotting'
  },
  {
    id: '3',
    type: 'Processed Data',
    name: 'aggregated_results.csv',
    size: '890 KB',
    url: '/api/files/aggregated_results.csv',
    description: 'Processed and aggregated experimental results'
  }
]

export function useManuscriptDetailState() {
  // Core state
  const [selectedView, setSelectedView] = useState<'manuscript' | 'list'>('manuscript')
  const [selectedFigureIndex, setSelectedFigureIndex] = useState(0)
  const [manuscript, setManuscript] = useState<ManuscriptDetailData | null>(null)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data state
  const [linkedData, setLinkedData] = useState<LinkedDataItem[]>(initialLinkedData)
  const [sourceData, setSourceData] = useState<SourceDataFile[]>(initialSourceData)

  // Data availability state
  const [dataAvailability, setDataAvailability] = useState({
    hasSourceData: true,
    hasLinkedData: true,
    hasQcData: true
  })

  // Computed state
  const state: ManuscriptDetailState = useMemo(() => ({
    selectedView,
    selectedFigureIndex,
    linkedData,
    sourceData,
    manuscript,
    notes,
    dataAvailability,
    isLoading,
    error
  }), [
    selectedView,
    selectedFigureIndex,
    linkedData,
    sourceData,
    manuscript,
    notes,
    dataAvailability,
    isLoading,
    error
  ])

  return {
    // State
    state,
    
    // Setters
    setSelectedView,
    setSelectedFigureIndex,
    setManuscript,
    setNotes,
    setIsLoading,
    setError,
    setLinkedData,
    setSourceData,
    setDataAvailability,
    
    // Helper functions
    addLinkedData: (item: Omit<LinkedDataItem, 'id'>) => {
      const newItem: LinkedDataItem = {
        ...item,
        id: Date.now().toString(),
        isCustom: true
      }
      setLinkedData(prev => [...prev, newItem])
    },
    
    removeLinkedData: (id: string) => {
      setLinkedData(prev => prev.filter(item => item.id !== id))
    },
    
    updateLinkedData: (id: string, updates: Partial<LinkedDataItem>) => {
      setLinkedData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ))
    },
    
    addSourceData: (file: Omit<SourceDataFile, 'id'>) => {
      const newFile: SourceDataFile = {
        ...file,
        id: Date.now().toString()
      }
      setSourceData(prev => [...prev, newFile])
    },
    
    removeSourceData: (id: string) => {
      setSourceData(prev => prev.filter(file => file.id !== id))
    },
    
    nextFigure: () => {
      setSelectedFigureIndex(prev => {
        if (!manuscript?.figures) return prev
        return prev < manuscript.figures.length - 1 ? prev + 1 : prev
      })
    },
    
    previousFigure: () => {
      setSelectedFigureIndex(prev => prev > 0 ? prev - 1 : prev)
    },
    
    clearError: () => {
      setError(null)
    }
  }
}