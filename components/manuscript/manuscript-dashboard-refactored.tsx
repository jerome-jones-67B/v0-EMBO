"use client"

import { useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { ManuscriptFilters } from "./manuscript-filters"
import { ManuscriptTableHeader } from "./manuscript-table-header"
import { ManuscriptTableRow } from "./manuscript-table-row"
import { ColumnSettings } from "./column-settings"
import { useManuscriptState } from "@/hooks/useManuscriptState"
import { useManuscriptOperations } from "@/hooks/useManuscriptOperations"
import { filterAndSortManuscripts, getUniqueAssignees, getTabCounts } from "@/lib/utils/manuscript-utils"
import { initialMockManuscripts, WORKFLOW_TABS } from "@/lib/mock-manuscript-data"
import { dataService } from '@/lib/data-service'
import { config } from '@/lib/config'
import { getStatusMapping } from '@/lib/status-mapping'
import type { Manuscript } from '@/types/manuscript'

export function ManuscriptDashboardRefactored() {
  const { data: session } = useSession()
  const {
    state,
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
    updateFilter,
    updateSort,
    toggleColumnVisibility,
    clearFilters,
    selectAllManuscripts,
    clearSelection,
    toggleManuscriptSelection
  } = useManuscriptState()

  const operations = useManuscriptOperations({
    manuscripts: state.manuscripts,
    setManuscripts,
    apiManuscripts: state.apiManuscripts,
    setApiManuscripts,
    useApiData: state.useApiData
  })

  // Initialize mock data
  useEffect(() => {
    if (state.manuscripts.length === 0) {
      setManuscripts(initialMockManuscripts)
    }
  }, [state.manuscripts.length, setManuscripts])

  // API Data Fetching
  const fetchApiData = async () => {
    setIsLoadingApi(true)

    if (!session) {
      console.error('❌ No session available for API call')
      setIsLoadingApi(false)
      return
    }

    try {
      const url = new URL(`${config.api.baseUrl}/manuscripts`, window.location.origin)
      url.searchParams.set('page', '0')
      url.searchParams.set('pagesize', '100')
      url.searchParams.set('sort', 'received_at')
      url.searchParams.set('ascending', 'true')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const transformedManuscripts = data.manuscripts.map((manuscript: any) => {
        const statusMapping = getStatusMapping(manuscript.status)
        return {
          id: manuscript.id,
          msid: manuscript.msid,
          receivedDate: manuscript.received_at?.split('T')[0] || '2024-01-01',
          title: manuscript.title,
          authors: manuscript.authors,
          doi: manuscript.doi,
          accessionNumber: manuscript.accession_number,
          assignedTo: "Dr. Sarah Chen",
          status: statusMapping.displayStatus,
          workflowState: statusMapping.workflowState,
          priority: statusMapping.priority,
          hasErrors: manuscript.note && manuscript.note.includes('error'),
          hasWarnings: manuscript.note && manuscript.note.includes('updating'),
          notes: manuscript.note || "API manuscript - no additional notes",
          lastModified: manuscript.received_at || new Date().toISOString(),
          displayStatus: statusMapping.displayStatus,
          badgeVariant: statusMapping.badgeVariant,
          isMapped: statusMapping.isMapped,
          unmappedFields: ['assignedTo'],
        }
      })

      setApiManuscripts(transformedManuscripts)
    } catch (error) {
      console.error('❌ Failed to fetch API data:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ API request timed out')
      }
      setUseApiData(false)
      dataService.setUseMockData(true)
    } finally {
      setIsLoadingApi(false)
      setIsInitialLoadComplete(true)
    }
  }

  // Handle data source toggle
  const handleDataSourceToggle = async (useApi: boolean) => {
    setUseApiData(useApi)
    dataService.setUseMockData(!useApi)
    
    if (useApi && state.apiManuscripts.length === 0) {
      await fetchApiData()
    }
  }

  // Get current manuscripts based on data source
  const currentManuscripts = state.useApiData ? state.apiManuscripts : state.manuscripts

  // Filter and sort manuscripts
  const filteredManuscripts = useMemo(() => {
    return filterAndSortManuscripts(
      currentManuscripts,
      state.filters,
      state.sort,
      state.activeTab,
      state.showOnlyMine
    )
  }, [currentManuscripts, state.filters, state.sort, state.activeTab, state.showOnlyMine])

  // Get unique assignees for filter
  const uniqueAssignees = useMemo(() => {
    return getUniqueAssignees(currentManuscripts)
  }, [currentManuscripts])

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    return getTabCounts(currentManuscripts)
  }, [currentManuscripts])

  // Handle download
  const handleDownload = async (manuscriptId: string) => {
    const manuscript = currentManuscripts.find(m => m.id === manuscriptId)
    if (!manuscript) return

    // Simulate download progress
    setDownloadProgress(prev => ({
      ...prev,
      [manuscriptId]: { progress: 0, status: 'downloading', filename: `${manuscript.msid}.pdf` }
    }))

    // Simulate progress updates
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setDownloadProgress(prev => ({
        ...prev,
        [manuscriptId]: { ...prev[manuscriptId], progress }
      }))
    }

    setDownloadProgress(prev => ({
      ...prev,
      [manuscriptId]: { ...prev[manuscriptId], status: 'completed', progress: 100 }
    }))

    // Clear progress after 3 seconds
    setTimeout(() => {
      setDownloadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[manuscriptId]
        return newProgress
      })
    }, 3000)
  }

  // Loading state
  if ((state.useApiData && state.isLoadingApi) || !state.isInitialLoadComplete) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" text="Loading EMBO Dashboard" />
            <p className="mt-4 text-sm text-muted-foreground">
              {state.useApiData ? 'Fetching manuscript data from Data4Rev API...' : 'Initializing dashboard...'}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">
                Connected to {state.useApiData ? 'live API' : 'demo data'}
              </span>
            </div>
            {state.useApiData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDataSourceToggle(false)}
                className="mt-4"
              >
                Switch to Mock Data
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">EMBO Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and track manuscript submissions and reviews
            </p>
          </div>

          {/* Data Source Toggle */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="data-source">API Data</Label>
            <Switch
              id="data-source"
              checked={state.useApiData}
              onCheckedChange={handleDataSourceToggle}
            />
            <Badge variant={state.useApiData ? "default" : "secondary"}>
              {state.useApiData ? "Live" : "Demo"}
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <ManuscriptFilters
          filters={state.filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          manuscripts={currentManuscripts}
          uniqueAssignees={uniqueAssignees}
        />

        {/* Main Content */}
        <Tabs value={state.activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
              {WORKFLOW_TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  {tab.label}
                  <Badge variant="secondary" className="ml-1">
                    {tabCounts[tab.id as keyof typeof tabCounts]}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-mine"
                  checked={state.showOnlyMine}
                  onCheckedChange={setShowOnlyMine}
                />
                <Label htmlFor="show-mine">My manuscripts only</Label>
              </div>
              <ColumnSettings
                columnVisibility={state.columnVisibility}
                onToggleColumn={toggleColumnVisibility}
              />
            </div>
          </div>

          {WORKFLOW_TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{tab.label}</span>
                    <Badge variant="outline">
                      {filteredManuscripts.length} manuscripts
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {state.selectedManuscripts.size > 0 && (
                      <span>
                        {state.selectedManuscripts.size} manuscript(s) selected
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <ManuscriptTableHeader
                        sort={state.sort}
                        onSort={updateSort}
                        columnVisibility={state.columnVisibility}
                        selectedManuscripts={state.selectedManuscripts}
                        filteredManuscripts={filteredManuscripts}
                        onSelectAll={selectAllManuscripts}
                        onClearSelection={clearSelection}
                      />
                      <TableBody>
                        {filteredManuscripts.map((manuscript) => (
                          <ManuscriptTableRow
                            key={manuscript.id}
                            manuscript={manuscript}
                            isSelected={state.selectedManuscripts.has(manuscript.id)}
                            onToggleSelection={toggleManuscriptSelection}
                            columnVisibility={state.columnVisibility}
                            downloadProgress={state.downloadProgress}
                            onDownload={handleDownload}
                            onToggleOnHold={operations.toggleOnHoldStatus}
                            onChangePriority={operations.changePriority}
                            onAssignToMe={operations.assignToMe}
                            onUnassignFromMe={operations.unassignFromMe}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}