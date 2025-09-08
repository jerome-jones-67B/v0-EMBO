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
import { Switch } from "@/components/ui/switch"
import { Settings2, Database, Zap } from "lucide-react"
import { ManuscriptDetail } from "./manuscript-detail" // Import the new manuscript detail component
import { dataService } from "@/lib/data-service"
import { getValidStatusesForTab as getValidStatuses, getStatusMapping } from "@/lib/status-mapping"
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

const initialMockManuscripts = [
  {
    msid: "EMBO-2024-001",
    receivedDate: "2024-12-14",
    title: "Novel mechanisms of protein folding in cellular stress responses under oxidative conditions",
    authors: "Smith, J., Johnson, A., Williams, R., Chen, L., Rodriguez, M.",
    doi: "10.1038/s41586-024-07123-4",
    accessionNumber: "EMBO-2024-001-ACC",
    assignedTo: "Dr. Sarah Chen",
    status: "On hold",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: true,
    notes: "Waiting for additional experimental data from authors",
    lastModified: "2024-12-30T10:30:00Z",
  },
  {
    msid: "EMBO-2024-002",
    receivedDate: "2024-12-25",
    title: "CRISPR-Cas9 mediated genome editing in pluripotent stem cells",
    authors: "Brown, K., Davis, M., Wilson, P., Thompson, S.",
    doi: "10.1016/j.cell.2024.02.015",
    accessionNumber: "EMBO-2024-002-ACC",
    assignedTo: "Dr. Michael Rodriguez",
    status: "In Progress",
    workflowState: "ready-for-curation",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Initial review completed, awaiting final validation",
    lastModified: "2024-12-30T14:20:00Z",
  },
  {
    msid: "EMBO-2024-003",
    receivedDate: "2024-12-28",
    title: "Mitochondrial dynamics in neurodegeneration",
    authors: "Garcia, L., Martinez, A., Lopez, C.",
    doi: "10.1038/s41593-024-01567-8",
    accessionNumber: "EMBO-2024-003-ACC",
    assignedTo: "Dr. Emily Watson",
    status: "New submission",
    workflowState: "ready-for-curation",
    priority: "urgent",
    hasErrors: true,
    hasWarnings: false,
    notes: "Missing required metadata files",
    lastModified: "2024-12-30T09:15:00Z",
  },
  {
    msid: "EMBO-2024-004",
    receivedDate: "2024-12-26",
    title: "Single-cell RNA sequencing reveals novel cell types in the developing brain",
    authors: "Anderson, R., Taylor, J., White, M., Jackson, K., Harris, D.",
    doi: "10.1126/science.abcd1234",
    accessionNumber: "EMBO-2024-004-ACC",
    assignedTo: "Dr. Sarah Chen",
    status: "Deposited",
    workflowState: "deposited-to-biostudies",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Successfully deposited to BioStudies",
    lastModified: "2024-12-29T16:45:00Z",
  },
  {
    msid: "EMBO-2024-005",
    receivedDate: "2024-12-27",
    title: "Epigenetic regulation of gene expression in cancer stem cells",
    authors: "Miller, S., Moore, T., Clark, L.",
    doi: "10.1038/s41588-024-01678-9",
    accessionNumber: "EMBO-2024-005-ACC",
    assignedTo: "Dr. Michael Rodriguez",
    status: "Failed to deposit",
    workflowState: "deposited-to-biostudies",
    priority: "high",
    hasErrors: true,
    hasWarnings: true,
    notes: "Deposition failed due to file format issues",
    lastModified: "2024-12-29T11:30:00Z",
  },
  {
    msid: "EMBO-2024-006",
    receivedDate: "2024-12-24",
    title: "Proteomics analysis of synaptic plasticity mechanisms",
    authors: "Lee, H., Kim, J., Park, S., Choi, M.",
    doi: "10.1016/j.neuron.2024.03.012",
    accessionNumber: "EMBO-2024-006-ACC",
    assignedTo: "Dr. Emily Watson",
    status: "Waiting for data",
    workflowState: "no-pipeline-results",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Manuscript processed, awaiting pipeline analysis",
    lastModified: "2024-12-28T13:20:00Z",
  },
  {
    msid: "EMBO-2024-007",
    receivedDate: "2024-12-29",
    title: "Metabolic reprogramming in T cell activation and differentiation",
    authors: "Wang, X., Liu, Y., Zhang, Z., Chen, W.",
    doi: "10.1038/s41590-024-01789-0",
    accessionNumber: "EMBO-2024-007-ACC",
    assignedTo: "Dr. Sarah Chen",
    status: "New submission",
    workflowState: "ready-for-curation",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Recently submitted, pending initial review",
    lastModified: "2024-12-30T08:45:00Z",
  },
  {
    msid: "EMBO-2024-008",
    receivedDate: "2024-12-23",
    title: "Chromatin remodeling complexes in embryonic development",
    authors: "Johnson, P., Williams, R., Brown, A., Davis, K.",
    doi: "10.1016/j.devcel.2024.04.008",
    accessionNumber: "EMBO-2024-008-ACC",
    assignedTo: "Dr. Michael Rodriguez",
    status: "In Progress",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: true,
    notes: "Under review, minor formatting issues identified",
    lastModified: "2024-12-29T15:10:00Z",
  },
  {
    msid: "EMBO-2024-009",
    receivedDate: "2024-12-30",
    title: "Autophagy regulation in aging and longevity",
    authors: "Martinez, C., Garcia, L., Rodriguez, M.",
    doi: "10.1038/s43587-024-00567-8",
    accessionNumber: "EMBO-2024-009-ACC",
    assignedTo: "Dr. Emily Watson",
    status: "Deposited",
    workflowState: "deposited-to-biostudies",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Successfully processed and deposited",
    lastModified: "2024-12-30T17:30:00Z",
  },
  {
    msid: "EMBO-2024-010",
    receivedDate: "2024-12-22",
    title: "Immune checkpoint inhibitors in cancer immunotherapy",
    authors: "Thompson, D., Anderson, S., Wilson, J., Taylor, M., Clark, R.",
    doi: "10.1126/scitranslmed.abc4567",
    accessionNumber: "EMBO-2024-010-ACC",
    assignedTo: "Dr. Sarah Chen",
    status: "Waiting for data",
    workflowState: "no-pipeline-results",
    priority: "urgent",
    hasErrors: false,
    hasWarnings: false,
    notes: "High priority manuscript awaiting computational analysis",
    lastModified: "2024-12-28T12:00:00Z",
  },
  {
    msid: "EMBO-2024-011",
    receivedDate: "2024-12-17",
    title: "Molecular mechanisms of DNA repair in cancer cells",
    authors: "Harris, K., Moore, L., Jackson, P., White, S.",
    doi: "10.1038/s41467-024-45678-9",
    accessionNumber: "EMBO-2024-011-ACC",
    assignedTo: "Dr. Michael Rodriguez",
    status: "On hold",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: true,
    notes: "Pending author response to reviewer comments",
    lastModified: "2024-12-29T10:45:00Z",
  },
  {
    msid: "EMBO-2024-012",
    receivedDate: "2024-12-21",
    title: "Stem cell niche dynamics in tissue regeneration",
    authors: "Lee, S., Kim, H., Park, J., Choi, Y.",
    doi: "10.1016/j.stem.2024.05.012",
    accessionNumber: "EMBO-2024-012-ACC",
    assignedTo: "Dr. Emily Watson",
    status: "Failed to deposit",
    workflowState: "deposited-to-biostudies",
    priority: "normal",
    hasErrors: true,
    hasWarnings: false,
    notes: "Technical issues during BioStudies submission",
    lastModified: "2024-12-28T14:15:00Z",
  },
  {
    msid: "EMBO-2024-013",
    receivedDate: "2024-12-31",
    title: "Circadian rhythm regulation of metabolic pathways",
    authors: "Zhang, L., Wang, M., Liu, X., Chen, H.",
    doi: "10.1038/s41586-024-07890-1",
    accessionNumber: "EMBO-2024-013-ACC",
    assignedTo: "Dr. Sarah Chen",
    status: "New submission",
    workflowState: "ready-for-curation",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Just received, awaiting assignment",
    lastModified: "2024-12-31T09:00:00Z",
  },
  {
    msid: "EMBO-2024-014",
    receivedDate: "2024-12-20",
    title: "Neuroplasticity mechanisms in learning and memory",
    authors: "Brown, M., Davis, R., Wilson, K., Johnson, L.",
    doi: "10.1016/j.neuron.2024.06.015",
    accessionNumber: "EMBO-2024-014-ACC",
    assignedTo: "Dr. Michael Rodriguez",
    status: "In Progress",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: false,
    notes: "Comprehensive review in progress",
    lastModified: "2024-12-30T11:20:00Z",
  },
  {
    msid: "EMBO-2024-015",
    receivedDate: "2024-12-19",
    title: "Tumor microenvironment and cancer progression",
    authors: "Garcia, P., Martinez, R., Lopez, A., Rodriguez, C.",
    doi: "10.1038/s41568-024-00678-2",
    accessionNumber: "EMBO-2024-015-ACC",
    assignedTo: "Dr. Emily Watson",
    status: "Waiting for data",
    workflowState: "no-pipeline-results",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Awaiting bioinformatics pipeline completion",
    lastModified: "2024-12-27T16:30:00Z",
  },
  {
    msid: "EMBO-2024-016",
    receivedDate: "2024-12-18",
    title: "Epigenetic inheritance across generations",
    authors: "Taylor, J., Anderson, M., White, P., Harris, L.",
    doi: "10.1126/science.def7890",
    accessionNumber: "EMBO-2024-016-ACC",
    assignedTo: "Dr. Sarah Chen",
    status: "Deposited",
    workflowState: "deposited-to-biostudies",
    priority: "urgent",
    hasErrors: false,
    hasWarnings: false,
    notes: "Priority manuscript successfully deposited",
    lastModified: "2024-12-29T13:45:00Z",
  },
  {
    msid: "EMBO-2024-017",
    receivedDate: "2024-12-16",
    title: "Microbiome-host interactions in health and disease",
    authors: "Miller, K., Moore, S., Clark, J., Thompson, A.",
    doi: "10.1038/s41579-024-00890-3",
    accessionNumber: "EMBO-2024-017-ACC",
    assignedTo: "Dr. Michael Rodriguez",
    status: "In Progress",
    workflowState: "ready-for-curation",
    priority: "normal",
    hasErrors: false,
    hasWarnings: true,
    notes: "Minor metadata corrections needed",
    lastModified: "2024-12-28T10:15:00Z",
  },
  {
    msid: "EMBO-2024-018",
    receivedDate: "2024-12-15",
    title: "Gene therapy approaches for inherited diseases",
    authors: "Lee, R., Kim, S., Park, H., Choi, K., Wang, L.",
    doi: "10.1016/j.ymthe.2024.07.020",
    accessionNumber: "EMBO-2024-018-ACC",
    assignedTo: "Dr. Emily Watson",
    status: "In Progress",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: false,
    notes: "Awaiting regulatory approval documentation",
    lastModified: "2024-12-27T14:30:00Z",
  },
]

