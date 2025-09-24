"use client"

import { useEffect } from 'react'
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

export function ManuscriptDetailRefactored({ msid, onBack, useApiData = false }: ManuscriptDetailProps = {}) {
  const params = useParams()
  const { data: session } = useSession()
  // Use msid prop if provided, otherwise fall back to route params
  const manuscriptId = msid || (params?.id as string)

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

      const useMockData = dataService.getUseMockData()
      
      if (useMockData) {
        // Use mock data
        setManuscript(mockManuscriptDetails)
        setIsLoading(false)
      } else if (session) {
        // Fetch from API
        await fetchApiManuscriptDetail(manuscriptId)
      } else {
        // No session, fallback to mock
        setManuscript(mockManuscriptDetails)
        setIsLoading(false)
      }
    }

    initializeData()
  }, [manuscriptId, session, fetchApiManuscriptDetail, setManuscript, setIsLoading])

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
      const useMockData = dataService.getUseMockData()
      
      if (useMockData) {
        // Simulate download for mock data
        alert(`Downloading ${state.manuscript.msid}.pdf...`)
      } else {
        await downloadFile(state.manuscript.id, 'pdf')
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
        useApiData={false}
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
            {state.manuscript.qcChecks && state.manuscript.qcChecks.length > 0 && (
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
            <SourceFilesTreeview sourceFiles={mockSourceData} />
            
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
                  <h3 className="font-semibold mb-4">Quality Checks ({state.manuscript.qcChecks?.length || 0})</h3>
                  <div className="space-y-2">
                    {state.manuscript.qcChecks?.map((check) => (
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
                    )) || <div className="text-sm text-muted-foreground">No quality checks available</div>}
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
              useApiData={false}
              isLoadingFullText={false}
              fullTextError={null}
              fullTextContent="This is a mock full-text view of the manuscript. In a real implementation, this would contain the actual manuscript content, formatted for easy reading."
              fullTextMetadata={state.manuscript}
              fetchFullTextContent={async () => {
                // Mock load function
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}