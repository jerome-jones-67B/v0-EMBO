"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Plus,
  Upload,
  X,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ExternalLink,
  AlertCircle,
  Info,
  Link,
  Database,
  LucideEye,
  Edit2,
  Check,
  RotateCcw,
  ZoomIn,
  ChevronUp,
  ChevronDown,
  Download,
} from "lucide-react"
import { mockLinkedData, mockSourceData } from "@/lib/mock"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot } from "lucide-react"

// Function to assign diverse images with much more variety
function getFigureImage(manuscriptTitle: string, figureId: string, figureTitle: string): string {
  // All available scientific images - use them all!
  const allImages = [
    '/protein-structures.png',
    '/protein-structure-control.png',
    '/molecular-interactions.png',
    '/hsp70-binding.png',
    '/co-chaperone-recruitment.png',
    '/atp-folding-cycle.png',
    '/microscopy-0-hours.png',
    '/microscopy-two-hours.png', 
    '/microscopy-6-hours.png',
    '/microscopy-24-hours.png',
    '/quantitative-analysis-graph.png',
    '/quantitative-aggregation-graph.png',
    '/protein-aggregation-time-course.png'
  ]
  
  // Create maximum diversity by combining multiple factors
  const seed = manuscriptTitle + figureId + figureTitle
  const hash1 = Math.abs(hashCode(seed))
  const hash2 = Math.abs(hashCode(seed.split('').reverse().join('')))
  const hash3 = Math.abs(hashCode(figureId + manuscriptTitle.length))
  const hash4 = Math.abs(hashCode(figureTitle + figureId.length))
  
  // Use multiple hash combinations with different multipliers for maximum distribution
  const imageIndex = (hash1 + hash2 * 7 + hash3 * 13 + hash4 * 23) % allImages.length
  
  return allImages[imageIndex]
}

// Simple hash function for consistent image assignment
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}

interface ManuscriptDetailProps {
  msid: string
  onBack: () => void
}

// Mock manuscripts matching the dashboard data
const mockManuscriptDetails = {
  "EMBO-2024-001": {
    id: "EMBO-2024-001",
    title: "Novel mechanisms of protein folding in cellular stress responses under oxidative conditions",
    authors: ["Smith, J.", "Johnson, A.", "Williams, R.", "Chen, L.", "Rodriguez, M."],
    received: "2024-12-14",
    doi: "10.1038/s41586-024-07123-4",
    lastModified: "2024-12-30T10:30:00Z",
    status: "on-hold",
    assignedTo: "Dr. Sarah Chen",
    currentStatus: "On hold",
    modifiedBy: "Dr. Sarah Chen",
    priority: "high",
  },
  "EMBO-2024-002": {
    id: "EMBO-2024-002", 
    title: "CRISPR-Cas9 mediated genome editing in pluripotent stem cells",
    authors: ["Brown, K.", "Davis, M.", "Wilson, P.", "Thompson, S."],
    received: "2024-12-25",
    doi: "10.1016/j.cell.2024.02.015",
    lastModified: "2024-12-28T09:15:00Z",
    status: "in-progress",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "In Progress", 
    modifiedBy: "Dr. Michael Rodriguez",
    priority: "normal",
  },
  "EMBO-2024-003": {
    id: "EMBO-2024-003",
    title: "Mitochondrial dynamics in neurodegeneration",
    authors: ["Garcia, L.", "Martinez, A.", "Lopez, C."],
    received: "2024-12-17",
    doi: "10.1038/s41593-024-01567-8", 
    lastModified: "2024-12-28T16:18:01Z",
    status: "new-submission",
    assignedTo: "Dr. Emily Watson",
    currentStatus: "New submission",
    modifiedBy: "Dr. Emily Watson",
    priority: "urgent",
  },
  "EMBO-2024-004": {
    id: "EMBO-2024-004",
    title: "Molecular mechanisms of DNA repair in cancer cells", 
    authors: ["Harris, K.", "Moore, L.", "Jackson, P.", "White, S."],
    received: "2024-12-17",
    doi: "10.1038/s41467-024-45678-9",
    lastModified: "2024-12-29T11:22:33Z", 
    status: "on-hold",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "On hold",
    modifiedBy: "Dr. Michael Rodriguez", 
    priority: "normal",
  },
  "EMBO-2024-005": {
    id: "EMBO-2024-005",
    title: "Epigenetic regulation of gene expression in developmental biology",
    authors: ["Martin, S.", "Johnson, A.", "Taylor, R.", "Anderson, K."],
    received: "2024-01-05",
    doi: "10.1038/s41588-024-01789-2",
    lastModified: "2024-01-12T14:45:00Z",
    status: "failed-to-deposit",
    assignedTo: "Dr. Emily Davis",
    currentStatus: "Failed to deposit",
    modifiedBy: "Dr. Emily Davis",
    priority: "urgent",
  },
  "EMBO-2024-006": {
    id: "EMBO-2024-006", 
    title: "Protein folding mechanisms in neurodegenerative disease progression",
    authors: ["Brown, T.", "White, J.", "Clark, M.", "Lewis, P."],
    received: "2024-01-03",
    doi: "10.1038/s41593-024-01234-5",
    lastModified: "2024-01-10T16:20:00Z",
    status: "waiting-for-data",
    assignedTo: "Dr. Sarah Wilson",
    currentStatus: "Waiting for data",
    modifiedBy: "Dr. Sarah Wilson",
    priority: "high",
  },
  "EMBO-2024-007": {
    id: "EMBO-2024-007",
    title: "Metabolic reprogramming in T cell activation and differentiation",
    authors: ["Wang, X.", "Liu, Y.", "Zhang, Z.", "Chen, W."],
    received: "2024-12-29",
    doi: "10.1038/s41590-024-01789-0",
    lastModified: "2024-12-30T08:45:00Z",
    status: "new-submission",
    assignedTo: "Dr. Sarah Chen",
    currentStatus: "New submission",
    modifiedBy: "Dr. Sarah Chen",
    priority: "normal",
  },
  "EMBO-2024-008": {
    id: "EMBO-2024-008",
    title: "Chromatin remodeling complexes in embryonic development",
    authors: ["Johnson, P.", "Williams, R.", "Brown, A.", "Davis, K."],
    received: "2024-12-23",
    doi: "10.1016/j.devcel.2024.04.008",
    lastModified: "2024-12-29T15:10:00Z",
    status: "in-progress",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "In Progress",
    modifiedBy: "Dr. Michael Rodriguez",
    priority: "high",
  },
  "EMBO-2024-009": {
    id: "EMBO-2024-009",
    title: "Autophagy regulation in aging and longevity",
    authors: ["Martinez, C.", "Garcia, L.", "Rodriguez, M."],
    received: "2024-12-30",
    doi: "10.1038/s43587-024-00567-8",
    lastModified: "2024-12-30T17:30:00Z",
    status: "deposited",
    assignedTo: "Dr. Emily Watson",
    currentStatus: "Deposited",
    modifiedBy: "Dr. Emily Watson",
    priority: "normal",
  },
  "EMBO-2024-010": {
    id: "EMBO-2024-010",
    title: "Immune checkpoint inhibitors in cancer immunotherapy",
    authors: ["Thompson, D.", "Anderson, S.", "Wilson, J.", "Taylor, M.", "Clark, R."],
    received: "2024-12-22",
    doi: "10.1126/scitranslmed.abc4567",
    lastModified: "2024-12-28T12:00:00Z",
    status: "waiting-for-data",
    assignedTo: "Dr. Sarah Chen",
    currentStatus: "Waiting for data",
    modifiedBy: "Dr. Sarah Chen",
    priority: "urgent",
  },
  "EMBO-2024-011": {
    id: "EMBO-2024-011",
    title: "Molecular mechanisms of DNA repair in cancer cells",
    authors: ["Harris, K.", "Moore, L.", "Jackson, P.", "White, S."],
    received: "2024-12-17",
    doi: "10.1038/s41467-024-45678-9",
    lastModified: "2024-12-29T10:45:00Z",
    status: "on-hold",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "On hold",
    modifiedBy: "Dr. Michael Rodriguez",
    priority: "high",
  },
  "EMBO-2024-012": {
    id: "EMBO-2024-012",
    title: "Stem cell niche dynamics in tissue regeneration",
    authors: ["Lee, S.", "Kim, H.", "Park, J.", "Choi, Y."],
    received: "2024-12-21",
    doi: "10.1016/j.stem.2024.05.012",
    lastModified: "2024-12-28T14:15:00Z",
    status: "failed-to-deposit",
    assignedTo: "Dr. Emily Watson",
    currentStatus: "Failed to deposit",
    modifiedBy: "Dr. Emily Watson",
    priority: "normal",
  },
  "EMBO-2024-013": {
    id: "EMBO-2024-013",
    title: "Circadian rhythm regulation of metabolic pathways",
    authors: ["Zhang, L.", "Wang, M.", "Liu, X.", "Chen, H."],
    received: "2024-12-31",
    doi: "10.1038/s41586-024-07890-1",
    lastModified: "2024-12-31T09:00:00Z",
    status: "new-submission",
    assignedTo: "Dr. Sarah Chen",
    currentStatus: "New submission",
    modifiedBy: "Dr. Sarah Chen",
    priority: "normal",
  },
  "EMBO-2024-014": {
    id: "EMBO-2024-014",
    title: "Neuroplasticity mechanisms in learning and memory",
    authors: ["Brown, M.", "Davis, R.", "Wilson, K.", "Johnson, L."],
    received: "2024-12-20",
    doi: "10.1016/j.neuron.2024.06.015",
    lastModified: "2024-12-30T11:20:00Z",
    status: "in-progress",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "In Progress",
    modifiedBy: "Dr. Michael Rodriguez",
    priority: "high",
  },
  "EMBO-2024-015": {
    id: "EMBO-2024-015",
    title: "Tumor microenvironment and cancer progression",
    authors: ["Garcia, P.", "Martinez, R.", "Lopez, A.", "Rodriguez, C."],
    received: "2024-12-19",
    doi: "10.1038/s41568-024-00678-2",
    lastModified: "2024-12-27T16:30:00Z",
    status: "waiting-for-data",
    assignedTo: "Dr. Emily Watson",
    currentStatus: "Waiting for data",
    modifiedBy: "Dr. Emily Watson",
    priority: "normal",
  },
  "EMBO-2024-016": {
    id: "EMBO-2024-016",
    title: "Epigenetic inheritance across generations",
    authors: ["Taylor, J.", "Anderson, M.", "White, P.", "Harris, L."],
    received: "2024-12-18",
    doi: "10.1126/science.def7890",
    lastModified: "2024-12-29T13:45:00Z",
    status: "deposited",
    assignedTo: "Dr. Sarah Chen",
    currentStatus: "Deposited",
    modifiedBy: "Dr. Sarah Chen",
    priority: "urgent",
  },
  "EMBO-2024-017": {
    id: "EMBO-2024-017",
    title: "Microbiome-host interactions in health and disease",
    authors: ["Miller, K.", "Moore, S.", "Clark, J.", "Thompson, A."],
    received: "2024-12-16",
    doi: "10.1038/s41579-024-00890-3",
    lastModified: "2024-12-28T10:15:00Z",
    status: "in-progress",
    assignedTo: "Dr. Michael Rodriguez",
    currentStatus: "In Progress",
    modifiedBy: "Dr. Michael Rodriguez",
    priority: "normal",
  },
  "EMBO-2024-018": {
    id: "EMBO-2024-018",
    title: "Gene therapy approaches for inherited diseases",
    authors: ["Lee, R.", "Kim, S.", "Park, H.", "Choi, K.", "Wang, L."],
    received: "2024-12-15",
    doi: "10.1016/j.ymthe.2024.07.020",
    lastModified: "2024-12-27T14:30:00Z",
    status: "in-progress",
    assignedTo: "Dr. Emily Watson",
    currentStatus: "In Progress",
    modifiedBy: "Dr. Emily Watson",
    priority: "high",
  }
}

