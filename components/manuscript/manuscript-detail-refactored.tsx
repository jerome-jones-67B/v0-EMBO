"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { SafeRender, SafeString } from "@/components/shared/safe-render"
import { ManuscriptHeader } from "./manuscript-header"
import { FigureViewer } from "./figure-viewer"
import { SourceFilesTreeview } from "./source-files-treeview"
import { FigureList } from "./figure-list"
import { ChecksTable } from "./checks-table"
import { ManuscriptOverviewTabs } from "./manuscript-overview-tabs"
import { Image, X, Loader2, Plus, Trash2, Upload, GripVertical, ChevronDown, ChevronRight, List, Grid, AlertTriangle, AlertCircle } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useManuscriptDetailState } from "@/hooks/useManuscriptDetailState"
import { useManuscriptDetailApi } from "@/hooks/useManuscriptDetailApi"
import { ManuscriptLoadingScreen } from '@/components/manuscript-loading-screen'
import { dataService } from '@/lib/data-service'
import { api } from '@/lib/api-client'
import type { ManuscriptDetailData } from '@/types/manuscript-detail'

// Helper function to generate available elements for mapping based on manuscript data
const generateAvailableElements = (manuscript: ManuscriptDetailData | null) => {
  const elements = [{ value: 'manuscript', label: 'Manuscript' }]

  if (manuscript?.figures) {
    manuscript.figures.forEach((figure, figIndex) => {
      // Add main figure
      elements.push({
        value: figure.id.toString(),
        label: `Figure ${figIndex + 1}`
      })

      // Add figure panels
      figure.panels.forEach((panel, panelIndex) => {
        const panelLetter = String.fromCharCode(65 + panelIndex) // A, B, C, etc.
        elements.push({
          value: panel.id.toString(),
          label: `Figure ${figIndex + 1}${panelLetter}`
        })
      })
    })
  }

  // Add common supplementary options
  elements.push({ value: 'supplement', label: 'Supplementary' })
  elements.push({ value: 'methods', label: 'Methods' })
  elements.push({ value: 'appendix', label: 'Appendix' })

  return elements
}

