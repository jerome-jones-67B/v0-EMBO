"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { ManuscriptHeader } from "./manuscript-header"
import { FigureViewer } from "./figure-viewer"
import { SourceFilesTreeview } from "./source-files-treeview"
import { useManuscriptDetailState } from "@/hooks/useManuscriptDetailState"
import { useManuscriptDetailApi } from "@/hooks/useManuscriptDetailApi"
import { mockManuscriptDetails, mockSourceData } from "@/lib/mock-manuscript-details"
import { ManuscriptLoadingScreen } from '@/components/manuscript-loading-screen'
import { FullTextView } from '@/components/manuscript-full-text-view'
import { dataService } from '@/lib/data-service'

interface ManuscriptDetailProps {
  msid?: string
  onBack?: () => void
  useApiData?: boolean
}

export function ManuscriptDetailRefactored({ msid, onBack, useApiData = true }: ManuscriptDetailProps = {}) {
  const params = useParams()
  const { data: session } = useSession()
  // Use msid prop if provided, otherwise fall back to route params
  const manuscriptId = msid || (params?.id as string)

  // Source data state for real API data
  const [sourceDataFiles, setSourceDataFiles] = useState<any[]>([])
  const [isLoadingSourceData, setIsLoadingSourceData] = useState(false)
  const [sourceDataError, setSourceDataError] = useState<string | null>(null)

  // Fetch source data files from download API
  const fetchSourceDataFiles = useCallback(async () => {
    if (!manuscriptId) return
    
    setIsLoadingSourceData(true)
    setSourceDataError(null)
    
    try {
      console.log('🔍 List Review tab selected - fetching source data files for:', manuscriptId)
      const response = await fetch(`/api/v1/manuscripts/${manuscriptId}/download?format=list`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch source data: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Source data fetched:', data)
      console.log('📁 Sample file structure:', data.files?.[0])
      
      // Transform API data to match SourceFilesTreeview expected format
      const transformedFiles = (data.files || []).map((file: any, index: number) => ({
        id: file.id?.toString() || index.toString(),
        type: categorizeFileType(file.filename || file.name || ''),
        name: file.filename || file.name || `file_${file.id || index}`,
        size: file.size || null, // Don't show size if not available
        url: file.uri || file.preview_uri || `/api/v1/manuscripts/${manuscriptId}/files/${file.id}/download`,
        originalUri: file.uri, // Preserve original URI for path parsing
        description: file.source || file.uploaded_by || 'Source data file'
      }))
      
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

  // Initialize with mock data or fetch from API
  useEffect(() => {
    const initializeData = async () => {
      if (!manuscriptId) return

      // Prioritize useApiData prop, then check global setting
      const shouldUseApi = useApiData || !dataService.getUseMockData()
      
      if (shouldUseApi) {
        // Always try API first - the backend will handle authentication
        try {
          await fetchApiManuscriptDetail(manuscriptId)
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
    }

    initializeData()
  }, [manuscriptId, useApiData, fetchApiManuscriptDetail, setManuscript, setIsLoading])

  // Fetch source data when List Review tab is selected
  useEffect(() => {
    if (useApiData && state.selectedView === "list" && sourceDataFiles.length === 0 && !isLoadingSourceData) {
      fetchSourceDataFiles()
    }
  }, [fetchSourceDataFiles, useApiData, state.selectedView, sourceDataFiles.length, isLoadingSourceData])

  // Handle view change
  const handleViewChange = (view: string) => {
    if (view === 'manuscript' || view === 'list' || view === 'fulltext') {
      setSelectedView(view)
    }
  }

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
        <Tabs value={state.selectedView} onValueChange={handleViewChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manuscript">Manuscript Review</TabsTrigger>
            <TabsTrigger value="list">List Review</TabsTrigger>
            <TabsTrigger value="fulltext">Full Text</TabsTrigger>
          </TabsList>

          <TabsContent value="manuscript" className="space-y-6">
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
                    {state.manuscript.qcChecks.map((check, index) => (
                      <div key={check.id || `qc-${index}`} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          check.type === 'success' ? 'bg-green-500' :
                          check.type === 'warning' ? 'bg-yellow-500' :
                          check.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <span>{check.message}</span>
                        <span className="text-muted-foreground">({check.category})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {/* Source Files Treeview at the top */}
            <SourceFilesTreeview 
              sourceFiles={sourceDataFiles.length > 0 ? sourceDataFiles : mockSourceData}
              isLoading={isLoadingSourceData}
              error={sourceDataError}
              onRefresh={fetchSourceDataFiles}
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
                    {Array.isArray(state.manuscript.qcChecks) ? state.manuscript.qcChecks.map((check) => (
                      <div key={check.id} className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          check.type === 'success' ? 'bg-green-500' :
                          check.type === 'warning' ? 'bg-yellow-500' :
                          check.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm">{check.message}</div>
                          <div className="text-xs text-muted-foreground">{check.category}</div>
                        </div>
                      </div>
                    )) : <div className="text-sm text-muted-foreground">No quality checks available</div>}
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
          </TabsContent>

          <TabsContent value="fulltext">
            <FullTextView
              useApiData={useApiData}
              isLoadingFullText={false}
              fullTextError={null}
              fullTextContent={useApiData ? "Full text content would be loaded from API..." : "This is a mock full-text view of the manuscript. In a real implementation, this would contain the actual manuscript content, formatted for easy reading."}
              fullTextMetadata={state.manuscript}
              fetchFullTextContent={async () => {
                // TODO: Implement API call to fetch full text content
                if (useApiData && state.manuscript) {
                  // This would make an API call to fetch the full text
                  console.log('Fetching full text from API for manuscript:', state.manuscript.id)
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}