const getManuscriptDetail = (msid: string) => {
  // Get specific manuscript details or fallback
  const manuscriptData = mockManuscriptDetails[msid as keyof typeof mockManuscriptDetails] || {
    id: msid,
    title: "Molecular mechanisms of heat shock protein 70 in cellular stress response and protein folding dynamics",
    authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez", "Dr. Lisa Wang"],
    received: "2024-01-15",
    doi: "10.15252/embj.2024123456",
    lastModified: "2024-01-20T14:30:00Z",
    status: "in-progress",
    assignedTo: "Dr. Sarah Wilson",
    currentStatus: "In progress",
    modifiedBy: "Dr. Sarah Chen",
    priority: "high",
  }
  
  // Generate content based on manuscript title
  const generateAbstract = (title: string) => {
    if (title.includes('protein folding')) {
      return "Protein folding is a critical cellular process that can be disrupted under stress conditions. This study investigates novel mechanisms by which cells maintain protein homeostasis during oxidative stress. Using advanced proteomics and structural biology approaches, we identified key regulatory pathways that coordinate protein folding responses."
    } else if (title.includes('CRISPR')) {
      return "CRISPR-Cas9 technology has revolutionized genome editing in mammalian cells. This study focuses on optimizing CRISPR-mediated editing in pluripotent stem cells, addressing challenges related to efficiency and specificity. We developed new protocols for guide RNA design and delivery."
    } else if (title.includes('Mitochondrial')) {
      return "Mitochondrial dysfunction plays a central role in neurodegenerative diseases. This research investigates the dynamic regulation of mitochondrial networks in neuronal cells under pathological conditions using live-cell imaging and proteomics."
    } else if (title.includes('DNA repair')) {
      return "DNA repair mechanisms are frequently dysregulated in cancer cells, contributing to genomic instability and therapeutic resistance. This study examines molecular pathways involved in DNA damage response in various cancer cell lines."
    }
    return "This manuscript presents novel research findings that advance our understanding of fundamental biological processes and their implications for human health."
  }

  const generateKeywords = (title: string) => {
    if (title.includes('protein folding')) {
      return ["protein folding", "oxidative stress", "molecular chaperones", "proteostasis", "cellular adaptation"]
    } else if (title.includes('CRISPR')) {
      return ["CRISPR-Cas9", "genome editing", "pluripotent stem cells", "guide RNA", "precision medicine"]
    } else if (title.includes('Mitochondrial')) {
      return ["mitochondria", "neurodegeneration", "mitochondrial dynamics", "neuronal cells", "therapeutic targets"]
    } else if (title.includes('DNA repair')) {
      return ["DNA repair", "cancer", "genomic instability", "therapeutic resistance", "molecular pathways"]
    }
    return ["cell biology", "molecular medicine", "research", "biomedical science"]
  }

  return {
    ...manuscriptData,
    abstract: generateAbstract(manuscriptData.title),
    keywords: generateKeywords(manuscriptData.title),
    notes: manuscriptData.id === msid ? 
      (msid === "EMBO-2024-001" ? "Waiting for additional experimental data from authors" :
       msid === "EMBO-2024-002" ? "Comprehensive review in progress" :
       msid === "EMBO-2024-003" ? "Missing required metadata files" :
       msid === "EMBO-2024-004" ? "Pending author response to reviewer comments" :
       "Standard review process") :
      "Requires additional validation for protein structure data. Missing figure legends for panels C-E. Author contacted for clarification on methodology section.",
  dataAvailability:
    "The datasets generated and analyzed during the current study are available in the Gene Expression Omnibus repository under accession number GSE123456. Protein structure data are deposited in the Protein Data Bank under accession code 7ABC. All other data supporting the conclusions of this article are included within the article and its additional files.",
  figures: [
    {
      id: "fig1",
      title: "Figure 1: Protein folding dynamics under normal conditions",
      legend:
        "Fig. 1 Protein folding dynamics under normal conditions. (A) Western blot analysis of HSP70 expression levels in control and stress conditions. Molecular weight markers are shown on the left. (B) Fluorescence microscopy of protein aggregates (red) and nuclei (blue) in cultured cells. Scale bar = 10 μm. (C) Quantitative analysis of folding rates measured by fluorescence recovery after photobleaching. Error bars represent SEM from n=3 independent experiments.",
      panels: [
        {
          id: "1A",
          description:
            "Western blot analysis of HSP70 expression levels in control and stress conditions. Molecular weight markers are shown on the left.",
          hasIssues: false,
        },
        {
          id: "1B",
          description:
            "Fluorescence microscopy of protein aggregates (red) and nuclei (blue) in cultured cells. Scale bar = 10 μm.",
          hasIssues: true,
        },
        {
          id: "1C",
          description:
            "Quantitative analysis of folding rates measured by fluorescence recovery after photobleaching. Error bars represent SEM from n=3 independent experiments.",
          hasIssues: false,
        },
      ],
      qcChecks: [
        {
          type: "info",
          message: "Statistical analysis appears appropriate",
          details: "Error bars represent SEM from n=3 independent experiments",
          aiGenerated: true,
          dismissed: false,
        },
      ],
    },
    {
      id: "fig2",
      title: "Figure 2: Oxidative stress response pathways",
      legend:
        "Fig. 2 UTP binding to uncoupling protein 1. (A) Structure of UCP1 with bound UTP (green) and three cardiolipin molecules (wheat). Core elements 1, 2, and 3 are coloured by domain in blue, yellow, and red, respectively, and the gate elements in grey. (B) UTP binding site. Residues are coloured by function: matrix network residues are shown in blue, arginine triplet residues are shown in black, and other residues involved in binding are shown in grey. Ionic interactions are shown with green broken lines, hydrogen bonds with black broken lines and the cation-π interaction with purple broken line.",
      panels: [
        {
          id: "2A",
          description:
            "Structure of UCP1 with bound UTP (green) and three cardiolipin molecules (wheat). Core elements 1, 2, and 3 are coloured by domain in blue, yellow, and red, respectively, and the gate elements in grey.",
          hasIssues: false,
        },
        {
          id: "2B",
          description:
            "UTP binding site. Residues are coloured by function: matrix network residues are shown in blue, arginine triplet residues are shown in black, and other residues involved in binding are shown in grey. Ionic interactions are shown with green broken lines, hydrogen bonds with black broken lines and the cation-π interaction with purple broken line.",
          hasIssues: false,
        },
      ],
      qcChecks: [
        {
          type: "warning",
          message: "Color scheme may not be colorblind-friendly",
          details: "Consider using colorblind-safe palette for heat map",
          aiGenerated: true,
          dismissed: false,
        },
      ],
    },
    {
      id: "fig3",
      title: "Figure 3: Molecular chaperone interactions",
      legend:
        "Fig. 3 Molecular chaperone interactions. (A) Co-immunoprecipitation results showing HSP70 binding partners. Input and immunoprecipitated samples are shown with molecular weight markers. (B) Protein-protein interaction network derived from mass spectrometry analysis. Node size represents interaction confidence. (C) Structural modeling of HSP70-cochaperone complexes based on crystal structures. (D) Binding affinity measurements using surface plasmon resonance. (E) Kinetic analysis of chaperone-substrate interactions measured by fluorescence anisotropy.",
      panels: [
        {
          id: "3A",
          description:
            "Co-immunoprecipitation results showing HSP70 binding partners. Input and immunoprecipitated samples are shown with molecular weight markers.",
          hasIssues: false,
        },
        {
          id: "3B",
          description:
            "Protein-protein interaction network derived from mass spectrometry analysis. Node size represents interaction confidence.",
          hasIssues: false,
        },
        {
          id: "3C",
          description: "Structural modeling of HSP70-cochaperone complexes based on crystal structures.",
          hasIssues: true,
        },
        { id: "3D", description: "Binding affinity measurements using surface plasmon resonance.", hasIssues: true },
        {
          id: "3E",
          description: "Kinetic analysis of chaperone-substrate interactions measured by fluorescence anisotropy.",
          hasIssues: true,
        },
      ],
      qcChecks: [
        {
          type: "error",
          message: "Missing figure legend for panels C-E",
          details: "Figure 3 panels C, D, and E lack proper legends describing the experimental conditions.",
          aiGenerated: false,
          dismissed: false,
        },
      ],
    },
  ],
  linkedData: [
    {
      type: "PDB",
      identifier: "7ABC",
      url: "https://www.rcsb.org/structure/7ABC",
      description: "Crystal structure of HSP70 complex",
    },
    {
      type: "UniProt",
      identifier: "P08107",
      url: "https://www.uniprot.org/uniprot/P08107",
      description: "Heat shock 70 kDa protein 1A",
    },
    {
      type: "GEO",
      identifier: "GSE123456",
      url: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE123456",
      description: "RNA-seq data under oxidative stress",
    },
  ],
  linkedInfo: [
    {
      type: "Protocol",
      url: "https://protocols.io/view/protein-purification-protocol-abc123",
      description: "Protein purification protocol",
    },
    {
      type: "Supplementary",
      url: "https://example.com/supplementary-data",
      description: "Supplementary materials and methods",
    },
  ],
  qcChecks: [
    {
      level: "manuscript",
      type: "error",
      category: "metadata",
      message: "Missing author ORCID for corresponding author",
      details: "The corresponding author Dr. John Smith is missing a valid ORCID identifier.",
      aiGenerated: false,
      dismissed: false,
      followUp: true,
    },
    {
      level: "manuscript",
      type: "warning",
      category: "formatting",
      message: "Inconsistent reference formatting",
      details: "References 15-18 use different formatting style than the rest of the manuscript.",
      aiGenerated: true,
      dismissed: false,
      followUp: false,
    },
  ],
  collaborationStatus: {
    isBeingEdited: false,
    editedBy: null,
    lastActivity: "2024-01-20T14:30:00Z",
  },
  legend: "This is a sample figure legend.",
  sourceData: [
    {
      filename: "supplementary_data.xlsx",
      url: "/files/supplementary_data.xlsx",
      description: "Supplementary data file",
      size: "1.2 MB",
      type: "xlsx",
    },
    {
      filename: "raw_data.csv",
      url: "/files/raw_data.csv",
      description: "Raw data file",
      size: "800 KB",
      type: "csv",
    },
  ],
  linkedData: [
    {
      type: "PDB",
      id: "7ABC",
      url: "https://www.rcsb.org/structure/7ABC",
      description: "Crystal structure of HSP70 complex",
    },
    {
      type: "UniProt",
      id: "P08107",
      url: "https://www.uniprot.org/uniprot/P08107",
      description: "Heat shock 70 kDa protein 1A",
    },
  ],
  }
}