type SortField = "msid" | "receivedDate" | "title" | "authors" | "status" | "priority" | "lastModified"
type SortDirection = "asc" | "desc"

export default function ManuscriptDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("receivedDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [activeTab, setActiveTab] = useState("ready-for-curation")
  const [selectedManuscript, setSelectedManuscript] = useState<string | null>(null)
  const [editingAccession, setEditingAccession] = useState<string | null>(null)
  const [editedAccessionValue, setEditedAccessionValue] = useState("")
  const [mockManuscripts, setMockManuscripts] = useState(initialMockManuscripts)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [useApiData, setUseApiData] = useState(!dataService.getUseMockData())
  const [apiManuscripts, setApiManuscripts] = useState<any[]>([])
  const [isLoadingApi, setIsLoadingApi] = useState(false)

  const [visibleColumns, setVisibleColumns] = useState({
    actions: true,
    status: true,
    received: true,
    msid: true,
    title: true,
    authors: true,
    doi: true,
    accession: true,
    assignee: true,
    notes: true,
  })

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }))
  }

  const getValidStatusesForTab = (tab: string) => {
    return getValidStatuses(tab);
  }

  const handleTabChange = (newTab: string) => {
    const validStatuses = getValidStatusesForTab(newTab)

    // If current status filter is not "all" and not valid for the new tab, clear it
    if (statusFilter !== "all" && !validStatuses.includes(statusFilter)) {
      setStatusFilter("all")
    }

    setActiveTab(newTab)
  }

  const toggleOnHoldStatus = (msid: string) => {
    setMockManuscripts((prev) =>
      prev.map((manuscript) => {
        if (manuscript.msid === msid) {
          const newStatus = manuscript.status === "On hold" ? "New submission" : "On hold"
          return { ...manuscript, status: newStatus }
        }
        return manuscript
      }),
    )
  }

  const assignManuscript = (msid: string, assignee: string) => {
    setMockManuscripts((prev) =>
      prev.map((manuscript) => {
        if (manuscript.msid === msid) {
          return { ...manuscript, assignee }
        }
        return manuscript
      }),
    )
  }

  const unassignManuscript = (msid: string) => {
    setMockManuscripts((prev) =>
      prev.map((manuscript) => {
        if (manuscript.msid === msid) {
          return { ...manuscript }
        }
        return manuscript
      }),
    )
  }

  const filteredAndSortedManuscripts = useMemo(() => {
    const currentManuscripts = useApiData ? apiManuscripts : mockManuscripts
    const filtered = currentManuscripts.filter((manuscript) => {
      // Use workflowState for tab filtering (mapped from API status)
      const workflowState = manuscript.workflowState || manuscript.workflowState || 'no-pipeline-results'
      if (workflowState !== activeTab) return false

      // Use displayStatus for status filtering
      const displayStatus = manuscript.displayStatus || manuscript.status
      if (statusFilter !== "all" && displayStatus !== statusFilter) return false

      if (priorityFilter !== "all") {
        if (priorityFilter === "urgent") {
          // Urgent includes both overdue and nearly due manuscripts
          const isUrgent = manuscript.msid === "EMBO-2024-001" || manuscript.msid === "EMBO-2024-011"
          if (!isUrgent) return false
        } else if (priorityFilter === "normal") {
          // Normal includes all other manuscripts
          const isUrgent = manuscript.msid === "EMBO-2024-001" || manuscript.msid === "EMBO-2024-011"
          if (isUrgent) return false
        }
      }

      if (assigneeFilter !== "all" && manuscript.assignedTo !== assigneeFilter) return false

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          manuscript.msid.toLowerCase().includes(searchLower) ||
          manuscript.title.toLowerCase().includes(searchLower) ||
          manuscript.authors.toLowerCase().includes(searchLower) ||
          manuscript.doi.toLowerCase().includes(searchLower) ||
          manuscript.accessionNumber.toLowerCase().includes(searchLower) ||
          manuscript.notes.toLowerCase().includes(searchLower) ||
          manuscript.assignedTo.toLowerCase().includes(searchLower)
        )
      }

      return true
    })

    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === "receivedDate" || sortField === "lastModified") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered.sort((a, b) => {
      if (a.priority === "urgent" && b.priority !== "urgent") return -1
      if (b.priority === "urgent" && a.priority !== "urgent") return 1

      if (a.priority === "high" && b.priority === "normal") return -1
      if (b.priority === "high" && a.priority === "normal") return 1

      if (a.status === "On hold" && b.status !== "On hold") return -1
      if (b.status === "On hold" && a.status !== "On hold") return 1

      return 0
    })
  }, [searchTerm, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection, activeTab, mockManuscripts, apiManuscripts, useApiData])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (manuscript: any) => {
    const displayStatus = manuscript.displayStatus || manuscript.status
    const hasErrors = manuscript.hasErrors || false
    const hasWarnings = manuscript.hasWarnings || false
    const priority = manuscript.priority || 'normal'
    const isMapped = manuscript.isMapped !== false
    const unmappedFields = manuscript.unmappedFields || []
    
    let variant: "default" | "secondary" | "destructive" | "outline" = manuscript.badgeVariant || "default"
    let className = ""
    let tooltipContent = ""

    // Add highlighting for unmapped fields
    if (!isMapped || unmappedFields.includes('status')) {
      className += " border-2 border-yellow-400 bg-yellow-50 "
      tooltipContent += "⚠️ Unmapped status field - may need attention. "
    }

    // Ready for Curation statuses
    if (displayStatus === "New submission") {
      variant = "outline"
      tooltipContent += "New submission - no work has been done yet"
    } else if (displayStatus === "In Progress") {
      variant = "secondary"
      className += "bg-blue-50 text-blue-700 border-blue-200"
      if (hasErrors) {
        tooltipContent += "In Progress - critical validation errors found, requires immediate attention"
      } else if (hasWarnings) {
        tooltipContent += "In Progress - minor issues detected, review recommended"
      } else {
        tooltipContent += "In Progress - work has been applied, progressing normally"
      }
    } else if (displayStatus === "On hold") {
      variant = "destructive"
      className = "bg-red-50 text-red-700 border-red-200"
      tooltipContent = "On hold - cannot be reviewed or processed, requires attention"
    }
    // Deposited to BioStudies statuses
    else if (displayStatus === "Approved" || displayStatus === "Published") {
      variant = "secondary"
      className += "bg-green-50 text-green-700 border-green-200"
      tooltipContent += "Successfully processed and deposited"
    } else if (displayStatus === "Rejected") {
      variant = "destructive"
      tooltipContent += "Rejected - requires attention"
    }
    // No Pipeline Results statuses
    else if (displayStatus === "Waiting for data") {
      variant = "outline"
      className = "border-blue-200 text-blue-700"
      tooltipContent = "Waiting for backend pipeline processing"
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className={`flex items-center ${className}`}>
            {displayStatus}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge variant="destructive" className="text-xs">
            URGENT
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
            HIGH
          </Badge>
        )
      default:
        return null
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  const currentUser = "Dr. Sarah Chen" // This would typically come from auth context

  // Function to fetch API data
  const fetchApiData = async () => {
    console.log('🚀 Starting API data fetch...')
    setIsLoadingApi(true)
    try {
      const response = await fetch('/api/v1/manuscripts', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ API data received:', data)
      
      // Transform API data to match our mock data structure using proper status mapping
      const transformedManuscripts = data.manuscripts.map((manuscript: any) => {
        const statusMapping = getStatusMapping(manuscript.status)
        return {
          msid: manuscript.msid,
          receivedDate: manuscript.received_at?.split('T')[0] || '2024-01-01',
          title: manuscript.title,
          authors: manuscript.authors,
          doi: manuscript.doi,
          accessionNumber: manuscript.accession_number,
          assignedTo: "Dr. Sarah Chen", // API doesn't have this field
          status: statusMapping.displayStatus,
          workflowState: statusMapping.workflowState,
          priority: statusMapping.priority,
          hasErrors: manuscript.note && manuscript.note.includes('error'),
          hasWarnings: manuscript.note && manuscript.note.includes('updating'),
          notes: manuscript.note || "API manuscript - no additional notes",
          lastModified: manuscript.received_at || new Date().toISOString(),
          // UI-specific fields
          displayStatus: statusMapping.displayStatus,
          badgeVariant: statusMapping.badgeVariant,
          isMapped: statusMapping.isMapped,
          unmappedFields: ['assignedTo'], // Fields not available in API
        }
      })
      
      setApiManuscripts(transformedManuscripts)
      console.log('📋 API manuscripts set:', transformedManuscripts.length, 'manuscripts')
    } catch (error) {
      console.error('❌ Failed to fetch API data:', error)
      // Keep using mock data on error
      setUseApiData(false)
    } finally {
      setIsLoadingApi(false)
      console.log('🏁 API data fetch completed')
    }
  }

  // Switch between API and mock data
  const handleDataSourceSwitch = async (useApi: boolean) => {
    console.log('🔄 Toggling data source:', useApi ? 'API' : 'Mock')
    setUseApiData(useApi)
    // Update the data service to use the correct data source
    dataService.setUseMockData(!useApi)
    console.log('📊 Data service now using mock data:', dataService.getUseMockData())
    
    if (useApi && apiManuscripts.length === 0) {
      console.log('🌐 Fetching API data...')
      await fetchApiData()
    }
  }

  const getUniqueAssignees = () => {
    const assignees = [...new Set(mockManuscripts.map((m) => m.assignedTo))]
    const sortedAssignees = assignees.sort()

    // If current user has assigned manuscripts, put them first
    if (sortedAssignees.includes(currentUser)) {
      const otherAssignees = sortedAssignees.filter((assignee) => assignee !== currentUser)
      return [currentUser, ...otherAssignees]
    }

    return sortedAssignees
  }

  const getTabCounts = () => {
    const counts = {
      "ready-for-curation": { total: 0, new: 0, inProgress: 0, onHold: 0, needsValidation: 0, urgent: 0 },
      "deposited-to-biostudies": { total: 0, needsValidation: 0, urgent: 0, onHold: 0, new: 0, inProgress: 0 },
      "no-pipeline-results": { total: 0, needsValidation: 0, urgent: 0, onHold: 0, new: 0, inProgress: 0 },
    }

    mockManuscripts.forEach((manuscript) => {
      if (manuscript.workflowState === "ready-for-curation") {
        counts["ready-for-curation"].total++
        if (manuscript.status === "New submission") counts["ready-for-curation"].new++
        if (manuscript.status === "In Progress") counts["ready-for-curation"].inProgress++
        if (manuscript.status === "On hold") counts["ready-for-curation"].onHold++
        if (manuscript.msid === "EMBO-2024-001" || manuscript.msid === "EMBO-2024-011")
          counts["ready-for-curation"].needsValidation++
        if (manuscript.priority === "urgent") counts["ready-for-curation"].urgent++
      } else if (manuscript.workflowState === "deposited-to-biostudies") {
        counts["deposited-to-biostudies"].total++
        if (manuscript.status === "Failed to deposit") counts["deposited-to-biostudies"].needsValidation++
        if (manuscript.priority === "urgent") counts["deposited-to-biostudies"].urgent++
      } else if (manuscript.workflowState === "no-pipeline-results") {
        counts["no-pipeline-results"].total++
        if (manuscript.priority === "urgent") counts["no-pipeline-results"].urgent++
      }
    })

    return counts
  }

  const getGlobalCounts = () => {
    const totalManuscripts = mockManuscripts.length
    const urgentCount = mockManuscripts.filter((m) => m.msid === "EMBO-2024-001" || m.msid === "EMBO-2024-011").length
    const onHoldCount = mockManuscripts.filter((m) => m.status === "On hold").length
    const newCount = mockManuscripts.filter((m) => m.status === "New submission").length
    const inProgressCount = mockManuscripts.filter((m) => m.status === "In Progress").length
    const totalOnHoldCount = mockManuscripts.filter((m) => m.status === "On hold").length

    return {
      total: totalManuscripts,
      urgent: urgentCount,
      onHold: onHoldCount,
      new: newCount,
      inProgress: inProgressCount,
      totalOnHold: totalOnHoldCount,
    }
  }

  const getStatusCounts = () => {
    const counts = {
      "New submission": 0,
      "In Progress": 0,
      "On hold": 0,
      Deposited: 0,
      "Failed to deposit": 0,
      "Waiting for data": 0,
    }

    mockManuscripts.forEach((manuscript) => {
      counts[manuscript.status] = (counts[manuscript.status] || 0) + 1
    })

    return counts
  }

  const tabCounts = getTabCounts()
  const uniqueAssignees = getUniqueAssignees()
  const globalCounts = getGlobalCounts()

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const handleEditAccession = (msid: string, currentAccession: string) => {
    setEditingAccession(msid)
    setEditedAccessionValue(currentAccession)
  }

  const handleSaveAccession = (msid: string) => {
    setMockManuscripts((prev) =>
      prev.map((manuscript) =>
        manuscript.msid === msid
          ? { ...manuscript, accessionNumber: editedAccessionValue, lastModified: new Date().toISOString() }
          : manuscript,
      ),
    )
    setEditingAccession(null)
    setEditedAccessionValue("")
  }

  const handleCancelAccessionEdit = () => {
    setEditingAccession(null)
    setEditedAccessionValue("")
  }

  const getDeadlineRowClass = (msid: string) => {
    if (msid === "EMBO-2024-001") {
      // Overdue - red highlight
      return "bg-red-50 border-l-4 border-l-red-500"
    } else if (msid === "EMBO-2024-011") {
      // Due soon - pale orange highlight
      return "bg-orange-50 border-l-4 border-l-orange-400"
    }
    // All others - no styling
    return ""
  }

  const getTabForStatus = (status: string) => {
    switch (status) {
      case "New submission":
      case "In Progress":
      case "On hold":
        return "ready-for-curation"
      case "Deposited":
      case "Failed to deposit":
        return "deposited-to-biostudies"
      case "Waiting for data":
        return "no-pipeline-results"
      default:
        return activeTab
    }
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    if (status !== "all") {
      const targetTab = getTabForStatus(status)
      if (targetTab !== activeTab) {
        setActiveTab(targetTab)
      }
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {selectedManuscript ? (
          <ManuscriptDetail 
            msid={selectedManuscript} 
            onBack={() => setSelectedManuscript(null)} 
            useApiData={useApiData}
          />
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">EMBO Dashboard</h1>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Database className={`w-4 h-4 ${!useApiData ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="text-sm font-medium">Mock</span>
                          <Switch
                            checked={useApiData}
                            onCheckedChange={handleDataSourceSwitch}
                            disabled={isLoadingApi}
                            className="data-[state=checked]:bg-green-600"
                          />
                          <span className="text-sm font-medium">API</span>
                          <Zap className={`w-4 h-4 ${useApiData ? 'text-green-600' : 'text-gray-400'}`} />
                          {isLoadingApi && (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{useApiData ? 'Using live Data4Rev API data' : 'Using rich mock data for demonstration'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {useApiData 
                            ? `${apiManuscripts.length} real manuscripts from API`
                            : `${mockManuscripts.length} varied mock manuscripts`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <p className="text-muted-foreground">Manuscript validation and curation workflow management</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {globalCounts.total} manuscripts
                </Badge>
                {globalCounts.urgent > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="destructive" className="text-sm">
                        {globalCounts.urgent} urgent
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Manuscripts requiring immediate attention across all tabs</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {globalCounts.onHold > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="destructive" className="text-sm">
                        {globalCounts.onHold} on hold
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Manuscripts on hold across all tabs</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {globalCounts.new} new
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {globalCounts.inProgress} in progress
                  </Badge>
                  <Badge variant="destructive" className="text-xs bg-red-50 text-red-700 border-red-200">
                    {globalCounts.totalOnHold} on hold
                  </Badge>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search manuscripts by MSID, title, authors, DOI, accession number, notes, or assignee..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="New submission">
                          New submission ({statusCounts["New submission"]})
                        </SelectItem>
                        <SelectItem value="In Progress">In Progress ({statusCounts["In Progress"]})</SelectItem>
                        <SelectItem value="On hold">On hold ({statusCounts["On hold"]})</SelectItem>
                        <SelectItem value="Deposited">Deposited ({statusCounts["Deposited"]})</SelectItem>
                        <SelectItem value="Failed to deposit">
                          Failed to deposit ({statusCounts["Failed to deposit"]})
                        </SelectItem>
                        <SelectItem value="Waiting for data">
                          Waiting for data ({statusCounts["Waiting for data"]})
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[180px]">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Users className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        {uniqueAssignees.map((assignee) => (
                          <SelectItem key={assignee} value={assignee}>
                            {assignee === currentUser ? `${assignee} (me)` : assignee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ready-for-curation" className="flex items-center gap-2">
                  <Tooltip delayDuration={800} skipDelayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <span className="cursor-help">Ready for Curation</span>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {tabCounts["ready-for-curation"].total} total
                          </Badge>
                          {tabCounts["ready-for-curation"].needsValidation > 0 && (
                            <Badge variant="destructive" className="text-xs px-2 py-0.5 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {tabCounts["ready-for-curation"].needsValidation} urgent
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-medium">Ready for Curation</p>
                        <p>Manuscripts awaiting curation and validation review</p>
                        <div className="mt-1 text-xs text-muted-foreground">
                          <p>• {tabCounts["ready-for-curation"].total} manuscripts in this stage</p>
                          {tabCounts["ready-for-curation"].needsValidation > 0 && (
                            <p>• 1 manuscript is Overdue and 1 manuscript is due soon</p>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="deposited-to-biostudies" className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        Deposited to BioStudies
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {tabCounts["deposited-to-biostudies"].total} total
                          </Badge>
                          {tabCounts["deposited-to-biostudies"].needsValidation > 0 && (
                            <Badge variant="destructive" className="text-xs px-2 py-0.5 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {tabCounts["deposited-to-biostudies"].needsValidation} failed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-medium">Deposited to BioStudies</p>
                        <p>Manuscripts processed for BioStudies deposition</p>
                        <div className="mt-1 text-xs text-muted-foreground">
                          <p>• {tabCounts["deposited-to-biostudies"].total} manuscripts in this stage</p>
                          {tabCounts["deposited-to-biostudies"].needsValidation > 0 && (
                            <p>• {tabCounts["deposited-to-biostudies"].needsValidation} failed to deposit</p>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="no-pipeline-results" className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        No Pipeline results yet
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {tabCounts["no-pipeline-results"].total} waiting
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-medium">No Pipeline results yet</p>
                        <p>Manuscripts awaiting backend pipeline processing</p>
                        <div className="mt-1 text-xs text-muted-foreground">
                          <p>• {tabCounts["no-pipeline-results"].total} manuscripts waiting for data</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tooltip delayDuration={800}>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {activeTab === "ready-for-curation" && "Ready for Curation"}
                              {activeTab === "deposited-to-biostudies" && "Deposited to BioStudies"}
                              {activeTab === "no-pipeline-results" && "No Pipeline results yet"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {activeTab === "ready-for-curation" &&
                                "Manuscripts awaiting curation and validation review"}
                              {activeTab === "deposited-to-biostudies" &&
                                "Manuscripts processed for BioStudies deposition"}
                              {activeTab === "no-pipeline-results" &&
                                "Manuscripts awaiting backend pipeline processing"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        {filteredAndSortedManuscripts.some((m) => m.status === "New submission") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="ml-2 cursor-help">
                                {filteredAndSortedManuscripts.filter((m) => m.status === "New submission").length} new
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>New manuscript submissions awaiting initial review</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {filteredAndSortedManuscripts.some((m) => m.status === "In Progress") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="ml-2 cursor-help">
                                {filteredAndSortedManuscripts.filter((m) => m.status === "In Progress").length} in
                                progress
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manuscripts currently being reviewed and processed</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {filteredAndSortedManuscripts.some((m) => m.status === "On hold") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="destructive" className="ml-2 cursor-help">
                                {filteredAndSortedManuscripts.filter((m) => m.status === "On hold").length} on hold
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manuscripts on hold requiring immediate attention</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent">
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48" align="end">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Toggle columns</h4>
                            <div className="space-y-2">
                              {[
                                { key: "actions", label: "Actions" },
                                { key: "status", label: "Status" },
                                { key: "received", label: "Received" },
                                { key: "msid", label: "MSID" },
                                { key: "title", label: "Title" },
                                { key: "authors", label: "Authors" },
                                { key: "doi", label: "DOI" },
                                { key: "accession", label: "Accession" },
                                { key: "assignee", label: "Assignee" },
                                { key: "notes", label: "Notes" },
                              ].map((column) => (
                                <div key={column.key} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={column.key}
                                    checked={visibleColumns[column.key]}
                                    onCheckedChange={() => toggleColumn(column.key)}
                                  />
                                  <label htmlFor={column.key} className="text-sm font-normal cursor-pointer">
                                    {column.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto pb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {visibleColumns.actions && <TableHead>Actions</TableHead>}
                            {visibleColumns.status && (
                              <TableHead>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleSort("status")}
                                  className="h-auto p-0 font-semibold hover:bg-transparent"
                                >
                                  Status {getSortIcon("status")}
                                </Button>
                              </TableHead>
                            )}
                            {visibleColumns.received && (
                              <TableHead>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleSort("receivedDate")}
                                  className="h-auto p-0 font-semibold hover:bg-transparent"
                                >
                                  Received {getSortIcon("receivedDate")}
                                </Button>
                              </TableHead>
                            )}
                            {visibleColumns.msid && (
                              <TableHead>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleSort("msid")}
                                  className="h-auto p-0 font-semibold hover:bg-transparent"
                                >
                                  MSID {getSortIcon("msid")}
                                </Button>
                              </TableHead>
                            )}
                            {visibleColumns.title && (
                              <TableHead>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleSort("title")}
                                  className="h-auto p-0 font-semibold hover:bg-transparent"
                                >
                                  Title {getSortIcon("title")}
                                </Button>
                              </TableHead>
                            )}
                            {visibleColumns.authors && (
                              <TableHead>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleSort("authors")}
                                  className="h-auto p-0 font-semibold hover:bg-transparent"
                                >
                                  Authors {getSortIcon("authors")}
                                </Button>
                              </TableHead>
                            )}
                            {visibleColumns.doi && <TableHead>DOI</TableHead>}
                            {visibleColumns.accession && <TableHead>Accession</TableHead>}
                            {visibleColumns.assignee && <TableHead>Assignee</TableHead>}
                            {visibleColumns.notes && <TableHead>Notes</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedManuscripts.map((manuscript) => (
                            <TableRow key={manuscript.msid} className={getDeadlineRowClass(manuscript.msid)}>
                              {visibleColumns.actions && (
                                <TableCell className="text-right">
                                  <div className="relative">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setOpenDropdown(openDropdown === manuscript.msid ? null : manuscript.msid)
                                      }}
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>

                                    {openDropdown === manuscript.msid && (
                                      <>
                                        {/* Backdrop */}
                                        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />

                                        <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 transform -translate-x-full translate-x-8">
                                          <div className="py-1">
                                            <button
                                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setSelectedManuscript(manuscript.msid)
                                                setOpenDropdown(null)
                                              }}
                                            >
                                              <Eye className="w-4 h-4 mr-2" />
                                              View details
                                            </button>

                                            <button
                                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setOpenDropdown(null)
                                              }}
                                            >
                                              <Download className="w-4 h-4 mr-2" />
                                              Download files
                                            </button>

                                            <div className="border-t border-gray-200 my-1" />

                                            <button
                                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                toggleOnHoldStatus(manuscript.msid)
                                                setOpenDropdown(null)
                                              }}
                                            >
                                              {manuscript.status === "On hold" ? (
                                                <>
                                                  <Play className="w-4 h-4 mr-2" />
                                                  Remove from hold
                                                </>
                                              ) : (
                                                <>
                                                  <Pause className="w-4 h-4 mr-2" />
                                                  Put on hold
                                                </>
                                              )}
                                            </button>

                                            <div className="border-t border-gray-200 my-1" />

                                            {manuscript.assignee ? (
                                              <>
                                                <button
                                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                  onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    assignManuscript(manuscript.msid, "Current User")
                                                    setOpenDropdown(null)
                                                  }}
                                                >
                                                  <UserPlus className="w-4 h-4 mr-2" />
                                                  Assign to me
                                                </button>
                                                <button
                                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                  onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    unassignManuscript(manuscript.msid)
                                                    setOpenDropdown(null)
                                                  }}
                                                >
                                                  <UserMinus className="w-4 h-4 mr-2" />
                                                  Unassign
                                                </button>
                                              </>
                                            ) : (
                                              <button
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={(e) => {
                                                  e.preventDefault()
                                                  e.stopPropagation()
                                                  assignManuscript(manuscript.msid, "Current User")
                                                  setOpenDropdown(null)
                                                }}
                                              >
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Assign to me
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.status && (
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    {getStatusBadge(manuscript)}
                                    {getPriorityBadge(manuscript.priority)}
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.received && (
                                <TableCell className="text-sm">
                                  {new Date(manuscript.receivedDate).toLocaleDateString()}
                                </TableCell>
                              )}
                              {visibleColumns.msid && (
                                <TableCell className="text-sm font-medium">
                                  <button
                                    onClick={() => setSelectedManuscript(manuscript.msid)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    {highlightSearchTerm(manuscript.msid, searchTerm)}
                                  </button>
                                </TableCell>
                              )}
                              {visibleColumns.title && (
                                <TableCell className="max-w-xs">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => setSelectedManuscript(manuscript.msid)}
                                        className="truncate cursor-pointer text-blue-600 hover:text-blue-800 hover:underline text-left w-full"
                                        title={manuscript.title}
                                      >
                                        {highlightSearchTerm(manuscript.title, searchTerm)}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-md">
                                      <p>{manuscript.title}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Click to view manuscript details
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              )}
                              {visibleColumns.authors && (
                                <TableCell className="max-w-xs">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="truncate cursor-help" title={manuscript.authors}>
                                        {highlightSearchTerm(manuscript.authors, searchTerm)}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-md">
                                      <p>{manuscript.authors}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              )}
                              {visibleColumns.doi && (
                                <TableCell className="text-sm">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <a
                                        href={`https://doi.org/${manuscript.doi}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {highlightSearchTerm(manuscript.doi, searchTerm)}
                                      </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Digital Object Identifier</p>
                                      <p className="text-xs text-muted-foreground">Click to open DOI link</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              )}
                              {visibleColumns.accession && (
                                <TableCell className="text-sm">
                                  {editingAccession === manuscript.msid ? (
                                    <div className="flex items-center gap-1">
                                      <Input
                                        value={editedAccessionValue}
                                        onChange={(e) => setEditedAccessionValue(e.target.value)}
                                        className="h-8 text-sm w-32 min-w-fit"
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleSaveAccession(manuscript.msid)
                                          } else if (e.key === "Escape") {
                                            handleCancelAccessionEdit()
                                          }
                                        }}
                                        autoFocus
                                      />
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                                            onClick={() => handleSaveAccession(manuscript.msid)}
                                          >
                                            <Check className="w-4 h-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Save changes (Enter)</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                                            onClick={handleCancelAccessionEdit}
                                          >
                                            <X className="w-4 h-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Cancel changes (Escape)</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 group">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="cursor-help">
                                            {highlightSearchTerm(manuscript.accessionNumber, searchTerm)}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>EMBO repository accession number</p>
                                          <p className="text-xs text-muted-foreground">
                                            Last modified: {new Date(manuscript.lastModified).toLocaleString()}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() =>
                                              handleEditAccession(manuscript.msid, manuscript.accessionNumber)
                                            }
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Edit accession number</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  )}
                                </TableCell>
                              )}
                              {visibleColumns.assignee && (
                                <TableCell className="text-sm">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help">
                                        {highlightSearchTerm(manuscript.assignedTo, searchTerm)}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Assigned curator/reviewer</p>
                                      <p className="text-xs text-muted-foreground">
                                        Last modified: {new Date(manuscript.lastModified).toLocaleString()}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              )}
                              {visibleColumns.notes && (
                                <TableCell className="max-w-xs">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="truncate cursor-help" title={manuscript.notes}>
                                        {highlightSearchTerm(manuscript.notes, searchTerm)}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-md">
                                      <p className="whitespace-pre-wrap">{manuscript.notes}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {filteredAndSortedManuscripts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No manuscripts found matching your criteria.</p>
                        <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

export { ManuscriptDashboard }
