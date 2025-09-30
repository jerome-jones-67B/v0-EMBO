"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { SafeRender, SafeString } from "@/components/shared/safe-render"
import { ManuscriptHeader } from "./manuscript-header"
import { FigureViewer } from "./figure-viewer"
import { SourceFilesTreeview } from "./source-files-treeview"
import { useManuscriptDetailState } from "@/hooks/useManuscriptDetailState"
import { useManuscriptDetailApi } from "@/hooks/useManuscriptDetailApi"
import { mockManuscriptDetails } from "@/lib/mock-manuscript-details"
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
        value: figure.id, 
        label: `Figure ${figIndex + 1}` 
      })
      
      // Add figure panels
      figure.panels.forEach((panel, panelIndex) => {
        const panelLetter = String.fromCharCode(65 + panelIndex) // A, B, C, etc.
        elements.push({ 
          value: panel.id, 
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
  
  // Prevent duplicate API calls in React StrictMode
  const isInitializingRef = useRef(false)

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
          
          // Load manuscript details and source data in parallel
          const [manuscriptResult] = await Promise.allSettled([
            fetchApiManuscriptDetail(manuscriptId),
            // Only fetch source data if not already loaded
            sourceDataFiles.length === 0 && !isLoadingSourceData ? fetchSourceDataFiles() : Promise.resolve()
          ])
          
          if (manuscriptResult.status === 'rejected') {
            throw manuscriptResult.reason
          }
          
        } catch (error) {
          console.warn('API call failed, falling back to mock data:', error)
          // Fallback to mock data if API fails
          setManuscript(mockManuscriptDetails)
          setIsLoading(false)
        }
      } else {
        // Use mock data when explicitly configured
        setManuscript(mockManuscriptDetails)
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

  // Handle figure navigation
  const handleFigureChange = (index: number) => {
    setSelectedFigureIndex(index)
  }

  // Handle file assignment changes
  const handleFileAssignment = async (fileId: number, figureId?: number, panelId?: number) => {
    console.log('📋 File assignment changed:', { fileId, figureId, panelId })
    // TODO: Implement file assignment logic
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
              📊 Manuscript Review
            </button>
            <button
              onClick={() => setSelectedView('list')}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all hover:bg-background/60 cursor-pointer ${
                state.selectedView === 'list' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : ''
              }`}
            >
              📋 List Review
            </button>
          </div>

          {/* Manuscript Review Content */}
          {state.selectedView === 'manuscript' && (
            <div className="space-y-6">
            {/* Figures */}
            {state.manuscript.figures && state.manuscript.figures.length > 0 ? (
              <FigureViewer
                figures={state.manuscript.figures}
                selectedFigureIndex={state.selectedFigureIndex}
                onFigureChange={handleFigureChange}
                onNextFigure={nextFigure}
                onPreviousFigure={previousFigure}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <p className="text-muted-foreground">No figures available</p>
                </CardContent>
              </Card>
            )}

            {/* Quality Checks Summary */}
            {Array.isArray(state.manuscript.qcChecks) && state.manuscript.qcChecks.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Quality Assurance Summary</h3>
                  <div className="space-y-2">
                    {state.manuscript.qcChecks.map((check: any, index) => {
                      // Defensive check: ensure check is properly formatted
                      const safeCheck = typeof check === 'object' && check !== null ? {
                        id: check.id || `qc-${index}`,
                        type: check.type || 'info',
                        message: String(check.message || (check as any).name || 'Check result'),
                        category: String(check.category || 'Quality Check')
                      } : {
                        id: `qc-${index}`,
                        type: 'info',
                        message: String(check) || 'Check result',
                        category: 'Quality Check'
                      }
                      
                      return (
                        <div key={safeCheck.id} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            safeCheck.type === 'success' ? 'bg-green-500' :
                            safeCheck.type === 'warning' ? 'bg-yellow-500' :
                            safeCheck.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          <SafeString value={safeCheck.message} />
                          <span className="text-muted-foreground">(<SafeString value={safeCheck.category} />)</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          )}

          {/* List Review Content */}
          {state.selectedView === 'list' && (
            <div className="space-y-6">
            {/* Source Files Treeview at the top */}
            <SourceFilesTreeview 
              sourceFiles={sourceDataFiles}
              figures={state.manuscript?.figures || []}
              isLoading={isLoadingSourceData}
              error={sourceDataError}
              onRefresh={fetchSourceDataFiles}
              onAssignmentChange={handleFileAssignment}
            />
            
            {/* Additional Information Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Figures Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Figures ({state.manuscript.figures?.length || 0})</h3>
                  <div className="space-y-3">
                    {state.manuscript.figures?.map((figure, index) => (
                      <div key={figure.id} className="border-l-2 border-blue-200 pl-3">
                        <div className="font-medium text-sm">Figure {index + 1}</div>
                        <div className="text-sm text-muted-foreground">{figure.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {figure.panels.length} panels
                        </div>
                      </div>
                    )) || <div className="text-sm text-muted-foreground">No figures available</div>}
                  </div>
                </CardContent>
              </Card>

              {/* Linked Data Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Linked Data ({state.linkedData.length})</h3>
                  <div className="space-y-3">
                    {state.linkedData.map((item) => (
                      <div key={item.id} className="border-l-2 border-green-200 pl-3">
                        <div className="font-medium text-sm">{item.type}</div>
                        <div className="text-sm">{item.identifier}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    ))}
                    {state.linkedData.length === 0 && (
                      <div className="text-sm text-muted-foreground">No linked data available</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quality Checks Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Quality Checks ({Array.isArray(state.manuscript.qcChecks) ? state.manuscript.qcChecks.length : 0})</h3>
                  <div className="space-y-2">
                    {Array.isArray(state.manuscript.qcChecks) ? state.manuscript.qcChecks.map((check: any, index) => {
                      // Defensive check: ensure check is properly formatted
                      const safeCheck = typeof check === 'object' && check !== null ? {
                        id: check.id || `qc-${index}`,
                        type: check.type || 'info',
                        message: String(check.message || (check as any).name || 'Check result'),
                        category: String(check.category || 'Quality Check')
                      } : {
                        id: `qc-${index}`,
                        type: 'info',
                        message: String(check) || 'Check result',
                        category: 'Quality Check'
                      }
                      
                      return (
                        <div key={safeCheck.id} className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            safeCheck.type === 'success' ? 'bg-green-500' :
                            safeCheck.type === 'warning' ? 'bg-yellow-500' :
                            safeCheck.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="text-sm"><SafeString value={safeCheck.message} /></div>
                            <div className="text-xs text-muted-foreground"><SafeString value={safeCheck.category} /></div>
                          </div>
                        </div>
                      )
                    }) : <div className="text-sm text-muted-foreground">No quality checks available</div>}
                  </div>
                </CardContent>
              </Card>

              {/* Manuscript Metadata */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Manuscript Details</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium">Status</div>
                      <div className="text-sm text-muted-foreground">{state.manuscript.status}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Priority</div>
                      <div className="text-sm text-muted-foreground">{state.manuscript.priority}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Assignee</div>
                      <div className="text-sm text-muted-foreground">{state.manuscript.assignedTo || 'Unassigned'}</div>
                    </div>
                    {state.manuscript.doi && (
                      <div>
                        <div className="text-sm font-medium">DOI</div>
                        <div className="text-sm text-muted-foreground">{state.manuscript.doi}</div>
                      </div>
                    )}
                    {state.manuscript.accessionNumber && (
                      <div>
                        <div className="text-sm font-medium">Accession Number</div>
                        <div className="text-sm text-muted-foreground">{state.manuscript.accessionNumber}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}