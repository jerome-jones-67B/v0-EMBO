"use client"

import { useState, useMemo, useEffect } from "react"
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
import { AuthorList } from "./author-list"
import { UserNav } from "./user-nav"
import { useSession } from "next-auth/react"
import { endpoints, config } from "@/lib/config"
import { dataService } from "@/lib/data-service"
import { getValidStatusesForTab as getValidStatuses, getStatusMapping } from "@/lib/status-mapping"
import { Eye, Download, MoreHorizontal, Pause, Play, Flag, ChevronRight, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Check, AlertTriangle, Users, Info, Edit2, UserPlus, UserMinus, Clock, X, FileText, Archive, Image } from "lucide-react"

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
    aiChecks: {
      total: 8,
      errors: 2,
      warnings: 4,
      info: 2,
      dismissed: 1
    },
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
    aiChecks: {
      total: 12,
      errors: 1,
      warnings: 6,
      info: 5,
      dismissed: 0
    },
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
    aiChecks: {
      total: 15,
      errors: 5,
      warnings: 7,
      info: 3,
      dismissed: 2
    },
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
    aiChecks: {
      total: 5,
      errors: 0,
      warnings: 2,
      info: 3,
      dismissed: 0
    },
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
    aiChecks: {
      total: 9,
      errors: 3,
      warnings: 4,
      info: 2,
      dismissed: 1
    },
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
    aiChecks: {
      total: 7,
      errors: 1,
      warnings: 3,
      info: 3,
      dismissed: 0
    },
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
    aiChecks: {
      total: 4,
      errors: 0,
      warnings: 1,
      info: 3,
      dismissed: 0
    },
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
    aiChecks: {
      total: 6,
      errors: 0,
      warnings: 4,
      info: 2,
      dismissed: 1
    },
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
    aiChecks: {
      total: 3,
      errors: 0,
      warnings: 1,
      info: 2,
      dismissed: 0
    },
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
    aiChecks: {
      total: 11,
      errors: 2,
      warnings: 5,
      info: 4,
      dismissed: 1
    },
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
    aiChecks: {
      total: 6,
      errors: 0,
      warnings: 3,
      info: 3,
      dismissed: 1
    },
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
    aiChecks: {
      total: 20,
      errors: 8,
      warnings: 9,
      info: 3,
      dismissed: 4
    },
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
    aiChecks: {
      total: 2,
      errors: 0,
      warnings: 0,
      info: 2,
      dismissed: 0
    },
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
    aiChecks: {
      total: 8,
      errors: 1,
      warnings: 4,
      info: 3,
      dismissed: 0
    },
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
    aiChecks: {
      total: 6,
      errors: 1,
      warnings: 2,
      info: 3,
      dismissed: 0
    },
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
    aiChecks: {
      total: 4,
      errors: 0,
      warnings: 1,
      info: 3,
      dismissed: 0
    },
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

// Helper function to build full API URLs
const buildApiUrl = (endpoint: string): string => {
  // Always use relative paths to avoid CORS issues between different Vercel deployments
  const baseUrl = config.api.baseUrl.startsWith('http') ? '/api' : config.api.baseUrl
  return `${baseUrl}${endpoint}`
}

// Function to compute AI checks summary from QC checks data
function computeAIChecksSummary(manuscript: any) {
  // Get all QC checks from manuscript and figures
  const allChecks = [
    ...(Array.isArray(manuscript.qcChecks) ? manuscript.qcChecks : []),
    ...(manuscript?.figures || []).flatMap((fig: any) => fig.qcChecks || [])
  ];
  
  // Filter for AI-generated checks
  const aiChecks = allChecks.filter(check => check.aiGenerated);
  
  // If no AI checks found (likely API data without detailed checks), generate reasonable defaults
  if (aiChecks.length === 0 && manuscript.msid && !manuscript.msid.includes('EMBO-2024-')) {
    // Generate realistic AI checks based on manuscript properties for API data
    const msidHash = manuscript.msid.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const statusFactor = manuscript.status === 'segmented' ? 1.2 : 1.0;
    
    const baseChecks = Math.floor((msidHash % 8 + 4) * statusFactor); // 4-11 checks
    const errorRate = 0.15; // 15% errors
    const warningRate = 0.4; // 40% warnings  
    const infoRate = 0.45; // 45% info
    
    const errors = Math.floor(baseChecks * errorRate);
    const warnings = Math.floor(baseChecks * warningRate);
    const info = baseChecks - errors - warnings;
    const dismissed = Math.floor(baseChecks * 0.1); // 10% dismissed
    
    return {
      total: baseChecks,
      errors,
      warnings,
      info,
      dismissed
    };
  }
  
  // Compute counts by type from actual data
  const errors = aiChecks.filter(check => check.type === 'error').length;
  const warnings = aiChecks.filter(check => check.type === 'warning').length;
  const info = aiChecks.filter(check => check.type === 'info').length;
  const dismissed = aiChecks.filter(check => check.dismissed).length;
  const total = aiChecks.length;
  
  return {
    total,
    errors,
    warnings, 
    info,
    dismissed
  };
}