// Compact Sortable Figure Item Component for collapsed view
function CompactSortableFigureItem({ figure, onUpload, onDelete, onAddPanel, onDeletePanel }: {
  figure: any
  onUpload: (figureId: number) => void
  onDelete: (figureId: number) => void
  onAddPanel: (figureId: number) => void
  onDeletePanel: (figureId: number, panelId: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: figure.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Image className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{figure.label}</h4>
              <p className="text-sm text-gray-600">Figure {figure.id}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Panel count */}
          {figure.panels && figure.panels.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <span>{figure.panels.length} panel{figure.panels.length !== 1 ? 's' : ''}</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddPanel(figure.id)}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Add panel"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpload(figure.id)}
            className="h-8 w-8 p-0"
            title="Upload new image"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(figure.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete figure"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Panels in collapsed view */}
      {figure.panels && figure.panels.length > 0 && (
        <div className="px-3 pb-3">
          <div className="flex flex-wrap gap-1">
            {figure.panels.map((panel: any, index: number) => {
              const panelLetter = String.fromCharCode(65 + index)
              const panelName = `Figure ${figure.id}${panelLetter}`
              return (
                <div
                  key={panel.id}
                  className="group inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors"
                >
                  <span>{panelName}</span>
                  <button
                    onClick={() => onDeletePanel(figure.id, panel.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800"
                    title="Delete panel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Sortable Figure Item Component
function SortableFigureItem({ figure, figurePreviews, onUpload, onDelete, onAddPanel, onDeletePanel, sensors, onPanelDragEnd }: {
  figure: any
  figurePreviews: Map<number, string>
  onUpload: (figureId: number) => void
  onDelete: (figureId: number) => void
  onAddPanel: (figureId: number) => void
  onDeletePanel: (figureId: number, panelId: number) => void
  sensors: any
  onPanelDragEnd: (event: DragEndEvent, figureId: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: figure.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{figure.label}</h4>
            <p className="text-sm text-gray-600">Figure {figure.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpload(figure.id)}
            className="h-8 w-8 p-0"
            title="Upload new image"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(figure.id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete figure"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        {/* Image and description side by side */}
        <div className="flex gap-4">
          {/* Figure preview - constrained size */}
          <div className="flex-shrink-0">
            {figurePreviews.has(figure.id) ? (
              <div className="w-80 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={figurePreviews.get(figure.id)}
                  alt={figure.label}
                  className="w-full h-auto object-contain max-h-96"
                  onError={(e) => {
                    console.warn(`Failed to load preview for figure ${figure.id}`)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            ) : (
              <div className="w-80 bg-gray-100 rounded-lg flex items-center justify-center" style={{ minHeight: '200px' }}>
                <div className="text-center text-gray-500">
                  <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No preview available</p>
                </div>
              </div>
            )}
          </div>

          {/* Figure caption and description - flexible width */}
          <div className="flex-1">
            {/* Figure Caption */}
            {figure.caption && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="text-sm font-medium text-blue-700 mb-2">Caption</h5>
                <p className="text-sm text-blue-600">{figure.caption}</p>
              </div>
            )}

            {/* Figure Description */}
            {figure.description && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                <p className="text-sm text-gray-600">{figure.description}</p>
              </div>
            )}
          </div>
        </div>

        {figure.panels && figure.panels.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Panels:</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddPanel(figure.id)}
                className="h-7 text-sm gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Panel
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => onPanelDragEnd(event, figure.id)}
            >
              <SortableContext items={figure.panels.map((panel: any) => panel.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {figure.panels.map((panel: any, index: number) => (
                    <SortablePanelItem
                      key={panel.id}
                      panel={panel}
                      figureId={figure.id}
                      figureIndex={figure.id}
                      panelIndex={index}
                      onDelete={onDeletePanel}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  )
}

// Sortable Panel Item Component
function SortablePanelItem({ panel, figureId, figureIndex, panelIndex, onDelete }: {
  panel: any
  figureId: number
  figureIndex: number
  panelIndex: number
  onDelete: (figureId: number, panelId: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: panel.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const panelLetter = String.fromCharCode(65 + panelIndex) // A, B, C, etc.
  const panelName = `Figure ${figureIndex}${panelLetter}`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-blue-200 rounded"
      >
        <GripVertical className="w-3 h-3 text-blue-600" />
      </div>
      <div className="flex-1">
        <div className="font-medium text-blue-800 text-sm">{panelName}</div>
        {panel.label && panel.label !== panelName && (
          <div className="text-xs text-blue-600">{panel.label}</div>
        )}
      </div>
      <button
        onClick={() => onDelete(figureId, panel.id)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
        title="Delete panel"
      >
        <X className="w-3 h-3 text-red-600" />
      </button>
    </div>
  )
}

interface ManuscriptDetailProps {
  msid?: string
  onBack?: () => void
  useApiData?: boolean
}

export function ManuscriptDetailRefactored({ msid, onBack, useApiData = true }: ManuscriptDetailProps = {}) {
  const params = useParams()
  // No longer using session for static builds
  // Use msid prop if provided, otherwise fall back to route params
  const manuscriptId = msid || (params?.id as string)

  // Source data state for real API data
  const [sourceDataFiles, setSourceDataFiles] = useState<any[]>([])
  const [isLoadingSourceData, setIsLoadingSourceData] = useState(false)
  const [sourceDataError, setSourceDataError] = useState<string | null>(null)
  const [showFigurePreview, setShowFigurePreview] = useState(false)
  const [figurePreviews, setFigurePreviews] = useState<Map<number, string>>(new Map())
  const [loadingPreviews, setLoadingPreviews] = useState(false)
  const [isCollapsedView, setIsCollapsedView] = useState(false)
  const [validationChecks, setValidationChecks] = useState<any[]>([])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Prevent duplicate API calls in React StrictMode
  const isInitializingRef = useRef(false)


  // Fetch validation checks to count severity
  const fetchValidationChecks = useCallback(async () => {
    if (!manuscriptId) return

    try {
      console.log('🔍 Fetching validation checks for manuscript:', manuscriptId)
      const validationData = await api.validation.getByManuscriptId(manuscriptId)

      // Transform and filter checks with severity 1 or 2
      const checks = Array.isArray(validationData) ? validationData.filter((check: any) =>
        check.severity === 1 || check.severity === 2
      ) : []

      setValidationChecks(checks)
      console.log('✅ Validation checks loaded:', checks.length, 'with severity 1 or 2')
    } catch (error) {
      console.warn('⚠️ Failed to fetch validation checks:', error)
      setValidationChecks([])
    }
  }, [manuscriptId])

  // Fetch source data files from Data4Rev API (client-side replacement for /download?format=list)
  const fetchSourceDataFiles = useCallback(async () => {
    if (!manuscriptId) return

    setIsLoadingSourceData(true)
    setSourceDataError(null)

    try {
      console.log('📁 Fetching source data files for manuscript:', manuscriptId)

      // Try multiple Data4Rev API endpoints for files
      let filesData = null
      let source = ''

      try {
        // Option 1: Try the correct Data4Rev API files endpoint
        console.log('📁 Trying manuscript files endpoint /v1/manuscripts/{id}/files...')
        const filesResponse = await api.files.getByManuscriptId(manuscriptId)
        filesData = filesResponse
        source = 'files endpoint'
        console.log('✅ Found files via files endpoint:', filesData)
      } catch (filesError) {
        console.log('⚠️ Files endpoint failed, checking manuscript detail for embedded files...', filesError)

        try {
          // Option 2: Check if manuscript details include file information (ManuscriptDetails.files)
          const manuscriptDetail = await api.manuscripts.getById(manuscriptId)
          if (manuscriptDetail && (manuscriptDetail as any).files) {
            filesData = (manuscriptDetail as any).files
            source = 'manuscript detail'
            console.log('✅ Found files in manuscript detail:', filesData)
          } else {
            throw new Error('No files found in manuscript detail')
          }
        } catch (detailError) {
          throw new Error(`All file fetch attempts failed: ${detailError}`)
        }
      }

      console.log(`📁 Successfully fetched files from ${source}:`, filesData)

      // Transform the response to match expected format
      // Files endpoint returns array directly, manuscript detail has files nested under .files
      const files = Array.isArray(filesData) ? filesData : (filesData as any)?.files || []
      if (!Array.isArray(files)) {
        throw new Error('Invalid response format: files data is not an array')
      }

      console.log('📁 Processing files:', files.length, 'files found')

      // Transform API data to match SourceFilesTreeview expected format
      // Handle both FileDetails (from manuscript detail) and FileDetailsWithSourceData (from files endpoint)
      const transformedFiles = files.map((file: any, index: number) => ({
        id: file.id?.toString() || index.toString(),
        type: categorizeFileType(file.name || file.filename || ''),
        name: file.name || file.filename || `file_${file.id || index}`,
        size: file.size || file.filesize || null,
        url: file.uri || file.preview_uri || '#', // Use Data4Rev API fields
        originalUri: file.uri, // Data4Rev API field
        description: file.source || file.uploaded_by || 'Source data file',
        // Additional Data4Rev API fields
        mimeType: file.preview_mime_type,
        uploadedBy: file.uploaded_by,
        source: file.source,
        assignedTo: file.assigned_to // Only available in FileDetailsWithSourceData
      }))

      console.log('📁 Transformed files:', transformedFiles)
      setSourceDataFiles(transformedFiles)

    } catch (error) {
      console.error('Error fetching source data:', error)
      setSourceDataError(error instanceof Error ? error.message : 'Unknown error')
      // Fallback to mock data on error
      setSourceDataFiles([])
    } finally {
      setIsLoadingSourceData(false)
    }
  }, [manuscriptId])

  // Helper function to categorize file types based on filename
  const categorizeFileType = (filename: string): string => {
    const name = filename.toLowerCase()
    const uri = filename.toLowerCase()

    if (name.includes('.pdf') || uri.includes('/pdf/') || (name.includes('.docx') && uri.includes('/doc/'))) {
      return 'Manuscript'
    } else if ((name.includes('.png') || name.includes('.jpg') || name.includes('.jpeg') ||
               name.includes('.tiff') || name.includes('.gif') || name.includes('.svg') ||
               name.includes('.pdf') || name.includes('.eps')) &&
               (uri.includes('/graphic/') || uri.includes('/figure') || name.includes('fig'))) {
      return 'Figure'
    } else if (uri.includes('/suppl_data/') || name.includes('supplement') ||
               name.includes('.xlsx') || name.includes('.csv') ||
               name.includes('data') || name.includes('.zip')) {
      return 'Supplementary Data'
    } else if (name.includes('.xml') || name.includes('.json')) {
      return 'Metadata'
    } else {
      return 'Raw Data'
    }
  }

  const {
    state,
    setSelectedView,
    setSelectedFigureIndex,
    setManuscript,
    setNotes,
    setIsLoading,
    setError,
    setLinkedData,
    setSourceData,
    setDataAvailability,
    addLinkedData,
    removeLinkedData,
    updateLinkedData,
    addSourceData,
    removeSourceData,
    nextFigure,
    previousFigure,
    clearError
  } = useManuscriptDetailState()

  const { fetchApiManuscriptDetail, downloadFile, submitValidation } = useManuscriptDetailApi({
    setManuscript,
    setIsLoading,
    setError,
    setDataAvailability
  })

  // Fetch figure previews from Data4Rev API
  const fetchFigurePreviews = useCallback(async () => {
    if (!state.manuscript?.figures || state.manuscript.figures.length === 0) return

    setLoadingPreviews(true)
    const previews = new Map<number, string>()

    try {
      for (const figure of state.manuscript.figures) {
        if (figure.image_file_id) {
          try {
            const previewUrl = `https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api/v1/manuscripts/${state.manuscript.id}/files/${figure.image_file_id}/preview`
            const response = await fetch(previewUrl, {
              headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE3NTc1MjAyOTksImV4cCI6MTc4ODYyNDI5OSwiYXVkIjoiZGF0YTRyZXYiLCJpc3MiOiJ0ZXN0LWlzc3VlciJ9.z8-At4lk5g1z1PqFxvGCDJfKr4qoUgM0GWMqxmebZpo'
              }
            })

            if (response.ok) {
              const blob = await response.blob()
              const objectUrl = URL.createObjectURL(blob)
              previews.set(figure.id, objectUrl)
            }
          } catch (error) {
            console.warn(`Failed to load preview for figure ${figure.id}:`, error)
          }
        }
      }
      setFigurePreviews(previews)
    } catch (error) {
      console.error('Failed to fetch figure previews:', error)
    } finally {
      setLoadingPreviews(false)
    }
  }, [state.manuscript?.figures, state.manuscript?.id])

  // Single consolidated effect for all data loading
  useEffect(() => {
    const initializeAllData = async () => {
      if (!manuscriptId || isInitializingRef.current) return

      // Prevent duplicate calls in React StrictMode
      isInitializingRef.current = true

      // Prioritize useApiData prop, then check global setting
      const shouldUseApi = useApiData || !dataService.getUseMockData()

      if (shouldUseApi) {
        // Always try API first - the backend will handle authentication
        try {
          console.log('🚀 Loading manuscript and source data for:', manuscriptId)

          // Load manuscript details, source data, and validation checks in parallel
          const [manuscriptResult] = await Promise.allSettled([
            fetchApiManuscriptDetail(manuscriptId),
            // Only fetch source data if not already loaded
            sourceDataFiles.length === 0 && !isLoadingSourceData ? fetchSourceDataFiles() : Promise.resolve(),
            // Fetch validation checks for count display
            fetchValidationChecks()
          ])

          if (manuscriptResult.status === 'rejected') {
            throw manuscriptResult.reason
          }

        } catch (error) {
          console.error('API call failed:', error)
          setIsLoading(false)
        }
      } else {
        console.error('No API data available - API mode is required')
        setIsLoading(false)
      }

      // Reset the ref to allow future re-initialization if manuscriptId changes
      isInitializingRef.current = false
    }

    initializeAllData()
  }, [manuscriptId, useApiData]) // Minimal dependencies to prevent unnecessary re-runs


  // Handle download
  const handleDownload = async () => {
    if (!state.manuscript) return

    try {
      const shouldUseApi = useApiData || !dataService.getUseMockData()

      if (shouldUseApi) {
        await downloadFile(state.manuscript.id, 'pdf')
      } else {
        // Simulate download for mock data
        alert(`Downloading ${state.manuscript.msid}.pdf...`)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  // Handle notes change
  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    if (state.manuscript) {
      setManuscript({
        ...state.manuscript,
        notes: newNotes
      })
    }
  }

  // Handle links change - refresh manuscript data
  const handleLinksChange = async () => {
    if (!manuscriptId) return
    try {
      console.log('🔄 Refreshing manuscript data after links change...')
      await fetchApiManuscriptDetail(manuscriptId)
    } catch (error) {
      console.error('Failed to refresh manuscript data:', error)
    }
  }

  // Handle figure navigation
  const handleFigureChange = (index: number) => {
    setSelectedFigureIndex(index)
  }

  // Handle file assignment changes
  const handleFileAssignment = async (fileId: number, figureId?: number, panelId?: number) => {
    console.log('📋 File assignment changed:', { fileId, figureId, panelId })
    // TODO: Implement file assignment logic
  }

  // Handle drag end for figures
  const handleFigureDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && state.manuscript) {
      const oldIndex = state.manuscript.figures.findIndex((figure: any) => figure.id === active.id)
      const newIndex = state.manuscript.figures.findIndex((figure: any) => figure.id === over.id)

      const newFigures = arrayMove(state.manuscript.figures, oldIndex, newIndex)

      // Update local state immediately for responsive UI
      setManuscript({
        ...state.manuscript,
        figures: newFigures
      })

      try {
        // Call API to update the order on the server
        // Update each figure's sort order individually
        for (let i = 0; i < newFigures.length; i++) {
          const figure = newFigures[i]
          await api.figures.update(manuscriptId, figure.id.toString(), {
            sort_order: i
          })
        }
        console.log('✅ Figure order updated successfully')
      } catch (error) {
        console.error('❌ Failed to update figure order:', error)
        // Revert local state on API failure
        setManuscript({
          ...state.manuscript,
          figures: state.manuscript.figures
        })
        // TODO: Show error notification to user
      }
    }
  }

  // Handle drag end for panels
  const handlePanelDragEnd = async (event: DragEndEvent, figureId: number) => {
    const { active, over } = event

    if (over && active.id !== over.id && state.manuscript) {
      const figure = state.manuscript.figures.find((f: any) => f.id === figureId)
      if (!figure || !figure.panels) return

      const oldIndex = figure.panels.findIndex((panel: any) => panel.id === active.id)
      const newIndex = figure.panels.findIndex((panel: any) => panel.id === over.id)

      const newPanels = arrayMove(figure.panels, oldIndex, newIndex)

      const updatedFigures = state.manuscript.figures.map((f: any) =>
        f.id === figureId ? { ...f, panels: newPanels } : f
      )

      // Update local state immediately for responsive UI
      setManuscript({
        ...state.manuscript,
        figures: updatedFigures
      })

      try {
        // Call API to update the panel order on the server
        // Update each panel's sort order individually
        for (let i = 0; i < newPanels.length; i++) {
          const panel = newPanels[i]
          await api.panels.update(manuscriptId, figureId.toString(), panel.id.toString(), {
            sort_order: i
          })
        }
        console.log('✅ Panel order updated successfully')
      } catch (error) {
        console.error('❌ Failed to update panel order:', error)
        // Revert local state on API failure
        setManuscript({
          ...state.manuscript,
          figures: state.manuscript.figures
        })
        // TODO: Show error notification to user
      }
    }
  }

  // Handle figure actions
  const handleFigureUpload = (figureId: number) => {
    console.log('Upload new image for figure', figureId)
    // TODO: Implement upload logic
  }

  const handleFigureDelete = (figureId: number) => {
    console.log('Delete figure', figureId)
    // TODO: Implement delete logic
  }

  const handleAddPanel = async (figureId: number) => {
    if (!manuscriptId || !state.manuscript) return

    try {
      console.log('➕ Adding new panel to figure', figureId)

      // Find the figure to determine next panel label and sort order
      const figure = state.manuscript.figures.find((f: any) => f.id === figureId)
      if (!figure) {
        console.error('❌ Figure not found:', figureId)
        return
      }

      // Calculate next panel label (A, B, C, etc.)
      const nextPanelIndex = figure.panels?.length || 0
      const nextPanelLabel = String.fromCharCode(65 + nextPanelIndex) // A=65, B=66, etc.

      // Create panel via API
      const newPanel = await api.panels.create(manuscriptId, figureId.toString(), {
        label: nextPanelLabel,
        caption: `Panel ${nextPanelLabel}`,
        x1: null,
        y1: null,
        x2: null,
        y2: null,
        confidence: null,
        sort_order: nextPanelIndex,
        links: [],
        source_data: []
      })

      console.log('✅ Panel created:', newPanel)

      // Update local state
      const updatedFigures = state.manuscript.figures.map((f: any) =>
        f.id === figureId
          ? { ...f, panels: [...(f.panels || []), newPanel] }
          : f
      )

      setManuscript({
        ...state.manuscript,
        figures: updatedFigures
      })

      // Refresh manuscript data to ensure consistency
      await fetchApiManuscriptDetail(manuscriptId)

    } catch (error) {
      console.error('❌ Failed to add panel:', error)
      alert('Failed to add panel. Please try again.')
    }
  }

  const handleDeletePanel = async (figureId: number, panelId: number) => {
    if (!manuscriptId || !state.manuscript) return

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this panel? This action cannot be undone.')) {
      return
    }

    try {
      console.log('🗑️ Deleting panel', panelId, 'from figure', figureId)

      // Delete panel via API
      await api.panels.delete(manuscriptId, figureId.toString(), panelId.toString())

      console.log('✅ Panel deleted:', panelId)

      // Update local state - remove the panel
      const updatedFigures = state.manuscript.figures.map((f: any) =>
        f.id === figureId
          ? { ...f, panels: (f.panels || []).filter((p: any) => p.id !== panelId) }
          : f
      )

      setManuscript({
        ...state.manuscript,
        figures: updatedFigures
      })

      // Refresh manuscript data to ensure consistency and update panel labels
      await fetchApiManuscriptDetail(manuscriptId)

    } catch (error) {
      console.error('❌ Failed to delete panel:', error)
      alert('Failed to delete panel. Please try again.')
    }
  }

  // Count validation checks by severity
  const getValidationCount = () => {
    const severity1Count = validationChecks.filter(check => check.severity === 1).length
    const severity2Count = validationChecks.filter(check => check.severity === 2).length
    const totalCount = severity1Count + severity2Count

    if (totalCount === 0) {
      return { text: 'Validation', count: 0, severity1: 0, severity2: 0 }
    }

    return {
      text: `Validation (${totalCount > 2 ? '!' + totalCount : '!' + totalCount})`,
      count: totalCount,
      severity1: severity1Count,
      severity2: severity2Count
    }
  }

  // Loading state
  if (state.isLoading) {
    return (
      <ManuscriptLoadingScreen
        useApiData={useApiData}
        onBack={() => window.history.back()}
      />
    )
  }

  // Error state
  if (state.error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-destructive mb-4">{state.error}</p>
            <button onClick={clearError} className="text-primary hover:underline">
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No manuscript found
  if (!state.manuscript) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">Manuscript not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8 space-y-6">
        {/* API Status Notice - only show if we're using mock data fallback */}
        {useApiData && state.manuscript?.notes?.includes('mock') && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-800">
                  Using demo data. The Data4Rev API may be unavailable.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <ManuscriptHeader
          manuscript={state.manuscript}
          onDownload={handleDownload}
          onBack={onBack}
          onNotesChange={handleNotesChange}
          onLinksChange={handleLinksChange}
        />

        {/* Main Content */}
        <div className="space-y-6">
          {/* View Selection Buttons */}
          <div className="inline-flex h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-auto">
            <button
              onClick={() => setSelectedView('manuscript')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all hover:bg-background/60 cursor-pointer ${
                state.selectedView === 'manuscript'
                  ? 'bg-background text-foreground shadow-sm'
                  : ''
              }`}
            >
              Manuscript Overview
            </button>
            <button
              onClick={() => setSelectedView('figure-list')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all hover:bg-background/60 cursor-pointer ${
                state.selectedView === 'figure-list'
                  ? 'bg-background text-foreground shadow-sm'
                  : ''
              }`}
            >
              Figure List
            </button>
            <button
              onClick={() => setSelectedView('file-tree')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all hover:bg-background/60 cursor-pointer ${
                state.selectedView === 'file-tree'
                  ? 'bg-background text-foreground shadow-sm'
                  : ''
              }`}
            >
              File Tree
            </button>
            <button
              onClick={() => setSelectedView('validation')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all hover:bg-background/60 cursor-pointer ${
                state.selectedView === 'validation'
                  ? 'bg-background text-foreground shadow-sm'
                  : ''
              }`}
            >
              <div className="flex items-center gap-1">
                <span>Validation</span>
                {(() => {
                  const validationCount = getValidationCount()
                  if (validationCount.count === 0) return null

                  return (
                    <div className="flex items-center gap-1">
                      {validationCount.severity2 > 0 && (
                        <div className="flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600">{validationCount.severity2}</span>
                        </div>
                      )}
                      {validationCount.severity1 > 0 && (
                        <div className="flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs text-yellow-600">{validationCount.severity1}</span>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </button>
            <button
              onClick={() => setSelectedView('ai-qc')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all hover:bg-background/60 cursor-pointer ${
                state.selectedView === 'ai-qc'
                  ? 'bg-background text-foreground shadow-sm'
                  : ''
              }`}
            >
              AI QC checks
            </button>
          </div>

          {/* Manuscript Review Content */}
          {state.selectedView === 'manuscript' && (
            <ManuscriptOverviewTabs
              manuscript={state.manuscript}
              selectedFigureIndex={state.selectedFigureIndex}
              onFigureChange={handleFigureChange}
              onNextFigure={nextFigure}
              onPreviousFigure={previousFigure}
              onLinksChange={handleLinksChange}
            />
          )}

          {/* Figure List Content */}
          {state.selectedView === 'figure-list' && (
            <div className="space-y-6">
              {/* Figure List Header */}
              <Card className="border-none gap-0">
                <div className="flex row items-center justify-between  px-4 py-2">
                  <h2 className="text-xl font-semibold text-gray-900">Figure List</h2>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setShowFigurePreview(true)
                      fetchFigurePreviews()
                    }}
                    className="h-12 w-12 p-0 hover:bg-blue-50 hover:border-blue-300"
                    title="Edit Figures"
                  >
                    <Image className="h-6 w-6 text-blue-600" />
                  </Button>
                </div>

              <FigureList
                manuscript={state.manuscript}
                sourceFiles={sourceDataFiles}
                onFileAssignment={handleFileAssignment}
                onFileRemoval={handleFileAssignment}
              />
              </Card>
            </div>
          )}

          {/* File Tree Content */}
          {state.selectedView === 'file-tree' && (
            <div className="space-y-6">
              <SourceFilesTreeview
                sourceFiles={sourceDataFiles}
                figures={state.manuscript?.figures || []}
                manuscriptId={manuscriptId}
                isLoading={isLoadingSourceData}
                error={sourceDataError}
                onRefresh={fetchSourceDataFiles}
                onAssignmentChange={handleFileAssignment}
              />
            </div>
          )}

          {/* Validation Content */}
          {state.selectedView === 'validation' && (
            <div className="space-y-6">
              <ChecksTable
                manuscriptId={manuscriptId}
                type="validation"
              />
            </div>
          )}

          {/* AI QC Checks Content */}
          {state.selectedView === 'ai-qc' && (
            <div className="space-y-6">
              <ChecksTable
                manuscriptId={manuscriptId}
                type="ai-checks"
              />
            </div>
          )}
        </div>
      </div>

      {/* Figure Preview Popup */}
      {showFigurePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Figures</h3>
                <p className="text-sm text-gray-500">View, edit, delete figures and panels, or create new ones</p>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setIsCollapsedView(false)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      !isCollapsedView
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Expanded view"
                  >
                    <Grid className="w-4 h-4" />
                    Expanded
                  </button>
                  <button
                    onClick={() => setIsCollapsedView(true)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      isCollapsedView
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Collapsed view"
                  >
                    <List className="w-4 h-4" />
                    Collapsed
                  </button>
                </div>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement create new figure
                    console.log('Create new figure')
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Figure
                </Button>
                <button
                  onClick={() => {
                    setShowFigurePreview(false)
                    // Clean up object URLs
                    figurePreviews.forEach(url => URL.revokeObjectURL(url))
                    setFigurePreviews(new Map())
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingPreviews ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading figure previews...</p>
                  </div>
                </div>
              ) : state.manuscript?.figures && state.manuscript.figures.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleFigureDragEnd}
                >
                  <SortableContext items={state.manuscript.figures.map((figure: any) => figure.id)} strategy={verticalListSortingStrategy}>
                    <div className={isCollapsedView ? "space-y-3" : "space-y-6"}>
                      {state.manuscript.figures.map((figure) =>
                        isCollapsedView ? (
                          <CompactSortableFigureItem
                            key={figure.id}
                            figure={figure}
                            onUpload={handleFigureUpload}
                            onDelete={handleFigureDelete}
                            onAddPanel={handleAddPanel}
                            onDeletePanel={handleDeletePanel}
                          />
                        ) : (
                          <SortableFigureItem
                            key={figure.id}
                            figure={figure}
                            figurePreviews={figurePreviews}
                            onUpload={handleFigureUpload}
                            onDelete={handleFigureDelete}
                            onAddPanel={handleAddPanel}
                            onDeletePanel={handleDeletePanel}
                            sensors={sensors}
                            onPanelDragEnd={handlePanelDragEnd}
                          />
                        )
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-8">
                  <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No figures available</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setShowFigurePreview(false)
                  // Clean up object URLs
                  figurePreviews.forEach(url => URL.revokeObjectURL(url))
                  setFigurePreviews(new Map())
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  )
}