const ManuscriptDetail = ({ msid, onBack }: ManuscriptDetailProps) => {
  const [selectedView, setSelectedView] = useState<"manuscript" | "list">("manuscript")
  const [linkedData, setLinkedData] = useState(mockLinkedData)
  const [sourceData, setSourceData] = useState(mockSourceData)
  const [editingLinkedData, setEditingLinkedData] = useState<string | null>(null)
  const [editingSourceData, setEditingSourceData] = useState<string | null>(null)
  const [showExpandedFigure, setShowExpandedFigure] = useState<string | null>(null)
  const [overlayVisibility, setOverlayVisibility] = useState<Record<string, boolean>>({})
  const [manuscript, setManuscript] = useState(getManuscriptDetail(msid))
  const [notes, setNotes] = useState(manuscript.notes)
  const [dataAvailability, setDataAvailability] = useState(manuscript.dataAvailability)
  const [isEditingLinkedData, setIsEditingLinkedData] = useState(false)
  const [isEditingSourceData, setIsEditingSourceData] = useState(false)
  const [editingLinkedDataIndex, setEditingLinkedDataIndex] = useState<number | null>(null)
  const [linkedDataForm, setLinkedDataForm] = useState({
    type: "",
    identifier: "",
    url: "",
    description: "",
    isCustom: false,
  })
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(manuscript.notes || "")
  const [isEditingDataAvailability, setIsEditingDataAvailability] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showFullText, setShowFullText] = useState(false)
  const [currentEditor, setCurrentEditor] = useState<{
    name: string
    email: string
    editingSince: Date
  } | null>(() => {
    // Simulate someone editing EMBO-2024-002 for demo purposes
    if (msid === "EMBO-2024-002") {
      return {
        name: "Dr. Sarah Chen",
        email: "s.chen@embo.org",
        editingSince: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      }
    }
    return null
  })

  const [showConflictDetails, setShowConflictDetails] = useState(false)

  const [editingConflicts, setEditingConflicts] = useState<{
    hasConflicts: boolean
    conflicts: Array<{
      type: "ai_check" | "source_data" | "notes" | "panel_data"
      description: string
      conflictedBy: string
      timestamp: Date
    }>
  }>(() => {
    // Simulate editing conflicts for EMBO-2024-002
    if (msid === "EMBO-2024-002") {
      return {
        hasConflicts: true,
        conflicts: [
          {
            type: "ai_check",
            description: "AI Check for Figure 1 Panel A approved",
            conflictedBy: "Dr. Michael Rodriguez",
            timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          },
          {
            type: "source_data",
            description: "Source data file updated for Figure 2",
            conflictedBy: "Dr. Emily Watson",
            timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
          },
          {
            type: "notes",
            description: "Manuscript notes modified",
            conflictedBy: "Dr. Sarah Chen",
            timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
          },
        ],
      }
    }
    return { hasConflicts: false, conflicts: [] }
  })

  const [editingSourceDataIndex, setEditingSourceDataIndex] = useState<number | null>(null)
  const [sourceDataForm, setSourceDataForm] = useState({
    file: null as File | null,
    selectedExistingFile: "",
  })

  const [editingPanel, setEditingPanel] = useState<{
    figureIndex: number
    panelIndex: number
    panel: any
  } | null>(null)
  const [isEditingPanel, setIsEditingPanel] = useState(false)
  const [panelForm, setPanelForm] = useState({
    description: "",
    linkType: "none", // 'none', 'sourceData', 'linkedData', 'newLinkedData'
    sourceDataId: "",
    linkedDataId: "",
    newLinkedData: {
      type: "",
      identifier: "",
      url: "",
      description: "",
      isCustom: false,
    },
  })

  const [editingFigure, setEditingFigure] = useState<{
    figureIndex: number
    figure: any
  } | null>(null)
  const [isEditingFigure, setIsEditingFigure] = useState(false)
  const [figureForm, setFigureForm] = useState({
    title: "",
    caption: "",
    linkType: "none", // 'none', 'sourceData', 'linkedData', 'newLinkedData'
    sourceDataId: "",
    linkedDataId: "",
    newLinkedData: {
      type: "",
      identifier: "",
      url: "",
      description: "",
      isCustom: false,
    },
  })

  const repositories = [
    { name: "PDB", label: "Protein Data Bank", urlPattern: "https://www.rcsb.org/structure/{id}" },
    { name: "UniProt", label: "UniProt Knowledgebase", urlPattern: "https://www.uniprot.org/uniprot/{id}" },
    {
      name: "GEO",
      label: "Gene Expression Omnibus",
      urlPattern: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={id}",
    },
    { name: "ArrayExpress", label: "ArrayExpress", urlPattern: "https://www.ebi.ac.uk/arrayexpress/experiments/{id}" },
    { name: "BioProject", label: "NCBI BioProject", urlPattern: "https://www.ncbi.nlm.nih.gov/bioproject/{id}" },
    { name: "SRA", label: "Sequence Read Archive", urlPattern: "https://www.ncbi.nlm.nih.gov/sra/{id}" },
    { name: "ChEMBL", label: "ChEMBL Database", urlPattern: "https://www.ebi.ac.uk/chembl/compound_report_card/{id}" },
    { name: "EMDB", label: "Electron Microscopy Data Bank", urlPattern: "https://www.ebi.ac.uk/emdb/entry/{id}" },
    { name: "Custom", label: "Custom Repository", urlPattern: "" },
  ]

  const generateUrl = (repositoryType: string, accession: string) => {
    const repo = repositories.find((r) => r.name === repositoryType)
    if (!repo || !repo.urlPattern) return ""
    return repo.urlPattern.replace("{id}", accession)
  }

  const generateRepositoryUrl = (repositoryType: string, accession: string) => {
    const repo = repositories.find((r) => r.name === repositoryType)
    if (!repo || !repo.urlPattern) return ""
    return repo.urlPattern.replace("{id}", accession)
  }

  const handleLinkedDataSubmit = () => {
    const newEntry = {
      type: linkedDataForm.type,
      identifier: linkedDataForm.identifier,
      url: linkedDataForm.isCustom ? linkedDataForm.url : generateUrl(linkedDataForm.type, linkedDataForm.identifier),
      description: linkedDataForm.description,
    }

    if (editingLinkedDataIndex !== null) {
      const updatedLinkedData = [...linkedData]
      updatedLinkedData[editingLinkedDataIndex] = newEntry
      setLinkedData(updatedLinkedData)
    } else {
      setLinkedData([...linkedData, newEntry])
    }

    setLinkedDataForm({ type: "", identifier: "", url: "", description: "", isCustom: false })
    setIsEditingLinkedData(false)
    setEditingLinkedDataIndex(null)
  }

  const handleEditLinkedData = (index: number) => {
    const entry = linkedData[index]
    const isCustom = !repositories.find((r) => r.name === entry.type && r.urlPattern)

    setLinkedDataForm({
      type: entry.type,
      identifier: entry.identifier,
      url: entry.url,
      description: entry.description,
      isCustom,
    })
    setEditingLinkedDataIndex(index)
    setIsEditingLinkedData(true)
  }

  const handleRemoveLinkedData = (index: number) => {
    const updatedLinkedData = linkedData.filter((_, i) => i !== index)
    setLinkedData(updatedLinkedData)
  }

  const handleEditSourceData = (index: number) => {
    const data = sourceData[index]
    setSourceDataForm({
      file: null,
      selectedExistingFile: data.filename,
    })
    setEditingSourceDataIndex(index)
    setIsEditingSourceData(true)
  }

  const handleRemoveSourceData = (index: number) => {
    setSourceData((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSourceDataSubmit = () => {
    const filename = sourceDataForm.file?.name || sourceDataForm.selectedExistingFile
    const url = sourceDataForm.file
      ? URL.createObjectURL(sourceDataForm.file)
      : `/files/${sourceDataForm.selectedExistingFile}`

    const newData = {
      name: filename || "",
      filename: filename || "",
      url: url,
    }

    if (editingSourceDataIndex !== null) {
      setSourceData((prev) => prev.map((item, index) => (index === editingSourceDataIndex ? newData : item)))
    } else {
      setSourceData((prev) => [...prev, newData])
    }

    setIsEditingSourceData(false)
    setEditingSourceDataIndex(null)
    setSourceDataForm({ file: null, selectedExistingFile: "" })
  }

  const handleEditPanel = (figureIndex: number, panelIndex: number) => {
    const panel = manuscript.figures[figureIndex].panels[panelIndex]
    setPanelForm({
      description: panel.description,
      linkType: "none",
      sourceDataId: "",
      linkedDataId: "",
      newLinkedData: {
        type: "",
        identifier: "",
        url: "",
        description: "",
        isCustom: false,
      },
    })
    setEditingPanel({ figureIndex, panelIndex, panel })
    setIsEditingPanel(true)
  }

  const handleEditFigure = (figureIndex: number) => {
    const figure = manuscript.figures[figureIndex]
    setFigureForm({
      title: figure.title,
      caption: figure.caption,
      linkType: "none",
      sourceDataId: "",
      linkedDataId: "",
      newLinkedData: {
        type: "",
        identifier: "",
        url: "",
        description: "",
        isCustom: false,
      },
    })
    setEditingFigure({ figureIndex, figure })
    setIsEditingFigure(true)
  }

  const handlePanelFormSubmit = () => {
    if (!editingPanel) return

    // Update panel description
    const updatedFigures = [...manuscript.figures]
    updatedFigures[editingPanel.figureIndex].panels[editingPanel.panelIndex].description = panelForm.description

    setManuscript((prev) => ({ ...prev, figures: updatedFigures }))

    // Handle linking logic here (would update panel's linked data reference)
    if (panelForm.linkType === "newLinkedData" && panelForm.newLinkedData.type) {
      // Add new linked data entry
      const newEntry = {
        type: panelForm.newLinkedData.type,
        identifier: panelForm.newLinkedData.identifier,
        url: panelForm.newLinkedData.isCustom
          ? panelForm.newLinkedData.url
          : generateRepositoryUrl(panelForm.newLinkedData.type, panelForm.newLinkedData.identifier),
        description: panelForm.newLinkedData.description,
      }
      setLinkedData((prev) => [...prev, newEntry])
    }

    setIsEditingPanel(false)
    setEditingPanel(null)
  }

  const handleFigureFormSubmit = () => {
    if (!editingFigure) return

    // Update figure title and caption
    const updatedFigures = [...manuscript.figures]
    updatedFigures[editingFigure.figureIndex].title = figureForm.title
    updatedFigures[editingFigure.figureIndex].caption = figureForm.caption

    setManuscript((prev) => ({ ...prev, figures: updatedFigures }))

    // Handle linking logic for figure-level data
    if (figureForm.linkType === "newLinkedData" && figureForm.newLinkedData.type) {
      // Add new linked data entry
      const newEntry = {
        type: figureForm.newLinkedData.type,
        identifier: figureForm.newLinkedData.identifier,
        url: figureForm.newLinkedData.isCustom
          ? figureForm.newLinkedData.url
          : generateRepositoryUrl(figureForm.newLinkedData.type, figureForm.newLinkedData.identifier),
        description: panelForm.newLinkedData.description,
      }
      setLinkedData((prev) => [...prev, newEntry])

      // Link the new data to the figure
      if (!updatedFigures[editingFigure.figureIndex].linkedData) {
        updatedFigures[editingFigure.figureIndex].linkedData = []
      }
      updatedFigures[editingFigure.figureIndex].linkedData.push(newEntry)
    } else if (figureForm.linkType === "sourceData" && figureForm.sourceDataId) {
      // Link existing source data to figure
      const sourceFile = sourceData.find((file) => file.filename === figureForm.sourceDataId)
      if (sourceFile) {
        if (!updatedFigures[editingFigure.figureIndex].linkedData) {
          updatedFigures[editingFigure.figureIndex].linkedData = []
        }
        updatedFigures[editingFigure.figureIndex].linkedData.push({
          type: "Source Data",
          identifier: sourceFile.filename,
          url: sourceFile.url,
          description: `Source data file: ${sourceFile.filename}`,
        })
      }
    } else if (figureForm.linkType === "linkedData" && figureForm.linkedDataId) {
      // Link existing linked data to figure
      const existingData = linkedData.find((data) => `${data.type}-${data.identifier}` === figureForm.linkedDataId)
      if (existingData) {
        if (!updatedFigures[editingFigure.figureIndex].linkedData) {
          updatedFigures[editingFigure.figureIndex].linkedData = []
        }
        updatedFigures[editingFigure.figureIndex].linkedData.push(existingData)
      }
    }

    setManuscript((prev) => ({ ...prev, figures: updatedFigures }))
    setIsEditingFigure(false)
    setEditingFigure(null)
  }

  const handleSaveNotes = () => {
    console.log("[v0] Saving notes for manuscript:", manuscript.id, "Notes:", notesValue)
    setIsEditingNotes(false)
    // Update the manuscript object and local state
    manuscript.notes = notesValue
    setNotes(notesValue) // Also update the notes state to trigger the useEffect
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        notes !== manuscript.notes ||
        dataAvailability !== manuscript.dataAvailability ||
        linkedData !== manuscript.linkedData
      ) {
        setManuscript((prev) => ({
          ...prev,
          notes,
          dataAvailability,
          linkedData,
          lastModified: new Date().toISOString(),
        }))
        setLastSaved(new Date())
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [notes, dataAvailability, linkedData, manuscript.notes, manuscript.dataAvailability])

  const getStatusBadge = (status: string, priority: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    let icon = null
    let className = ""

    switch (status) {
      case "needs-validation":
        variant = "destructive"
        icon = <AlertTriangle className="w-3 h-3 mr-1" />
        break
      case "validated":
        variant = "secondary"
        icon = <CheckCircle className="w-3 h-3 mr-1 text-emerald-500" />
        className = "bg-emerald-50 text-emerald-700 border-emerald-200"
        break
      case "in-progress":
        icon = <Clock className="w-3 h-3 mr-1 text-slate-500" />
        break
    }

    return (
      <div className="flex items-center gap-2">
        <Badge variant={variant} className={`flex items-center ${className}`}>
          {icon}
          {status.replace("-", " ")}
        </Badge>
        {priority === "urgent" && (
          <Badge variant="destructive" className="text-xs">
            URGENT
          </Badge>
        )}
        {priority === "high" && (
          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
            HIGH
          </Badge>
        )}
      </div>
    )
  }

  const getQCIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
    }
  }

  const renderCheckActions = (check: any, location: string, index: number) => {
    if (check.aiGenerated) {
      // AI checks can be approved or ignored
      return (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 bg-transparent">
            <Check className="w-3 h-3" />
            <span className="sr-only">Approve</span>
          </Button>
          <Button size="sm" variant="outline" className="text-gray-600 hover:text-gray-700 bg-transparent">
            <X className="w-3 h-3" />
            <span className="sr-only">Ignore</span>
          </Button>
        </div>
      )
    } else {
      // Validation issues require fixes
      return (
        <div className="flex gap-1">
          <Badge variant="destructive" className="text-xs">
            Fix Required
          </Badge>
        </div>
      )
    }
  }

  const getCheckId = (check: any, location: string, index: number) => {
    return `${location}-${index}-${check.message.substring(0, 20)}`
  }

  const [approvedChecks, setApprovedChecks] = useState(new Set())
  const [ignoredChecks, setIgnoredChecks] = useState(new Set())
  const [showIgnoredChecks, setShowIgnoredChecks] = useState(false)

  const getQCActions = (check: any, location = "general", index = 0) => {
    const checkId = getCheckId(check, location, index)

    if (check.aiGenerated) {
      if (approvedChecks.has(checkId)) {
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-green-700 bg-green-50 border-green-200">
              Approved
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 h-6 px-2"
              onClick={() => {
                const newApprovedChecks = new Set(approvedChecks)
                newApprovedChecks.delete(checkId)
                setApprovedChecks(newApprovedChecks)
              }}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="sr-only">Undo</span>
            </Button>
          </div>
        )
      }

      if (ignoredChecks.has(checkId) && showIgnoredChecks) {
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-300">
              Ignored
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 h-6 px-2"
              onClick={() => {
                const newIgnoredChecks = new Set(ignoredChecks)
                newIgnoredChecks.delete(checkId)
                setIgnoredChecks(newIgnoredChecks)
              }}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="sr-only">Undo</span>
            </Button>
          </div>
        )
      }

      // AI checks can be approved or ignored
      return (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 hover:text-green-700 bg-transparent"
            onClick={() => {
              const newApprovedChecks = new Set(approvedChecks)
              newApprovedChecks.add(checkId)
              setApprovedChecks(newApprovedChecks)
            }}
          >
            <Check className="w-3 h-3" />
            <span className="sr-only">Approve</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-gray-600 hover:text-gray-700 bg-transparent"
            onClick={() => {
              const newIgnoredChecks = new Set(ignoredChecks)
              newIgnoredChecks.add(checkId)
              setIgnoredChecks(newIgnoredChecks)
            }}
          >
            <X className="w-3 h-3" />
            <span className="sr-only">Ignore</span>
          </Button>
        </div>
      )
    } else {
      // Validation issues require fixes
      return (
        <div className="flex gap-1">
          <Badge variant="destructive" className="text-xs">
            Fix Required
          </Badge>
        </div>
      )
    }
  }

  const filterAIChecks = (checks: any[]) => {
    return checks.filter((check, index) => {
      if (!check.aiGenerated) return true
      const checkId = getCheckId(check, "general", index)
      return showIgnoredChecks || !ignoredChecks.has(checkId)
    })
  }

  const filterFigureAIChecks = (checks: any[], figureId: string) => {
    return checks.filter((check, index) => {
      if (!check.aiGenerated) return true
      const checkId = getCheckId(check, `figure-${figureId}`, index)
      return showIgnoredChecks || !ignoredChecks.has(checkId)
    })
  }

  const allQCChecks = [
    ...manuscript.qcChecks,
    ...manuscript.figures.flatMap((fig) =>
      fig.qcChecks.map((check) => ({ ...check, figureId: fig.id, figureTitle: fig.title })),
    ),
  ]

  const validationIssues = allQCChecks.filter((check) => !check.aiGenerated)
  const aiChecks = allQCChecks.filter((check) => check.aiGenerated)
  const errorCount = validationIssues.filter((check) => check.type === "error").length
  const warningCount = validationIssues.filter((check) => check.type === "warning").length

  const toggleOverlays = (figureId: string) => {
    setOverlayVisibility((prev) => ({
      ...prev,
      [figureId]: !prev[figureId],
    }))
  }

  const moveFigure = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= manuscript.figures.length) return

    const newFigures = [...manuscript.figures]
    const element = newFigures[fromIndex]
    newFigures.splice(fromIndex, 1)
    newFigures.splice(toIndex, 0, element)

    setManuscript((prev) => ({ ...prev, figures: newFigures }))
  }

  const movePanel = (figureIndex: number, panelIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= manuscript.figures[figureIndex].panels.length) return

    const newPanels = [...manuscript.figures[figureIndex].panels]
    const element = newPanels[panelIndex]
    newPanels.splice(panelIndex, 1)
    newPanels.splice(toIndex, 0, element)

    const newFigures = [...manuscript.figures]
    newFigures[figureIndex].panels = newPanels

    setManuscript((prev) => ({ ...prev, figures: newFigures }))
  }

  const [selectedSourceFiles, setSelectedSourceFiles] = useState<Set<string>>(new Set())
  const [sourceFileLinks, setSourceFileLinks] = useState<Record<string, string[]>>({})

  const allSubmittedFiles = [
    {
      id: "manuscript",
      name: "Main Manuscript",
      filename: "manuscript_v3.docx",
      type: "Manuscript",
      size: "2.4 MB",
      linkedTo: ["Manuscript"],
    },
    {
      id: "fig1",
      name: "Figure 1 - Protein Folding",
      filename: "figure_1_protein_folding.tiff",
      type: "Figure",
      size: "15.2 MB",
      linkedTo: ["Figure 1"],
    },
    {
      id: "fig1a",
      name: "Figure 1A Panel",
      filename: "fig1a_western_blot.tiff",
      type: "Panel",
      size: "8.1 MB",
      linkedTo: ["Figure 1A"],
    },
    {
      id: "fig1b",
      name: "Figure 1B Panel",
      filename: "fig1b_microscopy.tiff",
      type: "Panel",
      size: "12.3 MB",
      linkedTo: ["Figure 1B"],
    },
    {
      id: "fig1c",
      name: "Figure 1C Panel",
      filename: "fig1c_quantitative.tiff",
      type: "Panel",
      size: "6.7 MB",
      linkedTo: ["Figure 1C"],
    },
    {
      id: "fig2",
      name: "Figure 2 - UTP Binding",
      filename: "figure_2_utp_binding.tiff",
      type: "Figure",
      size: "18.5 MB",
      linkedTo: ["Figure 2"],
    },
    {
      id: "fig2a",
      name: "Figure 2A Panel",
      filename: "fig2a_structure.tiff",
      type: "Panel",
      size: "9.8 MB",
      linkedTo: ["Figure 2A"],
    },
    {
      id: "fig2b",
      name: "Figure 2B Panel",
      filename: "fig2b_binding_site.tiff",
      type: "Panel",
      size: "7.2 MB",
      linkedTo: ["Figure 2B"],
    },
    {
      id: "data1",
      name: "Western Blot Raw Data",
      filename: "western_blot_raw_data.xlsx",
      type: "Data",
      size: "1.8 MB",
      linkedTo: ["Figure 1A", "Figure 1"],
    },
    {
      id: "data2",
      name: "Microscopy Image Stack",
      filename: "microscopy_stack.zip",
      type: "Data",
      size: "245 MB",
      linkedTo: ["Figure 1B"],
    },
    {
      id: "data3",
      name: "Quantitative Analysis",
      filename: "quantitative_analysis.csv",
      type: "Data",
      size: "0.5 MB",
      linkedTo: ["Figure 1C"],
    },
    {
      id: "data4",
      name: "Protein Structure Data",
      filename: "protein_structure.pdb",
      type: "Data",
      size: "2.1 MB",
      linkedTo: ["Figure 2A"],
    },
    {
      id: "supp1",
      name: "Supplementary Data 1",
      filename: "supplementary_data_1.xlsx",
      type: "Supplementary",
      size: "3.2 MB",
      linkedTo: ["Manuscript"],
    },
    {
      id: "supp2",
      name: "Supplementary Methods",
      filename: "supplementary_methods.pdf",
      type: "Supplementary",
      size: "1.1 MB",
      linkedTo: ["Manuscript"],
    },
    {
      id: "appendix",
      name: "Statistical Analysis Appendix",
      filename: "statistical_appendix.pdf",
      type: "Appendix",
      size: "0.8 MB",
      linkedTo: ["Manuscript"],
    },
  ]

  const handleSourceFileSelection = (fileId: string) => {
    setSelectedSourceFiles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const handleSourceFileLinking = (fileId: string, linkTargets: string[]) => {
    setSourceFileLinks((prev) => ({
      ...prev,
      [fileId]: linkTargets,
    }))
  }

  const handleDeleteSelectedFiles = () => {
    // In a real app, this would delete the selected files
    console.log("[v0] Deleting selected files:", Array.from(selectedSourceFiles))
    setSelectedSourceFiles(new Set())
  }

  const getLinkingOptions = () => {
    const options = ["Manuscript"]
    manuscript.figures.forEach((fig) => {
      options.push(`Figure ${fig.id}`)
      fig.panels.forEach((panel) => {
        options.push(`Figure ${panel.id}`)
      })
    })
    return options
  }

  const [sourceDataFiles, setSourceDataFiles] = useState([
    { id: 1, name: "supplementary_data.xlsx", type: "xlsx", size: "2.3 MB" },
    { id: 2, name: "raw_data.csv", type: "csv", size: "1.8 MB" },
    { id: 3, name: "analysis_scripts.zip", type: "zip", size: "5.2 MB" },
  ])
  const [editFileDialog, setEditFileDialog] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null)
  const [availableFiles] = useState([
    { id: "manuscript", name: "manuscript.pdf", type: "pdf" },
    { id: "fig1", name: "figure1.tiff", type: "tiff" },
    { id: "fig1a", name: "figure1_panel_a.png", type: "png" },
    { id: "fig1b", name: "figure1_panel_b.png", type: "png" },
    { id: "fig2", name: "figure2.eps", type: "eps" },
    { id: "data1", name: "experimental_data.xlsx", type: "xlsx" },
    { id: "supp1", name: "supplementary_table1.xlsx", type: "xlsx" },
    { id: "appendix", name: "appendix_methods.docx", type: "docx" },
  ])

  const handleDownloadFile = (fileName: string) => {
    // Create a mock download - in real app this would fetch the actual file
    const link = document.createElement("a")
    link.href = `/api/files/download/${fileName}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log(`[v0] Downloading file: ${fileName}`)
  }

  const handleEditFile = (fileId: number) => {
    setSelectedFileId(fileId)
    setEditFileDialog(true)
  }

  const handleDeleteFile = (fileId: number) => {
    setSourceDataFiles((prev) => prev.filter((file) => file.id !== fileId))
    console.log(`[v0] Deleted file with ID: ${fileId}`)
  }

  const handleReplaceFile = (newFileName: string) => {
    if (selectedFileId) {
      setSourceDataFiles((prev) =>
        prev.map((file) => (file.id === selectedFileId ? { ...file, name: newFileName } : file)),
      )
    }
    setEditFileDialog(false)
    setSelectedFileId(null)
  }

  const handleUploadNewFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newFile = {
        id: Date.now(),
        name: file.name,
        type: file.name.split(".").pop() || "unknown",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      }
      setSourceDataFiles((prev) => [...prev, newFile])
      setEditFileDialog(false)
      setSelectedFileId(null)
    }
  }

  const ManuscriptReviewView = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="w-6 h-6" />
            Manuscript Data
          </CardTitle>
          <CardDescription>Data and information relating to the entire manuscript</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Link className="w-4 h-4" />
                Linked Data & Information
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLinkedDataForm({ type: "", identifier: "", url: "", description: "", isCustom: false })
                  setEditingLinkedDataIndex(null)
                  setIsEditingLinkedData(true)
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Data
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {data.type}: {data.identifier}
                    </p>
                    <p className="text-xs text-muted-foreground">{data.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={data.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditLinkedData(index)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLinkedData(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {isEditingLinkedData && (
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {editingLinkedDataIndex !== null ? "Edit" : "Add"} Linked Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Repository Type</Label>
                    <select
                      value={linkedDataForm.type}
                      onChange={(e) => {
                        const isCustom = e.target.value === "Custom"
                        setLinkedDataForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                          isCustom,
                          url: isCustom ? prev.url : "",
                        }))
                      }}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value="">Select repository...</option>
                      {repositories.map((repo) => (
                        <option key={repo.name} value={repo.name}>
                          {repo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Accession Number</Label>
                    <div>
                      <input
                        type="text"
                        value={linkedDataForm.identifier}
                        onChange={(e) => setLinkedDataForm((prev) => ({ ...prev, identifier: e.target.value }))}
                        placeholder="Enter accession number..."
                        className="w-full p-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {linkedDataForm.isCustom && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">URL</Label>
                      <div>
                        <input
                          type="url"
                          value={linkedDataForm.url}
                          onChange={(e) => setLinkedDataForm((prev) => ({ ...prev, url: e.target.value }))}
                          placeholder="Enter full URL..."
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <div>
                      <input
                        type="text"
                        value={linkedDataForm.description}
                        onChange={(e) => setLinkedDataForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the data..."
                        className="w-full p-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {!linkedDataForm.isCustom && linkedDataForm.type && linkedDataForm.identifier && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Generated URL Preview</Label>
                      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border font-mono">
                        {generateUrl(linkedDataForm.type, linkedDataForm.identifier)}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingLinkedData(false)
                        setEditingLinkedDataIndex(null)
                        setLinkedDataForm({ type: "", identifier: "", url: "", description: "", isCustom: false })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleLinkedDataSubmit}
                      disabled={
                        !linkedDataForm.type ||
                        !linkedDataForm.identifier ||
                        !linkedDataForm.description ||
                        (linkedDataForm.isCustom && !linkedDataForm.url)
                      }
                    >
                      {editingLinkedDataIndex !== null ? "Update" : "Add"} Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Source Data
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add File
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sourceDataFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">{file.size}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadFile(file.name)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditFile(file.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Database className="w-4 h-4" />
                Data Availability Statement
              </h3>
            </div>

            <p className="text-sm leading-relaxed">{dataAvailability}</p>
          </div>
        </CardContent>
      </Card>

      {/* General Manuscript Issues */}
      {manuscript.qcChecks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                General Manuscript Issues
              </CardTitle>
              {ignoredChecks.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIgnoredChecks(!showIgnoredChecks)}
                  className="text-gray-600"
                >
                  <LucideEye className="w-4 h-4 mr-2" />
                  {showIgnoredChecks ? "Hide Ignored" : `View Ignored (${ignoredChecks.size})`}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Checks Section */}
            {manuscript.qcChecks.filter((check) => check.aiGenerated).length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Checks
                </Label>
                {manuscript.qcChecks
                  .filter((check) => check.aiGenerated)
                  .map((check, checkIndex) => {
                    const checkId = getCheckId(check, "general", checkIndex)
                    const isIgnored = ignoredChecks.has(checkId)

                    if (isIgnored && !showIgnoredChecks) {
                      return null
                    }

                    return (
                      <div
                        key={checkIndex}
                        className={`flex items-start gap-3 p-3 rounded-lg bg-muted/50 ${isIgnored ? "opacity-60 bg-gray-50" : ""}`}
                      >
                        {getQCIcon(check.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{check.message}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                        </div>
                        {getQCActions(check, "general", checkIndex)}
                      </div>
                    )
                  })}
              </div>
            )}

            {/* QC Checks Section */}
            {manuscript.qcChecks.filter((check) => !check.aiGenerated).length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  QC Checks
                </Label>
                {manuscript.qcChecks
                  .filter((check) => !check.aiGenerated)
                  .map((check, checkIndex) => (
                    <div key={checkIndex} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      {getQCIcon(check.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{check.message}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                      </div>
                      {getQCActions(check, "general", checkIndex)}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sequential Figure Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Sequential Figure Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {manuscript.figures.map((figure, figureIndex) => (
            <div key={figure.id} className="space-y-4 border-b pb-6 last:border-b-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{figure.title}</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setOverlayVisibility((prev) => ({
                          ...prev,
                          [figure.id]: !prev[figure.id],
                        }))
                      }
                    >
                      {overlayVisibility[figure.id] ? "Hide Panel Mapping" : "Show Panel Mapping"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowExpandedFigure(showExpandedFigure === figure.id ? null : figure.id)}
                    >
                      <ZoomIn className="w-4 h-4 mr-1" />
                      {showExpandedFigure === figure.id ? "Collapse" : "Expand"}
                    </Button>
                  </div>
                </div>

                {/* Figure Image with Panel Overlays */}
                <div className="relative">
                  <img
                    src={getFigureImage(manuscript?.title || '', figure.id, figure.title)}
                    alt={figure.title}
                    className={`w-full object-contain border rounded-lg ${
                      showExpandedFigure === figure.id ? "max-h-96" : "max-h-64"
                    }`}
                  />

                  {/* Panel Mapping Overlays */}
                  {overlayVisibility[figure.id] &&
                    figure.panels.map((panel, panelIndex) => (
                      <div
                        key={panel.id}
                        className={`absolute border-2 transition-all ${
                          panel.hasIssues ? "border-red-500 bg-red-500/20" : "border-emerald-500 bg-emerald-500/10"
                        }`}
                        style={{
                          left: `${10 + (panelIndex % 2) * 45}%`,
                          top: `${10 + Math.floor(panelIndex / 2) * 40}%`,
                          width: "40%",
                          height: "35%",
                        }}
                      >
                        <div className="absolute -top-6 left-0 bg-white border rounded px-2 py-1 text-xs font-bold shadow-sm">
                          {panel.id}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Whole Figure Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Whole Figure Details</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Edit figure data"
                      onClick={() => handleEditFigure(figureIndex)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Move figure up"
                      onClick={() => moveFigure(figureIndex, figureIndex - 1)}
                      disabled={figureIndex === 0}
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Move figure down"
                      onClick={() => moveFigure(figureIndex, figureIndex + 1)}
                      disabled={figureIndex === manuscript.figures.length - 1}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-900 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed shadow-sm">
                    {figure.legend || "No legend available for this figure."}
                  </div>
                </div>

                {figure.linkedData && figure.linkedData.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Linked Data</Label>
                    <div className="space-y-1">
                      {figure.linkedData.map((data, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {data.type}: {data.identifier}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Details & Order */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Panel Details & Order</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {figure.panels.map((panel, panelIndex) => (
                    <div
                      key={panel.id}
                      className="flex items-center justify-between gap-3 p-3 border rounded-lg bg-white"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Badge variant="secondary" className="text-xs font-mono">
                          {panel.id}
                        </Badge>

                        <div className="space-y-2 flex-1">
                          <div className="flex items-center">
                            <span className="font-medium">{panel.id}</span>
                          </div>

                          {panel.legend && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">{panel.legend}</div>
                          )}

                          <p className="text-sm text-gray-600">{panel.description}</p>
                        </div>

                        {panel.hasIssues && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs">Needs attention</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Move panel up"
                          onClick={() => movePanel(figureIndex, panelIndex, panelIndex - 1)}
                          disabled={panelIndex === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Move panel down"
                          onClick={() => movePanel(figureIndex, panelIndex, panelIndex + 1)}
                          disabled={panelIndex === figure.panels.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Edit panel details"
                          onClick={() => handleEditPanel(figureIndex, panelIndex)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Remove panel"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Enhanced Add Panel Button with Detection Options */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Panel Manually
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      Auto-detect Missing
                    </Button>
                  </div>
                </div>
              </div>

              {/* Figure QC Checks */}
              {figure.qcChecks && figure.qcChecks.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Figure Issues</Label>
                  {filterFigureAIChecks(figure.qcChecks, figure.id).map((check, checkIndex) => (
                    <div key={checkIndex} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      {getQCIcon(check.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{check.message}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                      </div>
                      {getQCActions(check, `figure-${figure.id}`, checkIndex)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const ListReviewView = () => {
    const allQCChecks = [
      ...manuscript.qcChecks.map((check) => ({ ...check, location: "General Manuscript" })),
      ...manuscript.figures.flatMap((fig) =>
        fig.qcChecks.map((check) => ({ ...check, location: `Figure ${fig.id}`, figureTitle: fig.title })),
      ),
    ]

    const validationIssues = allQCChecks.filter((check) => !check.aiGenerated)
    const aiChecks = allQCChecks.filter((check) => check.aiGenerated)

    return (
      <div className="space-y-6">
        {/* QC Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              QC Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {validationIssues.filter((c) => c.type === "error").length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {validationIssues.filter((c) => c.type === "warning").length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{aiChecks.length}</div>
                <div className="text-sm text-muted-foreground">AI Checks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {manuscript.figures.reduce((acc, fig) => acc + fig.panels.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Panels</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QC Checks */}
        {validationIssues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                QC Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {validationIssues.map((check, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getQCIcon(check.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{check.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {check.location}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{check.details}</p>
                    </div>
                    {getQCActions(check, check.location, index)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Checks */}
        {aiChecks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                AI Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {aiChecks.map((check, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getQCIcon(check.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{check.message}</span>
                        <Badge variant="outline" className="text-xs">
                          {check.location}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{check.details}</p>
                    </div>
                    {getQCActions(check, check.location, index)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Source Data Files
              </div>
              <div className="flex items-center gap-2">
                {selectedSourceFiles.size > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteSelectedFiles}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Selected ({selectedSourceFiles.size})
                  </Button>
                )}
                <Badge variant="outline">{allSubmittedFiles.length} files</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allSubmittedFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSourceFiles.has(file.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedSourceFiles)
                        if (e.target.checked) {
                          newSelected.add(file.id)
                        } else {
                          newSelected.delete(file.id)
                        }
                        setSelectedSourceFiles(newSelected)
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{file.filename}</span>
                          <Badge variant="outline" className="text-xs">
                            {file.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{file.size}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-2">{file.name}</p>
                        <div className="text-xs text-muted-foreground">
                          Uploaded: 2024-01-15 | Last modified: 2024-01-20
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Currently linked to:</span>
                          {file.linkedTo.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {file.linkedTo.map((link, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {link}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not linked</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Link to:</span>
                          <Select
                            value=""
                            onValueChange={(value) => {
                              if (value === "none") {
                                console.log(`[v0] Unlinking ${file.filename} from all targets`)
                              } else {
                                console.log(`[v0] Linking ${file.filename} to ${value}`)
                              }
                            }}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select target..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None (Unlink all)</SelectItem>
                              <SelectItem value="manuscript">Manuscript</SelectItem>
                              {manuscript.figures.map((figure) => (
                                <React.Fragment key={figure.id}>
                                  <SelectItem value={`figure-${figure.id}`}>{figure.title}</SelectItem>
                                  {figure.panels.map((panel) => (
                                    <SelectItem key={panel.id} value={`panel-${panel.id}`}>
                                      └ Panel {panel.id}
                                    </SelectItem>
                                  ))}
                                </React.Fragment>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {file.linkedTo.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-sm font-medium">Remove specific links:</span>
                            <div className="flex flex-wrap gap-1">
                              {file.linkedTo.map((link, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {link}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 hover:bg-red-100"
                                    onClick={() => {
                                      console.log(`[v0] Removing link ${link} from ${file.filename}`)
                                    }}
                                  >
                                    <X className="w-3 h-3 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Figures & Panels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {manuscript.figures.map((figure, figIndex) => (
                <div key={figure.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{figure.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          figure.qcChecks && figure.qcChecks.some((c) => c.type === "error")
                            ? "destructive"
                            : figure.qcChecks && figure.qcChecks.some((c) => c.type === "warning")
                              ? "secondary"
                              : "default"
                        }
                      >
                        {figure.panels.length} panels
                      </Badge>
                    </div>
                  </div>

                  {/* Panels Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Panel</th>
                          <th className="text-left p-2">Description</th>
                          <th className="text-left p-2">Linked Data</th>
                          <th className="text-left p-2">Issues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {figure.panels.map((panel, panelIndex) => (
                          <tr key={panel.id} className="border-b">
                            <td className="p-2">
                              <Badge variant="outline">{panel.id}</Badge>
                            </td>
                            <td className="p-2 max-w-md">
                              <div className="truncate" title={panel.description}>
                                {panel.description}
                              </div>
                            </td>
                            <td className="p-2">
                              {panel.linkedData && panel.linkedData.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {panel.linkedData.map((data, dataIndex) => (
                                    <Badge key={dataIndex} variant="secondary" className="text-xs">
                                      {data.type}: {data.identifier}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">None</span>
                              )}
                            </td>
                            <td className="p-2">
                              {panel.hasIssues ? (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Issues
                                </Badge>
                              ) : (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  OK
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked Data Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {linkedData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium">{data.type}</div>
                      <div className="text-sm text-muted-foreground">{data.description}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{data.identifier}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>

        <div className="flex items-center gap-4">
          {currentEditor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {currentEditor.name} is currently editing
              {editingConflicts.hasConflicts && (
                <Button variant="link" size="sm" onClick={() => setShowConflictDetails(true)}>
                  Resolve Conflicts
                </Button>
              )}
            </div>
          )}

          {lastSaved && (
            <div className="text-sm text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">{manuscript.title}</CardTitle>
            {getStatusBadge(manuscript.status, manuscript.priority)}
          </div>
          <CardDescription>
            {manuscript.abstract.substring(0, 150)}
            {!showFullText && manuscript.abstract.length > 150 && (
              <Button variant="link" size="sm" onClick={() => setShowFullText(true)}>
                Read More
              </Button>
            )}
            {showFullText && manuscript.abstract.length > 150 && (
              <>
                {manuscript.abstract.substring(150)}
                <Button variant="link" size="sm" onClick={() => setShowFullText(false)}>
                  Read Less
                </Button>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>DOI</Label>
              <p>
                <a
                  href={`https://doi.org/${manuscript.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {manuscript.doi}
                </a>
              </p>
            </div>
            <div>
              <Label>Received Date</Label>
              <p>{manuscript.received}</p>
            </div>
            <div>
              <Label>Assigned To</Label>
              <p>{manuscript.assignedTo}</p>
            </div>
            <div>
              <Label>Modified By</Label>
              <p>{manuscript.modifiedBy}</p>
            </div>
          </div>

          <Tabs defaultValue={selectedView} className="w-full">
            <TabsList>
              <TabsTrigger value="manuscript" onClick={() => setSelectedView("manuscript")}>
                Manuscript Review
              </TabsTrigger>
              <TabsTrigger value="list" onClick={() => setSelectedView("list")}>
                List Review
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manuscript">
              <ManuscriptReviewView />
            </TabsContent>
            <TabsContent value="list">
              <ListReviewView />
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Notes</Label>
              {!isEditingNotes ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditingNotes(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Notes
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingNotes(false)}>
                    Cancel
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSaveNotes}>
                    Save Notes
                  </Button>
                </div>
              )}
            </div>
            {!isEditingNotes ? (
              <div className="rounded-md border p-4 bg-gray-50 shadow-sm">{notes || "No notes available."}</div>
            ) : (
              <Textarea
                placeholder="Add any relevant notes here..."
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit File Dialog */}
      <Dialog open={editFileDialog} onOpenChange={setEditFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Source Data File</DialogTitle>
            <DialogDescription>Select an action to perform on the selected file.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Replace with existing file
              </Label>
              <Select onValueChange={handleReplaceFile} defaultValue="">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a file" />
                </SelectTrigger>
                <SelectContent>
                  {availableFiles.map((file) => (
                    <SelectItem key={file.id} value={file.name}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Upload new file
              </Label>
              <Input id="username" value="" className="col-span-3" type="file" onChange={handleUploadNewFile} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Panel Dialog */}
      <Dialog open={isEditingPanel} onOpenChange={setIsEditingPanel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Panel Details</DialogTitle>
            <DialogDescription>Update the panel description and linked data.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                className="col-span-3"
                value={panelForm.description}
                onChange={(e) => setPanelForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="linkType" className="text-right">
                Link Data
              </Label>
              <Select
                onValueChange={(value) => setPanelForm((prev) => ({ ...prev, linkType: value }))}
                defaultValue={panelForm.linkType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a link type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sourceData">Source Data</SelectItem>
                  <SelectItem value="linkedData">Linked Data</SelectItem>
                  <SelectItem value="newLinkedData">New Linked Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {panelForm.linkType === "sourceData" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sourceDataId" className="text-right">
                  Source Data File
                </Label>
                <Select
                  onValueChange={(value) => setPanelForm((prev) => ({ ...prev, sourceDataId: value }))}
                  defaultValue={panelForm.sourceDataId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a file" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceData.map((file) => (
                      <SelectItem key={file.filename} value={file.filename}>
                        {file.filename}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {panelForm.linkType === "linkedData" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="linkedDataId" className="text-right">
                  Linked Data Entry
                </Label>
                <Select
                  onValueChange={(value) => setPanelForm((prev) => ({ ...prev, linkedDataId: value }))}
                  defaultValue={panelForm.linkedDataId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a data entry" />
                  </SelectTrigger>
                  <SelectContent>
                    {linkedData.map((data) => (
                      <SelectItem key={`${data.type}-${data.identifier}`} value={`${data.type}-${data.identifier}`}>
                        {data.type}: {data.identifier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {panelForm.linkType === "newLinkedData" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newLinkedDataType" className="text-right">
                    Repository Type
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setPanelForm((prev) => ({
                        ...prev,
                        newLinkedData: { ...prev.newLinkedData, type: value },
                      }))
                    }
                    defaultValue={panelForm.newLinkedData.type}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a repository" />
                    </SelectTrigger>
                    <SelectContent>
                      {repositories.map((repo) => (
                        <SelectItem key={repo.name} value={repo.name}>
                          {repo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newLinkedDataIdentifier" className="text-right">
                    Accession Number
                  </Label>
                  <Input
                    id="newLinkedDataIdentifier"
                    className="col-span-3"
                    value={panelForm.newLinkedData.identifier}
                    onChange={(e) =>
                      setPanelForm((prev) => ({
                        ...prev,
                        newLinkedData: { ...prev.newLinkedData, identifier: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newLinkedDataDescription" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="newLinkedDataDescription"
                    className="col-span-3"
                    value={panelForm.newLinkedData.description}
                    onChange={(e) =>
                      setPanelForm((prev) => ({
                        ...prev,
                        newLinkedData: { ...prev.newLinkedData, description: e.target.value },
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditingPanel(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handlePanelFormSubmit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Figure Dialog */}
      <Dialog open={isEditingFigure} onOpenChange={setIsEditingFigure}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Figure Details</DialogTitle>
            <DialogDescription>Update the figure title, caption, and linked data.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                className="col-span-3"
                value={figureForm.title}
                onChange={(e) => setFigureForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="caption" className="text-right">
                Caption
              </Label>
              <Textarea
                id="caption"
                className="col-span-3"
                value={figureForm.caption}
                onChange={(e) => setFigureForm((prev) => ({ ...prev, caption: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="linkType" className="text-right">
                Link Data
              </Label>
              <Select
                onValueChange={(value) => setFigureForm((prev) => ({ ...prev, linkType: value }))}
                defaultValue={figureForm.linkType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a link type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sourceData">Source Data</SelectItem>
                  <SelectItem value="linkedData">Linked Data</SelectItem>
                  <SelectItem value="newLinkedData">New Linked Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {figureForm.linkType === "sourceData" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sourceDataId" className="text-right">
                  Source Data File
                </Label>
                <Select
                  onValueChange={(value) => setFigureForm((prev) => ({ ...prev, sourceDataId: value }))}
                  defaultValue={figureForm.sourceDataId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a file" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceData.map((file) => (
                      <SelectItem key={file.filename} value={file.filename}>
                        {file.filename}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {figureForm.linkType === "linkedData" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="linkedDataId" className="text-right">
                  Linked Data Entry
                </Label>
                <Select
                  onValueChange={(value) => setFigureForm((prev) => ({ ...prev, linkedDataId: value }))}
                  defaultValue={figureForm.linkedDataId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a data entry" />
                  </SelectTrigger>
                  <SelectContent>
                    {linkedData.map((data) => (
                      <SelectItem key={`${data.type}-${data.identifier}`} value={`${data.type}-${data.identifier}`}>
                        {data.type}: {data.identifier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {figureForm.linkType === "newLinkedData" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newLinkedDataType" className="text-right">
                    Repository Type
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setFigureForm((prev) => ({
                        ...prev,
                        newLinkedData: { ...prev.newLinkedData, type: value },
                      }))
                    }
                    defaultValue={figureForm.newLinkedData.type}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a repository" />
                    </SelectTrigger>
                    <SelectContent>
                      {repositories.map((repo) => (
                        <SelectItem key={repo.name} value={repo.name}>
                          {repo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newLinkedDataIdentifier" className="text-right">
                    Accession Number
                  </Label>
                  <Input
                    id="newLinkedDataIdentifier"
                    className="col-span-3"
                    value={figureForm.newLinkedData.identifier}
                    onChange={(e) =>
                      setFigureForm((prev) => ({
                        ...prev,
                        newLinkedData: { ...prev.newLinkedData, identifier: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newLinkedDataDescription" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="newLinkedDataDescription"
                    className="col-span-3"
                    value={figureForm.newLinkedData.description}
                    onChange={(e) =>
                      setFigureForm((prev) => ({
                        ...prev,
                        newLinkedData: { ...prev.newLinkedData, description: e.target.value },
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditingFigure(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleFigureFormSubmit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Resolution Dialog */}
      <Dialog open={showConflictDetails} onOpenChange={setShowConflictDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Editing Conflicts</DialogTitle>
            <DialogDescription>
              Another editor has made changes to this manuscript. Please review and resolve the conflicts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {editingConflicts.conflicts.map((conflict, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Conflict Type: {conflict.type}</CardTitle>
                  <CardDescription>Description: {conflict.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Conflicted By: {conflict.conflictedBy}</p>
                  <p>Timestamp: {conflict.timestamp.toLocaleTimeString()}</p>
                  {/* Add conflict resolution UI here */}
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowConflictDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManuscriptDetail
export { ManuscriptDetail }
