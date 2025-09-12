// Example of how to update your manuscript-dashboard.tsx to use the data service
// This shows the key changes needed - you can apply similar patterns to other components

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings2, Loader2 } from "lucide-react"
import { ManuscriptDetail } from "@/components/manuscript-detail"
import { Eye, Download, MoreHorizontal, UserPlus, UserMinus, Pause, Play } from "lucide-react"
import {
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Info,
  Edit2,
  Check,
  X,
  Clock,
} from "lucide-react"

// 🔥 NEW: Import the data hooks instead of mock data
import { useManuscripts, useManuscriptActions } from "@/hooks/use-data"
import type { Manuscript } from "@/lib/types"

export function ManuscriptDashboard() {
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assignedToFilter, setAssignedToFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedManuscript, setSelectedManuscript] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof Manuscript>("received")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // 🔥 NEW: Use the data hook instead of hardcoded data
  const { 
    manuscripts, 
    pagination, 
    loading, 
    error, 
    refetch 
  } = useManuscripts({
    page: currentPage,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    assignedTo: assignedToFilter !== "all" ? assignedToFilter : undefined,
  })

  // 🔥 NEW: Use manuscript actions hook for updates
  const { updateManuscript, loading: updating } = useManuscriptActions()

  // Filter manuscripts based on search term (client-side filtering for search)
  const filteredManuscripts = useMemo(() => {
    if (!manuscripts) return []
    
    return manuscripts.filter(manuscript => {
      const matchesSearch = searchTerm === "" || 
        manuscript.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manuscript.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manuscript.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSearch
    })
  }, [manuscripts, searchTerm])

  // Sort manuscripts
  const sortedManuscripts = useMemo(() => {
    return [...filteredManuscripts].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]
      
      // Handle dates
      if (sortField === 'received' || sortField === 'received_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      // Handle strings
      else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredManuscripts, sortField, sortDirection])

  // 🔥 NEW: Handle manuscript updates with API calls
  const handleStatusChange = async (manuscriptId: string, newStatus: string) => {
    try {
      await updateManuscript(manuscriptId, { status: newStatus })
      refetch() // Refresh the data
    } catch (error) {
      console.error('Failed to update manuscript status:', error)
      // You could show a toast notification here
    }
  }

  const handlePriorityChange = async (manuscriptId: string, newPriority: string) => {
    try {
      await updateManuscript(manuscriptId, { priority: newPriority })
      refetch() // Refresh the data
    } catch (error) {
      console.error('Failed to update manuscript priority:', error)
    }
  }

  const handleAssignmentChange = async (manuscriptId: string, assignedTo: string) => {
    try {
      await updateManuscript(manuscriptId, { assignedTo })
      refetch() // Refresh the data
    } catch (error) {
      console.error('Failed to update manuscript assignment:', error)
    }
  }

  // Get unique values for filters from the data
  const uniqueStatuses = useMemo(() => {
    if (!manuscripts) return []
    return [...new Set(manuscripts.map(m => m.status))]
  }, [manuscripts])

  const uniquePriorities = useMemo(() => {
    if (!manuscripts) return []
    return [...new Set(manuscripts.map(m => m.priority))]
  }, [manuscripts])

  const uniqueAssignees = useMemo(() => {
    if (!manuscripts) return []
    return [...new Set(manuscripts.map(m => m.assignedTo).filter((assignee): assignee is string => Boolean(assignee)))]
  }, [manuscripts])

  // 🔥 NEW: Handle loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading manuscripts...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="text-red-600">Error loading manuscripts: {error}</p>
        <Button onClick={refetch} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (selectedManuscript) {
    return (
      <ManuscriptDetail
        msid={selectedManuscript}
        onBack={() => setSelectedManuscript(null)}
        useApiData={true}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manuscript Dashboard</h1>
          <p className="text-muted-foreground">
            {pagination ? `${pagination.total} manuscripts total` : 'Loading...'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Refresh
          </Button>
          <Button>New Manuscript</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search manuscripts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {uniquePriorities.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned To</label>
              <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assignees</SelectItem>
                  {uniqueAssignees.map(assignee => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manuscripts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Manuscripts ({sortedManuscripts.length})
            {updating && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => {
                    if (sortField === 'id') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortField('id')
                      setSortDirection('asc')
                    }
                  }}
                >
                  ID {sortField === 'id' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => {
                    if (sortField === 'title') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortField('title')
                      setSortDirection('asc')
                    }
                  }}
                >
                  Title {sortField === 'title' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                </TableHead>
                <TableHead>Authors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedManuscripts.map((manuscript) => (
                <TableRow key={manuscript.msid || manuscript.id}>
                  <TableCell className="font-mono text-sm">
                    {manuscript.msid || manuscript.id}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={manuscript.title}>
                      {manuscript.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="truncate max-w-xs" title={manuscript.authors}>
                      {manuscript.authors}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={manuscript.status}
                      onValueChange={(value) => handleStatusChange(manuscript.msid || manuscript.id.toString(), value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueStatuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={manuscript.priority}
                      onValueChange={(value) => handlePriorityChange(manuscript.msid || manuscript.id.toString(), value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={manuscript.assignedTo || ""}
                      onValueChange={(value) => handleAssignmentChange(manuscript.msid || manuscript.id.toString(), value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {uniqueAssignees.map(assignee => (
                          <SelectItem key={assignee} value={assignee}>
                            {assignee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(manuscript.received).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedManuscript(manuscript.msid || manuscript.id.toString())}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} manuscripts
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}