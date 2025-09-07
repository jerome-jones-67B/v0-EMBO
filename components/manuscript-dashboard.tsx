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
import { Settings2 } from "lucide-react"
import { ManuscriptDetail } from "./manuscript-detail" // Import the new manuscript detail component
import { Eye, Download, MoreHorizontal, UserPlus, UserMinus, Pause, Play } from "lucide-react"
import {
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Edit2,
  Check,
  X,
  Clock,
} from "lucide-react"

type Author = string

interface Manuscript {
  msid: string
  receivedDate: string
  title: string
  authors: Author[]
  doi: string
  accessionNumber: string
  assignedTo: string
  status: string
  workflowState: string
  priority: string
  hasErrors: boolean
  hasWarnings: boolean
  notes: string
  lastModified: string
  assignee: string
  figureImage: string
  researchArea: string
}

const initialMockManuscripts: Manuscript[] = [
  {
    msid: "EMBO-2024-001",
    receivedDate: "2024-12-14",
    title: "Molecular mechanisms of heat shock protein 70 in cellular stress response and protein folding dynamics",
    authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez", "Dr. Lisa Wang"],
    doi: "10.15252/embj.001123456",
    accessionNumber: "EMBO-2024-001-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "In progress",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: true,
    notes: "Requires additional validation for protein structure data. Missing figure legends for panels C-E.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/heat-shock-proteins.jpg",
    researchArea: "protein-folding",
  },
  {
    msid: "EMBO-2024-002",
    receivedDate: "2024-12-25",
    title: "CRISPR-Cas9 mediated genome editing in pluripotent stem cells for therapeutic applications",
    authors: ["Dr. Karen Brown", "Dr. Mark Davis", "Dr. Patricia Wilson", "Dr. Steven Thompson"],
    doi: "10.15252/embj.002123456",
    accessionNumber: "EMBO-2024-002-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "In progress",
    workflowState: "ready-for-curation",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "CRISPR gene editing research with therapeutic focus. Initial review completed.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/crispr-stem-cells.jpg",
    researchArea: "gene-editing",
  },
  {
    msid: "EMBO-2024-003",
    receivedDate: "2024-12-28",
    title: "Mitochondrial dynamics in neurodegeneration: Role of fission and fusion proteins",
    authors: ["Dr. Luis Garcia", "Dr. Ana Martinez", "Dr. Carlos Lopez"],
    doi: "10.15252/embj.003123456",
    accessionNumber: "EMBO-2024-003-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "In progress",
    workflowState: "ready-for-curation",
    priority: "urgent",
    hasErrors: true,
    hasWarnings: false,
    notes: "Mitochondrial dynamics research in neurodegeneration. Missing required metadata files.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/mitochondrial-biogenesis.jpg",
    researchArea: "mitochondria",
  },
  {
    msid: "EMBO-2024-004",
    receivedDate: "2024-12-26",
    title: "Single-cell RNA sequencing reveals tumor microenvironment heterogeneity in pancreatic cancer",
    authors: ["Dr. Emma Thompson", "Dr. James Wilson", "Dr. Sophie Anderson"],
    doi: "10.15252/embj.004123456",
    accessionNumber: "EMBO-2024-004-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "Deposited",
    workflowState: "deposited-to-biostudies",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Single-cell analysis of pancreatic cancer. Successfully deposited to BioStudies.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/single-cell-umap-clusters.jpg",
    researchArea: "cancer-biology",
  },
  {
    msid: "EMBO-2024-005",
    receivedDate: "2024-12-27",
    title: "Epigenetic regulation of stem cell pluripotency through chromatin remodeling complexes",
    authors: ["Dr. Robert Kim", "Dr. Maria Santos", "Dr. David Lee"],
    doi: "10.15252/embj.005123456",
    accessionNumber: "EMBO-2024-005-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "In progress",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: true,
    notes: "Epigenetic regulation of stem cell pluripotency. Minor formatting issues identified.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/epigenetic-regulation.jpg",
    researchArea: "stem-cells",
  },
  {
    msid: "EMBO-2024-006",
    receivedDate: "2024-12-24",
    title: "Deciphering the role of long non-coding RNAs in regulating immune responses",
    authors: ["Dr. Celine Lefebvre", "Dr. Quynh Nguyen", "Dr. Antoine Dubois"],
    doi: "10.15252/embj.006123456",
    accessionNumber: "EMBO-2024-006-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "Waiting for data",
    workflowState: "no-pipeline-results",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Analysis of long non-coding RNAs in immune regulation. Manuscript processed, awaiting pipeline analysis.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/neural-circuits-memory.jpg",
    researchArea: "immunology",
  },
  {
    msid: "EMBO-2024-007",
    receivedDate: "2024-12-29",
    title: "The impact of gut microbiota on host metabolism and metabolic disorders",
    authors: ["Dr. Wei Zhao", "Dr. Rohan Patel", "Dr. Vijay Kumar"],
    doi: "10.15252/embj.007123456",
    accessionNumber: "EMBO-2024-007-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "New submission",
    workflowState: "ready-for-curation",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Gut microbiota research focusing on host metabolism. Recently submitted, pending initial review.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/tumor-immune-landscape.jpg",
    researchArea: "microbiology",
  },
  {
    msid: "EMBO-2024-008",
    receivedDate: "2024-12-23",
    title: "Unraveling the complexities of protein glycosylation in cellular signaling pathways",
    authors: ["Dr. Felix Schmidt", "Dr. Lena Hoffmann", "Dr. Markus Bauer"],
    doi: "10.15252/embj.008123456",
    accessionNumber: "EMBO-2024-008-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "In progress",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: true,
    notes: "Protein glycosylation research in cell signaling. Under review, minor formatting issues identified.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/crispr-chromatin-remodeling.jpg",
    researchArea: "biochemistry",
  },
  {
    msid: "EMBO-2024-009",
    receivedDate: "2024-12-30",
    title: "The role of autophagy in maintaining cellular homeostasis during aging",
    authors: ["Dr. Alessia Colombo", "Dr. Giovanni Rossi", "Dr. Sofia Ferrari"],
    doi: "10.15252/embj.009123456",
    accessionNumber: "EMBO-2024-009-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "Deposited",
    workflowState: "deposited-to-biostudies",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Autophagy research in cellular aging. Successfully processed and deposited.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/autophagy-neurodegeneration.jpg",
    researchArea: "cell-biology",
  },
  {
    msid: "EMBO-2024-010",
    receivedDate: "2024-12-22",
    title: "Exploring the therapeutic potential of CAR-T cell therapy in hematological malignancies",
    authors: ["Dr. Pierre Dubois", "Dr. Nathalie Moreau", "Dr. Laurent Girard"],
    doi: "10.15252/embj.010123456",
    accessionNumber: "EMBO-2024-010-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "Waiting for data",
    workflowState: "no-pipeline-results",
    priority: "urgent",
    hasErrors: false,
    hasWarnings: false,
    notes:
      "CAR-T cell therapy research in hematological malignancies. High priority manuscript awaiting computational analysis.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/immune-cell-heterogeneity.jpg",
    researchArea: "immunotherapy",
  },
  {
    msid: "EMBO-2024-011",
    receivedDate: "2024-12-17",
    title: "Investigating the role of circular RNAs in cancer development and progression",
    authors: ["Dr. Anna Berger", "Dr. Oliver Klein", "Dr. Petra Sommer"],
    doi: "10.15252/embj.011123456",
    accessionNumber: "EMBO-2024-011-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "In progress",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: true,
    notes: "Circular RNAs research in cancer. Pending author response to reviewer comments.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/protein-folding-disease.jpg",
    researchArea: "cancer-biology",
  },
  {
    msid: "EMBO-2024-012",
    receivedDate: "2024-12-21",
    title: "Dissecting the signaling pathways involved in neuroinflammation and neuronal damage",
    authors: ["Dr. Marco Costa", "Dr. Francesca Rizzo", "Dr. Giulia Lombardi"],
    doi: "10.15252/embj.012123456",
    accessionNumber: "EMBO-2024-012-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "Failed to deposit",
    workflowState: "deposited-to-biostudies",
    priority: "normal",
    hasErrors: true,
    hasWarnings: false,
    notes: "Neuroinflammation and neuronal damage research. Technical issues during BioStudies submission.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/biofilm-bacteria.jpg",
    researchArea: "neuroscience",
  },
  {
    msid: "EMBO-2024-013",
    receivedDate: "2024-12-31",
    title: "The role of the Hippo signaling pathway in organ size control and tumorigenesis",
    authors: ["Dr. Johan Andersen", "Dr. Line Petersen", "Dr. Kirsten Christensen"],
    doi: "10.15252/embj.013123456",
    accessionNumber: "EMBO-2024-013-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "New submission",
    workflowState: "ready-for-curation",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Hippo signaling pathway research in organ size control. Just received, awaiting assignment.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/plant-drought-stress.jpg",
    researchArea: "developmental-biology",
  },
  {
    msid: "EMBO-2024-014",
    receivedDate: "2024-12-20",
    title: "Investigating the impact of environmental toxins on epigenetic modifications",
    authors: ["Dr. Elena Sanchez", "Dr. Antonio Torres", "Dr. Isabel Ramirez"],
    doi: "10.15252/embj.014123456",
    accessionNumber: "EMBO-2024-014-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "In progress",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: false,
    notes: "Environmental toxins and epigenetic modifications research. Comprehensive review in progress.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/behavioral-memory-testing.jpg",
    researchArea: "toxicology",
  },
  {
    msid: "EMBO-2024-015",
    receivedDate: "2024-12-19",
    title: "The role of exosomes in intercellular communication and cancer metastasis",
    authors: ["Dr. Paolo Rossi", "Dr. Federica Martini", "Dr. Riccardo Bianchi"],
    doi: "10.15252/embj.015123456",
    accessionNumber: "EMBO-2024-015-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "Waiting for data",
    workflowState: "no-pipeline-results",
    priority: "normal",
    hasErrors: false,
    hasWarnings: false,
    notes: "Exosomes research in cancer metastasis. Awaiting bioinformatics pipeline completion.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/metabolomics-heatmap.jpg",
    researchArea: "cancer-biology",
  },
  {
    msid: "EMBO-2024-016",
    receivedDate: "2024-12-18",
    title: "Deciphering the mechanisms of antibiotic resistance in pathogenic bacteria",
    authors: ["Dr. Carla Silva", "Dr. Duarte Pereira", "Dr. Ana Oliveira"],
    doi: "10.15252/embj.016123456",
    accessionNumber: "EMBO-2024-016-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "Deposited",
    workflowState: "deposited-to-biostudies",
    priority: "urgent",
    hasErrors: false,
    hasWarnings: false,
    notes: "Antibiotic resistance research in bacteria. Priority manuscript successfully deposited.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/synthetic-biology-algae.jpg",
    researchArea: "microbiology",
  },
  {
    msid: "EMBO-2024-017",
    receivedDate: "2024-12-16",
    title: "The role of non-coding RNAs in regulating plant stress responses",
    authors: ["Dr. Heidi Jensen", "Dr. Mikkel Nielsen", "Dr. Kirsten Hansen"],
    doi: "10.15252/embj.017123456",
    accessionNumber: "EMBO-2024-017-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "In progress",
    workflowState: "ready-for-curation",
    priority: "normal",
    hasErrors: false,
    hasWarnings: true,
    notes: "Non-coding RNAs research in plant stress responses. Minor metadata corrections needed.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/biofilm-formation-microscopy.jpg",
    researchArea: "plant-biology",
  },
  {
    msid: "EMBO-2024-018",
    receivedDate: "2024-12-15",
    title: "Investigating the potential of gene therapy for treating inherited metabolic disorders",
    authors: ["Dr. Benoit Bernard", "Dr. Camille Leclerc", "Dr. Emilie Fournier"],
    doi: "10.15252/embj.018123456",
    accessionNumber: "EMBO-2024-018-ACC",
    assignedTo: "Dr. Sarah Wilson",
    status: "In progress",
    workflowState: "ready-for-curation",
    priority: "high",
    hasErrors: false,
    hasWarnings: false,
    notes: "Gene therapy research for inherited metabolic disorders. Awaiting regulatory approval documentation.",
    lastModified: "2024-01-20T14:30:00Z",
    assignee: "",
    figureImage: "/quantum-dots-cancer.jpg",
    researchArea: "gene-therapy",
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
    switch (tab) {
      case "ready-for-curation":
        return ["New submission", "In Progress", "On hold"]
      case "deposited-to-biostudies":
        return ["Deposited", "Failed to deposit"]
      case "no-pipeline-results":
        return ["Waiting for data"]
      default:
        return []
    }
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
          return { ...manuscript, assignee: "" }
        }
        return manuscript
      }),
    )
  }

  const filteredAndSortedManuscripts = useMemo(() => {
    const filtered = mockManuscripts.filter((manuscript) => {
      if (manuscript.workflowState !== activeTab) return false

      if (statusFilter !== "all" && manuscript.status !== statusFilter) return false

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
          manuscript.authors.join(" ").toLowerCase().includes(searchLower) ||
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
  }, [searchTerm, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection, activeTab, mockManuscripts])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusBadge = (status: string, hasErrors: boolean, hasWarnings: boolean, priority: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    let className = ""
    let tooltipContent = ""

    // Ready for Curation statuses
    if (status === "New submission") {
      variant = "outline"
      tooltipContent = "New submission - no work has been done yet"
    } else if (status === "In Progress") {
      variant = "secondary"
      className = "bg-blue-50 text-blue-700 border-blue-200"
      if (hasErrors) {
        tooltipContent = "In Progress - critical validation errors found, requires immediate attention"
      } else if (hasWarnings) {
        tooltipContent = "In Progress - minor issues detected, review recommended"
      } else {
        tooltipContent = "In Progress - work has been applied, progressing normally"
      }
    } else if (status === "On hold") {
      variant = "destructive"
      className = "bg-red-50 text-red-700 border-red-200"
      tooltipContent = "On hold - cannot be reviewed or processed, requires attention"
    }
    // Deposited to BioStudies statuses
    else if (status === "Deposited") {
      variant = "secondary"
      className = "bg-green-50 text-green-700 border-green-200"
      tooltipContent = "Successfully deposited to BioStudies"
    } else if (status === "Failed to deposit") {
      variant = "destructive"
      tooltipContent = "Failed to deposit to BioStudies - requires attention"
    }
    // No Pipeline Results statuses
    else if (status === "Waiting for data") {
      variant = "outline"
      className = "border-blue-200 text-blue-700"
      tooltipContent = "Waiting for backend pipeline processing"
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className={`flex items-center ${className}`}>
            {status}
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
          <ManuscriptDetail msid={selectedManuscript} onBack={() => setSelectedManuscript(null)} />
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Data4Rev Dashboard</h1>
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
                                  {getStatusBadge(
                                    manuscript.status,
                                    manuscript.hasErrors,
                                    manuscript.hasWarnings,
                                    manuscript.priority,
                                  )}
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
                                      <div className="truncate cursor-help" title={manuscript.authors.join(", ")}>
                                        {highlightSearchTerm(manuscript.authors.join(", "), searchTerm)}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-md">
                                      <p>{manuscript.authors.join(", ")}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              )}
                              {visibleColumns.doi && (
                                <TableCell className="text-sm">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help">
                                        {highlightSearchTerm(manuscript.doi, searchTerm)}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Digital Object Identifier</p>
                                      <p className="text-xs text-muted-foreground">Click to copy DOI</p>
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