export default function ManuscriptDashboard() {
  const { data: session } = useSession()
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
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)
  const [downloadingManuscripts, setDownloadingManuscripts] = useState<Set<string>>(new Set())
  const [downloadProgress, setDownloadProgress] = useState<{[key: string]: {status: string, progress: number, currentFile?: string, totalFiles?: number, downloadedFiles?: number, currentFileSize?: string, downloadSpeed?: string}}>({})
  const [showDownloadToast, setShowDownloadToast] = useState<{[key: string]: boolean}>({})
  const [downloadConnections, setDownloadConnections] = useState<{[key: string]: EventSource | null}>({})
  const [downloadAbortControllers, setDownloadAbortControllers] = useState<{[key: string]: AbortController | null}>({})
  const [showPrioritySubmenu, setShowPrioritySubmenu] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, right: string} | null>(null)

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
    aiChecks: true,
    notes: true,
  })

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey as keyof typeof prev],
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

  const toggleOnHoldStatus = async (msid: string) => {
    if (useApiData) {
      // Update API manuscripts state
      setApiManuscripts((prev) =>
        prev.map((manuscript) => {
          if (manuscript.msid === msid) {
            const newStatus = manuscript.status === "On hold" ? "New submission" : "On hold"
            console.log(`📝 Toggling manuscript ${msid} status: ${manuscript.status} → ${newStatus}`)
            return { 
              ...manuscript, 
              status: newStatus,
              displayStatus: newStatus,
              lastModified: new Date().toISOString()
            }
          }
          return manuscript
        }),
      )
      
      // In a real implementation, this would call an API endpoint to update the status
      // For now, we'll just log the action and update the local state
      const manuscript = apiManuscripts.find(m => m.msid === msid)
      const newStatus = manuscript?.status === "On hold" ? "New submission" : "On hold"
      
      // Show user feedback
      setTimeout(() => {
        const action = newStatus === "On hold" ? "put on hold" : "removed from hold"
        alert(`Manuscript ${msid} has been ${action}.`)
      }, 100)
    } else {
      // Update mock manuscripts state
      setMockManuscripts((prev) =>
        prev.map((manuscript) => {
          if (manuscript.msid === msid) {
            const newStatus = manuscript.status === "On hold" ? "New submission" : "On hold"
            console.log(`📝 Toggling manuscript ${msid} status: ${manuscript.status} → ${newStatus}`)
            return { 
              ...manuscript, 
              status: newStatus,
              lastModified: new Date().toISOString()
            }
          }
          return manuscript
        }),
      )
      
      // Show user feedback for mock data too
      const manuscript = mockManuscripts.find(m => m.msid === msid)
      const newStatus = manuscript?.status === "On hold" ? "New submission" : "On hold"
      setTimeout(() => {
        const action = newStatus === "On hold" ? "put on hold" : "removed from hold"
        alert(`Manuscript ${msid} has been ${action}.`)
      }, 100)
    }
  }

  const changePriority = async (msid: string, newPriority: string) => {
    if (useApiData) {
      // Update API manuscripts state
      setApiManuscripts((prev) =>
        prev.map((manuscript) => {
          if (manuscript.msid === msid) {
            console.log(`📝 Changing manuscript ${msid} priority: ${manuscript.priority} → ${newPriority}`)
            return { 
              ...manuscript, 
              priority: newPriority,
              lastModified: new Date().toISOString()
            }
          }
          return manuscript
        }),
      )
      
      // In a real implementation, this would call an API endpoint to update the priority
      const manuscript = apiManuscripts.find(m => m.msid === msid)
      
      // Show user feedback
      setTimeout(() => {
        alert(`Manuscript ${msid} priority changed to ${newPriority}.`)
      }, 100)
    } else {
      // Update mock manuscripts state
      setMockManuscripts((prev) =>
        prev.map((manuscript) => {
          if (manuscript.msid === msid) {
            console.log(`📝 Changing manuscript ${msid} priority: ${manuscript.priority} → ${newPriority}`)
            return { 
              ...manuscript, 
              priority: newPriority,
              lastModified: new Date().toISOString()
            }
          }
          return manuscript
        }),
      )
      
      // Show user feedback for mock data too
      const manuscript = mockManuscripts.find(m => m.msid === msid)
      setTimeout(() => {
        alert(`Manuscript ${msid} priority changed to ${newPriority}.`)
      }, 100)
    }
    
    // Close the submenu
    setShowPrioritySubmenu(null)
  }

  // Function to assign manuscript to current user
  const assignToMe = async (msid: string) => {
    if (!session?.user) {
      alert('You must be logged in to assign manuscripts.')
      return
    }

    const userName = session.user.name || session.user.email || 'Unknown User'
    
    if (useApiData) {
      // Update API manuscripts state
      setApiManuscripts((prev) =>
        prev.map((manuscript) => {
          if (manuscript.msid === msid) {
            return { 
              ...manuscript, 
              assignedTo: userName,
              lastModified: new Date().toISOString()
            }
          }
          return manuscript
        }),
      )
      
      // In a real implementation, this would call an API endpoint to update the assignment
      // PUT /api/v1/manuscripts/{id}/assign with { assignedTo: session.user.id }
      
      // Show user feedback
      setTimeout(() => {
        alert(`Manuscript ${msid} assigned to you.`)
      }, 100)
    } else {
      // Update the mock manuscripts state  
      setMockManuscripts((prev) =>
        prev.map((manuscript) => {
          if (manuscript.msid === msid) {
            return { 
              ...manuscript, 
              assignedTo: userName,
              lastModified: new Date().toISOString()
            }
          }
          return manuscript
        }),
      )
      
      // Show user feedback
      setTimeout(() => {
        alert(`Manuscript ${msid} assigned to you.`)
      }, 100)
    }

    // Close dropdown
    setOpenDropdown(null)
    setDropdownPosition(null)
  }

  // Function to unassign manuscript from current user
  const unassignFromMe = async (msid: string) => {
    if (!session?.user) {
      alert('You must be logged in to unassign manuscripts.')
      return
    }
    
    if (useApiData) {
      // Update API manuscripts state
      setApiManuscripts((prev) =>
        prev.map((manuscript) => {
          if (manuscript.msid === msid) {
            return { 
              ...manuscript, 
              assignedTo: "",
              lastModified: new Date().toISOString()
            }
          }
          return manuscript
        }),
      )
      
      // In a real implementation, this would call an API endpoint to update the assignment
      // DELETE /api/v1/manuscripts/{id}/assign
      
      // Show user feedback
      setTimeout(() => {
        alert(`Manuscript ${msid} unassigned from you.`)
      }, 100)
    } else {
      // Update the mock manuscripts state  
      setMockManuscripts((prev) =>
        prev.map((manuscript) => {
          if (manuscript.msid === msid) {
            return { 
              ...manuscript, 
              assignedTo: "",
              lastModified: new Date().toISOString()
            }
          }
          return manuscript
        }),
      )
      
      // Show user feedback
      setTimeout(() => {
        alert(`Manuscript ${msid} unassigned from you.`)
      }, 100)
    }

    // Close dropdown
    setOpenDropdown(null)
    setDropdownPosition(null)
  }

  // Helper function to check if current user is assigned to a manuscript
  const isAssignedToMe = (manuscript: any) => {
    if (!session?.user || !manuscript.assignedTo || manuscript.assignedTo === "") return false
    const userName = session.user.name || session.user.email || 'Unknown User'
    return manuscript.assignedTo === userName
  }

  const handleDownloadFiles = async (msid: string, title: string, fileType: string = 'essential') => {
    
    // Determine the manuscript ID for the API call
    const manuscriptId = useApiData ? 
      (apiManuscripts.find(m => m.msid === msid)?.id?.toString() || msid) : 
      msid;
    
    // Create AbortController for this download
    const abortController = new AbortController();
    setDownloadAbortControllers(prev => ({...prev, [msid]: abortController}));
    
    // Add manuscript to downloading set and show progress
    setDownloadingManuscripts(prev => new Set(prev).add(msid));
    setShowDownloadToast(prev => ({...prev, [msid]: true}));
    
    // Set up Server-Sent Events connection for real-time progress
    const progressUrl = buildApiUrl(`/v1/manuscripts/${manuscriptId}/download/progress`);
    const eventSource = new EventSource(progressUrl, { withCredentials: true });
    
    setDownloadConnections(prev => ({...prev, [msid]: eventSource}));
    
    eventSource.onopen = () => {
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'progress') {
          setDownloadProgress(prev => ({
            ...prev,
            [msid]: {
              status: data.status,
              progress: data.progress,
              totalFiles: data.totalFiles,
              downloadedFiles: data.downloadedFiles,
              currentFile: data.currentFile,
              currentFileSize: data.currentFileSize
            }
          }));
        } else if (data.type === 'complete') {
          setDownloadProgress(prev => ({
            ...prev,
            [msid]: {
              status: data.status,
              progress: data.progress,
              totalFiles: data.totalFiles,
              downloadedFiles: data.successfulFiles,
              currentFile: data.filename,
              currentFileSize: data.fileSize
            }
          }));
        } else if (data.type === 'error') {
          setDownloadProgress(prev => ({
            ...prev,
            [msid]: {
              status: 'Download failed',
              progress: 0,
              currentFile: data.error
            }
          }));
          
          setTimeout(() => {
            alert(`Download Failed\n\nError: ${data.error}\n\nManuscript: ${title}\nMSID: ${msid}\n\nPlease try again or contact support if the problem persists.`);
          }, 500);
        } else if (data.type === 'cancelled') {
          setDownloadProgress(prev => ({
            ...prev,
            [msid]: {
              status: 'Download cancelled',
              progress: data.progress || 0,
              currentFile: data.message || 'Download was cancelled'
            }
          }));
          
          console.log(`🛑 Download cancelled for ${msid}: ${data.message}`);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse SSE message:', parseError);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error(`❌ SSE connection error for ${msid}:`, error);
      eventSource.close();
      setDownloadConnections(prev => ({...prev, [msid]: null}));
    };
    
    try {
      // Build the download URL with specified file type
      const downloadUrl = buildApiUrl(`/v1/manuscripts/${manuscriptId}/download?format=zip&type=${fileType}`);
      
      
      // Make the API call (this will trigger the SSE progress updates)
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Cookie': document.cookie,
        },
        credentials: 'include',
        signal: abortController.signal,
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${msid}_files.zip`;
      
      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary download link and click it
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);
      
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      
      // Check if this was a user cancellation
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`🛑 Download cancelled by user for ${msid}`);
        setDownloadProgress(prev => ({
          ...prev, 
          [msid]: {status: 'Download cancelled', progress: 0}
        }));
      } else {
        setDownloadProgress(prev => ({
          ...prev, 
          [msid]: {status: 'Download failed', progress: 0}
        }));
        
        // Show error notification with fallback options (only for actual errors, not cancellations)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setTimeout(() => {
          alert(`Download Failed\n\nError: ${errorMessage}\n\nManuscript: ${title}\nMSID: ${msid}\n\nPlease try again or contact support if the problem persists.`);
        }, 500);
      }
    } finally {
      // Clean up AbortController
      setDownloadAbortControllers(prev => ({...prev, [msid]: null}));
      
      // Close SSE connection and hide progress after a delay
      setTimeout(() => {
        const connection = downloadConnections[msid];
        if (connection) {
          connection.close();
          setDownloadConnections(prev => ({...prev, [msid]: null}));
        }
        
        setDownloadingManuscripts(prev => {
          const newSet = new Set(prev);
          newSet.delete(msid);
          return newSet;
        });
        setShowDownloadToast(prev => ({...prev, [msid]: false}));
        setDownloadProgress(prev => {
          const newProgress = {...prev};
          delete newProgress[msid];
          return newProgress;
        });
      }, 5000); // Hide after 5 seconds to show completion status
    }
  }


  const filteredAndSortedManuscripts = useMemo(() => {
    const currentManuscripts = useApiData ? apiManuscripts : mockManuscripts
    
    // Enhance manuscripts with computed aiChecks if they don't have them
    const enhancedManuscripts = currentManuscripts.map(manuscript => {
      if (!manuscript.aiChecks) {
        // Compute aiChecks from QC checks data
        const computedAiChecks = computeAIChecksSummary(manuscript);
        return {
          ...manuscript,
          aiChecks: computedAiChecks
        };
      }
      return manuscript;
    });
    
    const filtered = enhancedManuscripts.filter((manuscript) => {
      // Use workflowState for tab filtering (mapped from API status)
      const workflowState = manuscript.workflowState || 'no-pipeline-results'
      if (workflowState !== activeTab) return false

      // Use displayStatus for status filtering (consistent with statusCounts)
      const displayStatus = manuscript.displayStatus || manuscript.status
      if (statusFilter !== "all" && displayStatus !== statusFilter) {
        // Debug logging to track filtering behavior
        if (process.env.NODE_ENV === 'development' && statusFilter === "New submission") {
          console.log(`❌ Filtered out ${manuscript.msid}: displayStatus="${displayStatus}", status="${manuscript.status}", statusFilter="${statusFilter}"`)
        }
        return false
      }

      // Debug logging for manuscripts that pass status filter
      if (process.env.NODE_ENV === 'development' && statusFilter === "New submission") {
        console.log(`✅ Included ${manuscript.msid}: displayStatus="${displayStatus}", status="${manuscript.status}", statusFilter="${statusFilter}"`)
      }

      // Fixed priority filtering logic
      if (priorityFilter !== "all") {
        if (priorityFilter === "urgent" && manuscript.priority !== "urgent") return false
        if (priorityFilter === "normal" && manuscript.priority !== "normal") return false
      }

      // Improved assignee filtering to handle null/undefined values
      if (assigneeFilter !== "all") {
        const assignedTo = manuscript.assignedTo || ""
        if (assignedTo !== assigneeFilter) return false
      }

      // Enhanced search functionality
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const fieldsToSearch = [
          manuscript.msid || "",
          manuscript.title || "",
          manuscript.authors || "",
          manuscript.doi || "",
          manuscript.accessionNumber || "",
          manuscript.notes || "",
          manuscript.assignedTo || ""
        ]
        
        return fieldsToSearch.some(field => 
          field.toLowerCase().includes(searchLower)
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

    const finalResults = filtered.sort((a, b) => {
      if (a.priority === "urgent" && b.priority !== "urgent") return -1
      if (b.priority === "urgent" && a.priority !== "urgent") return 1

      if (a.priority === "high" && b.priority === "normal") return -1
      if (b.priority === "high" && a.priority === "normal") return 1

      if (a.status === "On hold" && b.status !== "On hold") return -1
      if (b.status === "On hold" && a.status !== "On hold") return 1

      return 0
    })

    // Debug logging for final results when filtering by "New submission"
    if (process.env.NODE_ENV === 'development' && statusFilter === "New submission") {
      console.log(`📊 Final results for "${statusFilter}" filter:`, finalResults.map(m => ({
        msid: m.msid,
        status: m.status,
        displayStatus: m.displayStatus,
        workflowState: m.workflowState
      })))
    }

    return finalResults
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
      className = "border-gray-300 text-gray-700"
      tooltipContent += "New submission - no work has been done yet"
    } else if (displayStatus === "In Progress" || displayStatus === "In progress") {
      variant = "secondary"
      className = "bg-blue-50 text-blue-700 border-blue-200"
      if (hasErrors) {
        tooltipContent += "In Progress - critical validation errors found, requires immediate attention"
      } else if (hasWarnings) {
        tooltipContent += "In Progress - minor issues detected, review recommended"
      } else {
        tooltipContent += "In Progress - work has been applied, progressing normally"
      }
    } else if (displayStatus === "Needs revision" || displayStatus === "Needs Revision") {
      variant = "destructive"
      className = "bg-orange-50 text-orange-700 border-orange-200"
      tooltipContent = "Needs revision - requires author changes before proceeding"
    } else if (displayStatus === "On hold") {
      variant = "destructive"
      className = "bg-red-50 text-red-700 border-red-200"
      tooltipContent = "On hold - cannot be reviewed or processed, requires attention"
    }
    // Deposited to BioStudies statuses
    else if (displayStatus === "Approved") {
      variant = "secondary"
      className = "bg-green-50 text-green-700 border-green-200"
      tooltipContent = "Approved - manuscript accepted and ready for publication"
    } else if (displayStatus === "Deposited") {
      variant = "secondary"
      className = "bg-purple-50 text-purple-700 border-purple-200"
      tooltipContent = "Deposited - data successfully deposited to repositories"
    } else if (displayStatus === "Published") {
      variant = "secondary"
      className = "bg-emerald-50 text-emerald-700 border-emerald-200"
      tooltipContent = "Published - manuscript successfully published"
    } else if (displayStatus === "Rejected") {
      variant = "destructive"
      className = "bg-red-50 text-red-700 border-red-200"
      tooltipContent = "Rejected - requires attention"
    }
    // No Pipeline Results statuses
    else if (displayStatus === "Waiting for data") {
      variant = "outline"
      className = "border-blue-200 text-blue-700"
      tooltipContent = "Waiting for backend pipeline processing"
    }
    // Fallback for any unmapped statuses
    else {
      variant = "outline"
      className = "border-gray-300 text-gray-700"
      tooltipContent = `Status: ${displayStatus}`
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
            Urgent
          </Badge>
        )
      case "high":
        return (
          <Badge variant="destructive" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
            High
          </Badge>
        )
      case "normal":
        // No badge for normal priority - it's the default
        return null
      case "low":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
            Low
          </Badge>
        )
      default:
        // Only show badge for non-standard priority values
        if (priority && priority !== "normal") {
          return (
            <Badge variant="outline" className="text-xs">
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
          )
        }
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
    setIsLoadingApi(true)
    
    // In demo/development mode, allow API calls without session
    const isDemoMode = process.env.NODE_ENV === "development" || 
                       process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
    
    if (!session && !isDemoMode) {
      console.error('❌ No session available for API call')
      setIsLoadingApi(false)
      return
    }
    
    try {
      // Build URL with explicit pagination parameters to ensure first page
      const url = new URL(buildApiUrl(endpoints.manuscripts), window.location.origin)
      url.searchParams.set('page', '0')
      url.searchParams.set('pagesize', '100') // Get more items to show full list
      url.searchParams.set('sort', 'received_at')
      url.searchParams.set('ascending', 'true')
      
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie, // Include session cookies
        },
        credentials: 'include', // Include cookies in the request
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform API data to match our mock data structure using proper status mapping
      const transformedManuscripts = data.manuscripts.map((manuscript: any) => {
        const statusMapping = getStatusMapping(manuscript.status)
        return {
          id: manuscript.id, // ✅ Include the integer ID for API calls
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
          // Note: API response doesn't include figures/check_results - AI checks will be computed as fallback
          figures: [], // Empty for now, detailed data would come from individual manuscript endpoint
          qcChecks: [], // Empty for now, detailed data would come from individual manuscript endpoint
          // UI-specific fields
          displayStatus: statusMapping.displayStatus,
          badgeVariant: statusMapping.badgeVariant,
          isMapped: statusMapping.isMapped,
          unmappedFields: ['assignedTo'], // Fields not available in API
        }
      })
      
      setApiManuscripts(transformedManuscripts)
    } catch (error) {
      console.error('❌ Failed to fetch API data:', error)
      // Keep using mock data on error
      setUseApiData(false)
    } finally {
      setIsLoadingApi(false)
      setIsInitialLoadComplete(true)
    }
  }

  // Initial data loading effect
  useEffect(() => {
    const initializeData = async () => {
      if (useApiData) {
        await fetchApiData()
      } else {
        setIsInitialLoadComplete(true)
      }
    }

    initializeData()
  }, []) // Only run on mount

  // Switch between API and mock data
  const handleDataSourceSwitch = async (useApi: boolean) => {
    setUseApiData(useApi)
    setIsInitialLoadComplete(false) // Reset load state when switching
    
    // Update the data service to use the correct data source
    dataService.setUseMockData(!useApi)
    
    if (useApi && apiManuscripts.length === 0) {
      await fetchApiData()
    } else {
      // For mock data, mark as loaded immediately
      setIsInitialLoadComplete(true)
    }
  }

  const getUniqueAssignees = () => {
    const currentManuscripts = useApiData ? apiManuscripts : mockManuscripts
    const assignees = [...new Set(currentManuscripts.map((m) => m.assignedTo))]
    const sortedAssignees = assignees.sort()

    // If current user has assigned manuscripts, put them first
    if (sortedAssignees.includes(currentUser)) {
      const otherAssignees = sortedAssignees.filter((assignee) => assignee !== currentUser)
      return [currentUser, ...otherAssignees]
    }

    return sortedAssignees
  }

  const getTabCounts = () => {
    const currentManuscripts = useApiData ? apiManuscripts : mockManuscripts
    const counts = {
      "ready-for-curation": { total: 0, new: 0, inProgress: 0, onHold: 0, needsValidation: 0, urgent: 0 },
      "deposited-to-biostudies": { total: 0, needsValidation: 0, urgent: 0, onHold: 0, new: 0, inProgress: 0 },
      "no-pipeline-results": { total: 0, needsValidation: 0, urgent: 0, onHold: 0, new: 0, inProgress: 0 },
    }

    currentManuscripts.forEach((manuscript) => {
      if (manuscript.workflowState === "ready-for-curation") {
        counts["ready-for-curation"].total++
        if (manuscript.status === "New submission") counts["ready-for-curation"].new++
        if (manuscript.status === "In Progress") counts["ready-for-curation"].inProgress++
        if (manuscript.status === "On hold") counts["ready-for-curation"].onHold++
        if (manuscript.hasErrors || manuscript.hasWarnings)
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
    const currentManuscripts = useApiData ? apiManuscripts : mockManuscripts
    const totalManuscripts = currentManuscripts.length
    const urgentCount = currentManuscripts.filter((m) => m.priority === "urgent").length
    const onHoldCount = currentManuscripts.filter((m) => m.status === "On hold").length
    const newCount = currentManuscripts.filter((m) => m.status === "New submission").length
    const inProgressCount = currentManuscripts.filter((m) => m.status === "In Progress").length
    const totalOnHoldCount = currentManuscripts.filter((m) => m.status === "On hold").length

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
    const currentManuscripts = useApiData ? apiManuscripts : mockManuscripts
    const counts = {
      "New submission": 0,
      "In Progress": 0,
      "On hold": 0,
      Deposited: 0,
      "Failed to deposit": 0,
      "Waiting for data": 0,
    }

    // Filter manuscripts for current tab first, then count statuses
    currentManuscripts
      .filter(manuscript => {
        const workflowState = manuscript.workflowState || 'no-pipeline-results'
        return workflowState === activeTab
      })
      .forEach((manuscript) => {
        // Use displayStatus consistently with filtering logic
        const status = (manuscript.displayStatus || manuscript.status) as keyof typeof counts
        if (status && counts.hasOwnProperty(status)) {
          counts[status] = (counts[status] || 0) + 1
        }
      })

    return counts
  }

  const getPriorityCounts = () => {
    const currentManuscripts = useApiData ? apiManuscripts : mockManuscripts
    const counts = {
      urgent: 0,
      normal: 0,
    }

    // Filter manuscripts for current tab first, then count priorities
    currentManuscripts
      .filter(manuscript => {
        const workflowState = manuscript.workflowState || 'no-pipeline-results'
        return workflowState === activeTab
      })
      .forEach((manuscript) => {
        const priority = manuscript.priority || "normal"
        if (priority === "urgent") {
          counts.urgent++
        } else {
          counts.normal++
        }
      })

    return counts
  }

  const getAssigneeCounts = () => {
    const currentManuscripts = useApiData ? apiManuscripts : mockManuscripts
    const counts: Record<string, number> = {}

    // Filter manuscripts for current tab first, then count assignees
    currentManuscripts
      .filter(manuscript => {
        const workflowState = manuscript.workflowState || 'no-pipeline-results'
        return workflowState === activeTab
      })
      .forEach((manuscript) => {
        const assignee = manuscript.assignedTo || "Unassigned"
        counts[assignee] = (counts[assignee] || 0) + 1
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
  const priorityCounts = getPriorityCounts()
  const assigneeCounts = getAssigneeCounts()

  // Debug: Log status distribution when in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const currentManuscripts = useApiData ? apiManuscripts : mockManuscripts
      const manuscriptsInCurrentTab = currentManuscripts.filter(manuscript => {
        const workflowState = manuscript.workflowState || 'no-pipeline-results'
        return workflowState === activeTab
      })
      
      console.log(`📋 Manuscripts in "${activeTab}" tab:`, manuscriptsInCurrentTab.map(m => ({
        msid: m.msid,
        status: m.status,
        displayStatus: m.displayStatus,
        workflowState: m.workflowState
      })))
    }
  }, [activeTab, useApiData, apiManuscripts, mockManuscripts])

  // Loading screen component
  const LoadingScreen = () => (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Loading EMBO Dashboard</h2>
          <p className="text-gray-600">
            {useApiData 
              ? "Fetching manuscript data from Data4Rev API..."
              : "Preparing dashboard interface..."
            }
          </p>
        </div>
        
        {useApiData && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Zap className="w-4 h-4 text-green-600" />
            <span>Connected to live API</span>
          </div>
        )}
      </div>
    </div>
  )

  // Show loading screen if initial data hasn't loaded yet
  if (!isInitialLoadComplete || (useApiData && isLoadingApi && apiManuscripts.length === 0)) {
    return <LoadingScreen />
  }

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
                  <div className="flex items-center gap-4">
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
                </div>
                <p className="text-muted-foreground">Manuscript validation and curation workflow management</p>
              </div>
              <div className="flex items-center gap-4">
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
                <UserNav />
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
                        <SelectItem value="urgent">Urgent ({priorityCounts.urgent})</SelectItem>
                        <SelectItem value="normal">Normal ({priorityCounts.normal})</SelectItem>
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
                            {assignee === currentUser 
                              ? `${assignee} (me) (${assigneeCounts[assignee] || 0})` 
                              : `${assignee} (${assigneeCounts[assignee] || 0})`
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Progress Indicators */}
            {Object.entries(showDownloadToast).filter(([_, show]) => show).map(([msid, _]) => {
              const progress = downloadProgress[msid];
              const manuscript = [...(useApiData ? apiManuscripts : mockManuscripts)].find(m => m.msid === msid);
              
              if (!progress || !manuscript) return null;
              
              return (
                <Card key={msid} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {progress.progress === 100 ? (
                            <Check className="w-5 h-5 text-blue-600" />
                          ) : progress.status.includes('failed') ? (
                            <X className="w-5 h-5 text-red-600" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-blue-900 truncate">
                            Downloading: {manuscript.title}
                          </h4>
                          <span className="text-xs text-blue-600 font-mono">
                            {msid}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 bg-blue-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                progress.status.includes('failed') 
                                  ? 'bg-red-500' 
                                  : progress.progress === 100 
                                    ? 'bg-green-500' 
                                    : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-blue-600 font-medium">
                            {progress.progress}%
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-blue-700">
                            {progress.status}
                            {progress.totalFiles && (
                              <span className="ml-1 text-blue-500">
                                ({progress.downloadedFiles || 0}/{progress.totalFiles} files)
                              </span>
                            )}
                          </p>
                          
                          {progress.currentFile && (
                            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] truncate mr-2">
                                  📁 {progress.currentFile}
                                </span>
                                {progress.currentFileSize && (
                                  <span className="text-blue-500 text-[10px] flex-shrink-0">
                                    {progress.currentFileSize}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          // Abort the download request if it's in progress
                          const abortController = downloadAbortControllers[msid];
                          if (abortController && !abortController.signal.aborted) {
                            console.log(`🛑 Aborting download for ${msid}`);
                            abortController.abort();
                          }
                          
                          // Close SSE connection when manually closing
                          const connection = downloadConnections[msid];
                          if (connection) {
                            connection.close();
                            setDownloadConnections(prev => ({...prev, [msid]: null}));
                          }
                          
                          // Clean up AbortController
                          setDownloadAbortControllers(prev => ({...prev, [msid]: null}));
                          
                          setShowDownloadToast(prev => ({...prev, [msid]: false}));
                          setDownloadProgress(prev => {
                            const newProgress = {...prev};
                            delete newProgress[msid];
                            return newProgress;
                          });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ready-for-curation" className="flex items-center gap-2">
                  <Tooltip delayDuration={800}>
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
                                { key: "aiChecks", label: "AI Checks" },
                                { key: "notes", label: "Notes" },
                              ].map((column) => (
                                <div key={column.key} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={column.key}
                                    checked={visibleColumns[column.key as keyof typeof visibleColumns]}
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
                            {visibleColumns.aiChecks && (
                              <TableHead>
                                <div className="flex items-center gap-1">
                                  <Zap className="w-4 h-4 text-blue-500" />
                                  AI Checks
                                </div>
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
                                        
                                        if (openDropdown === manuscript.msid) {
                                          setOpenDropdown(null)
                                          setDropdownPosition(null)
                                        } else {
                                          // Calculate position relative to viewport
                                          const rect = e.currentTarget.getBoundingClientRect()
                                          const dropdownWidth = 192 // 48 * 4 = 192px (w-48)
                                          const viewportWidth = window.innerWidth
                                          const viewportHeight = window.innerHeight
                                          
                                          // Calculate horizontal position
                                          let left = rect.left
                                          let right = 'auto'
                                          
                                          // If dropdown would overflow on the right, align it to the right edge of button
                                          if (rect.left + dropdownWidth > viewportWidth) {
                                            left = rect.right - dropdownWidth
                                          }
                                          
                                          // If it still overflows on the left, clamp to viewport edge
                                          if (left < 8) {
                                            left = 8
                                          }
                                          
                                          // Calculate vertical position
                                          let top = rect.bottom + 4
                                          
                                          // If dropdown would overflow at bottom, show it above the button
                                          if (top + 300 > viewportHeight) { // Approximate dropdown height
                                            top = rect.top - 300 - 4
                                          }
                                          
                                          // Ensure it doesn't go above viewport
                                          if (top < 8) {
                                            top = 8
                                          }
                                          
                                          setDropdownPosition({
                                            top,
                                            left,
                                            right: 'auto'
                                          })
                                          setOpenDropdown(manuscript.msid)
                                        }
                                      }}
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>

                                    {openDropdown === manuscript.msid && (
                                      <>
                                        {/* Backdrop */}
                                        <div className="fixed inset-0 z-40" onClick={() => {
                                          setOpenDropdown(null)
                                          setShowPrioritySubmenu(null)
                                          setDropdownPosition(null)
                                        }} />

                                        <div 
                                          className="fixed w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                                          style={{
                                            top: `${dropdownPosition?.top || 0}px`,
                                            left: `${dropdownPosition?.left || 0}px`,
                                            right: dropdownPosition?.right || 'auto'
                                          }}
                                        >
                                          <div className="py-1">
                                            <button
                                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setSelectedManuscript(useApiData ? manuscript.id?.toString() || manuscript.msid : manuscript.msid)
                                                setOpenDropdown(null)
                                                setDropdownPosition(null)
                                              }}
                                            >
                                              <Eye className="w-4 h-4 mr-2" />
                                              View details
                                            </button>

                                            <div className="relative">
                                              <button
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer relative group"
                                                onClick={(e) => {
                                                  e.preventDefault()
                                                  e.stopPropagation()
                                                  handleDownloadFiles(manuscript.msid, manuscript.title, 'essential')
                                                  setOpenDropdown(null)
                                                  setDropdownPosition(null)
                                                }}
                                              >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download files
                                                <ChevronRight className="w-3 h-3 ml-auto opacity-50 group-hover:opacity-100" />
                                              </button>
                                              
                                              {/* Download submenu */}
                                              <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                <button
                                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                  onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleDownloadFiles(manuscript.msid, manuscript.title, 'essential')
                                                    setOpenDropdown(null)
                                                  }}
                                                >
                                                  <FileText className="w-4 h-4 mr-2" />
                                                  Essential files
                                                  <span className="ml-auto text-xs text-gray-500">Default</span>
                                                </button>
                                                <button
                                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                  onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleDownloadFiles(manuscript.msid, manuscript.title, 'all')
                                                    setOpenDropdown(null)
                                                  }}
                                                >
                                                  <Archive className="w-4 h-4 mr-2" />
                                                  Complete archive
                                                  <span className="ml-auto text-xs text-gray-500">All files</span>
                                                </button>
                                                <div className="border-t border-gray-200 my-1" />
                                                <button
                                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                  onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleDownloadFiles(manuscript.msid, manuscript.title, 'manuscript')
                                                    setOpenDropdown(null)
                                                  }}
                                                >
                                                  <FileText className="w-4 h-4 mr-2" />
                                                  Manuscript only
                                                </button>
                                                <button
                                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                  onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleDownloadFiles(manuscript.msid, manuscript.title, 'figures')
                                                    setOpenDropdown(null)
                                                  }}
                                                >
                                                  <Image className="w-4 h-4 mr-2" />
                                                  Figures only
                                                </button>
                                                <button
                                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                  onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleDownloadFiles(manuscript.msid, manuscript.title, 'supplementary')
                                                    setOpenDropdown(null)
                                                  }}
                                                >
                                                  <Database className="w-4 h-4 mr-2" />
                                                  Supplementary data
                                                </button>
                                              </div>
                                            </div>

                                            <div className="border-t border-gray-200 my-1" />

                                            <button
                                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                toggleOnHoldStatus(manuscript.msid)
                                                setOpenDropdown(null)
                                                setDropdownPosition(null)
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

                                            {isAssignedToMe(manuscript) ? (
                                              <button
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                onClick={(e) => {
                                                  e.preventDefault()
                                                  e.stopPropagation()
                                                  unassignFromMe(manuscript.msid)
                                                }}
                                              >
                                                <UserMinus className="w-4 h-4 mr-2" />
                                                Unassign from me
                                              </button>
                                            ) : (
                                              <button
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                onClick={(e) => {
                                                  e.preventDefault()
                                                  e.stopPropagation()
                                                  assignToMe(manuscript.msid)
                                                }}
                                              >
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Assign to me
                                              </button>
                                            )}

                                            <div className="border-t border-gray-200 my-1" />
                                            
                                            <div className="relative">
                                              <button
                                                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer justify-between"
                                                onClick={(e) => {
                                                  e.preventDefault()
                                                  e.stopPropagation()
                                                  setShowPrioritySubmenu(showPrioritySubmenu === manuscript.msid ? null : manuscript.msid)
                                                }}
                                              >
                                                <div className="flex items-center">
                                                  <Flag className="w-4 h-4 mr-2" />
                                                  Change priority
                                                </div>
                                                <ChevronRight className="w-4 h-4" />
                                              </button>
                                              
                                              {showPrioritySubmenu === manuscript.msid && (
                                                <div className="fixed w-40 bg-white border border-gray-200 rounded-md shadow-lg z-60"
                                                  style={{
                                                    top: `${(dropdownPosition?.top || 0)}px`,
                                                    left: (() => {
                                                      const baseLeft = (dropdownPosition?.left || 0) + 192 + 4; // 192 (dropdown width) + 4 (gap)
                                                      const submenuWidth = 160; // w-40 = 160px
                                                      const viewportWidth = window.innerWidth;
                                                      
                                                      // If submenu would overflow on the right, position it to the left of main dropdown
                                                      if (baseLeft + submenuWidth > viewportWidth - 8) {
                                                        return `${(dropdownPosition?.left || 0) - submenuWidth - 4}px`;
                                                      }
                                                      
                                                      return `${baseLeft}px`;
                                                    })()
                                                  }}
                                                >
                                                  <div className="py-1">
                                                    {["urgent", "high", "normal", "low"].map((priority) => (
                                                      <button
                                                        key={priority}
                                                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                                                          manuscript.priority === priority ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                        }`}
                                                        onClick={(e) => {
                                                          e.preventDefault()
                                                          e.stopPropagation()
                                                          changePriority(manuscript.msid, priority)
                                                          setOpenDropdown(null)
                                                          setDropdownPosition(null)
                                                        }}
                                                      >
                                                        <div className={`w-2 h-2 rounded-full mr-3 ${
                                                          priority === 'urgent' ? 'bg-red-500' :
                                                          priority === 'high' ? 'bg-orange-500' :
                                                          priority === 'normal' ? 'bg-green-500' :
                                                          'bg-gray-400'
                                                        }`} />
                                                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                        {manuscript.priority === priority && (
                                                          <Check className="w-3 h-3 ml-auto text-blue-700" />
                                                        )}
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                            </div>

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
                              {visibleColumns.aiChecks && (
                                <TableCell className="text-sm">
                                    {manuscript.aiChecks ? (
                                     <div className="flex flex-col gap-0.5 pt-0.5 mt-4">
                                       <div className="flex items-center gap-1 ">
                                         <Badge variant="destructive" className="text-xs px-1 py-0">
                                           {manuscript.aiChecks.errors}E
                                         </Badge>
                                         <Badge variant="secondary" className="text-xs px-1 py-0">
                                           {manuscript.aiChecks.warnings}W
                                         </Badge>
                                         <Badge variant="outline" className="text-xs px-1 py-0">
                                           {manuscript.aiChecks.info}I
                                         </Badge>
                                         <Badge variant="outline" className="text-xs px-1 py-0 border-gray-300 text-gray-500">
                                           {manuscript.aiChecks.dismissed}D
                                         </Badge>
                                       </div>
                                       <div className="text-center">
                                         <span className="text-[10px] text-muted-foreground">
                                           {manuscript.aiChecks.total} total
                                         </span>
                                       </div>
                                     </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No AI checks</span>
                                  )}
                                </TableCell>
                              )}
                              {visibleColumns.received && (
                                <TableCell className="text-sm px-5 text-center">
                                  {new Date(manuscript.receivedDate).toLocaleDateString()}
                                </TableCell>
                              )}
                              {visibleColumns.msid && (
                                <TableCell className="text-sm font-medium">
                                  <button
                                    onClick={() => setSelectedManuscript(useApiData ? manuscript.id?.toString() || manuscript.msid : manuscript.msid)}
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
                                        onClick={() => setSelectedManuscript(useApiData ? manuscript.id?.toString() || manuscript.msid : manuscript.msid)}
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
                                      <div className="truncate cursor-help" title={typeof manuscript.authors === 'string' ? manuscript.authors : manuscript.authors.join(', ')}>
                                        <AuthorList 
                                          authors={manuscript.authors} 
                                          searchTerm={searchTerm}
                                          className="truncate"
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-md">
                                      <AuthorList authors={manuscript.authors} />
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
                                      <div className="flex items-center gap-2">
                                        {isAssignedToMe(manuscript) && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full" title="Assigned to you" />
                                        )}
                                        <span className="cursor-help">
                                          {manuscript.assignedTo || <span className="text-gray-400 italic">Unassigned</span>}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Assigned curator/reviewer</p>
                                      {isAssignedToMe(manuscript) && (
                                        <p className="text-xs text-blue-400">Assigned to you</p>
                                      )}
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
