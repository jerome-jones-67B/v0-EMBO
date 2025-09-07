"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
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
import { Textarea } from "@/components/ui/textarea"
import { Bot } from "lucide-react"

interface ManuscriptDetailProps {
  msid: string
  onBack: () => void
}

const getManuscriptDetail = (msid: string) => {
  const manuscriptData = {
    "EMBO-2024-001": {
      title: "Molecular mechanisms of heat shock protein 70 in cellular stress response and protein folding dynamics",
      authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez", "Dr. Lisa Wang"],
      abstract:
        "Protein folding is a critical cellular process that can be disrupted under stress conditions. This study investigates novel mechanisms by which cells maintain protein homeostasis during oxidative stress using advanced proteomics approaches.",
      figureImage: "/heat-shock-proteins.jpg",
      researchArea: "protein-folding",
    },
    "EMBO-2024-002": {
      title: "CRISPR-Cas9 mediated genome editing in pluripotent stem cells for therapeutic applications",
      authors: ["Dr. Karen Brown", "Dr. Mark Davis", "Dr. Patricia Wilson", "Dr. Steven Thompson"],
      abstract:
        "This research explores the application of CRISPR-Cas9 technology for precise genome editing in pluripotent stem cells, focusing on therapeutic applications for genetic disorders and regenerative medicine.",
      figureImage: "/crispr-stem-cells.jpg",
      researchArea: "gene-editing",
    },
    "EMBO-2024-003": {
      title: "Mitochondrial dynamics in neurodegeneration: Role of fission and fusion proteins",
      authors: ["Dr. Luis Garcia", "Dr. Ana Martinez", "Dr. Carlos Lopez"],
      abstract:
        "Investigation of mitochondrial dynamics and their role in neurodegenerative diseases, with focus on the molecular mechanisms of mitochondrial fission and fusion processes in neuronal health.",
      figureImage: "/mitochondrial-biogenesis.jpg",
      researchArea: "mitochondria",
    },
    "EMBO-2024-004": {
      title: "Single-cell RNA sequencing reveals tumor microenvironment heterogeneity in pancreatic cancer",
      authors: ["Dr. Emma Thompson", "Dr. James Wilson", "Dr. Sophie Anderson"],
      abstract:
        "Comprehensive single-cell analysis of pancreatic cancer reveals distinct cellular populations and their interactions within the tumor microenvironment, providing insights for targeted therapy development.",
      figureImage: "/single-cell-umap-clusters.jpg",
      researchArea: "cancer-biology",
    },
    "EMBO-2024-005": {
      title: "Epigenetic regulation of stem cell pluripotency through chromatin remodeling complexes",
      authors: ["Dr. Robert Kim", "Dr. Maria Santos", "Dr. David Lee"],
      abstract:
        "This study elucidates the role of chromatin remodeling complexes in maintaining stem cell pluripotency and their epigenetic regulation mechanisms during cellular differentiation.",
      figureImage: "/epigenetic-regulation.jpg",
      researchArea: "stem-cells",
    },
  }

  const specificData = manuscriptData[msid] || {
    title: "Novel research in molecular biology and cellular mechanisms",
    authors: ["Dr. Research Lead", "Dr. Co-Author"],
    abstract:
      "This manuscript presents novel findings in molecular biology with implications for cellular mechanisms and therapeutic applications.",
    figureImage: "/protein-structures.png",
    researchArea: "general",
  }

  return {
    id: msid,
    ...specificData,
    received: "2024-01-15",
    doi: `10.15252/embj.${msid.split("-")[2] || "000"}123456`,
    lastModified: "2024-01-20T14:30:00Z",
    status: "in-progress",
    assignedTo: "Dr. Sarah Wilson",
    currentStatus: "In progress",
    modifiedBy: "Dr. Sarah Chen",
    priority: "high",
    keywords: ["molecular biology", "cellular mechanisms", "protein dynamics", "therapeutic applications"],
    notes: `Requires additional validation for ${specificData.researchArea} data. Missing figure legends for panels C-E. Author contacted for clarification on methodology section.`,
    dataAvailability: `The datasets generated and analyzed during the current study are available in the Gene Expression Omnibus repository under accession number GSE123456. Additional data supporting the conclusions of this article are included within the article and its additional files.`,
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
  }
}

const ManuscriptDetail = ({ msid, onBack }: ManuscriptDetailProps) => {
  const [selectedView, setSelectedView] = useState<"manuscript" | "list">("manuscript")
  const [linkedData, setLinkedData] = useState(mockLinkedData)
  const [sourceData, setSourceData] = useState(mockSourceData)
  const [showExpandedFigure, setShowExpandedFigure] = useState<string | null>(null)
  const [overlayVisibility, setOverlayVisibility] = useState<Record<string, boolean>>({})
  const [manuscript, setManuscript] = useState(getManuscriptDetail(msid))
  const [notes, setNotes] = useState(manuscript.notes)
  const [dataAvailability, setDataAvailability] = useState(manuscript.dataAvailability)
  const [isEditingLinkedData, setIsEditingLinkedData] = useState(false)
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showFullText, setShowFullText] = useState(false)
  const [currentEditor, setCurrentEditor] = useState<{
    name: string
    email: string
    editingSince: Date
  } | null>(() => {
    if (msid === "EMBO-2024-002") {
      return {
        name: "Dr. Sarah Chen",
        email: "s.chen@embo.org",
        editingSince: new Date(Date.now() - 15 * 60 * 1000),
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
    if (msid === "EMBO-2024-002") {
      return {
        hasConflicts: true,
        conflicts: [
          {
            type: "ai_check",
            description: "AI Check for Figure 1 Panel A approved",
            conflictedBy: "Dr. Michael Rodriguez",
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
          },
        ],
      }
    }
    return { hasConflicts: false, conflicts: [] }
  })

  const repositories = [
    { name: "PDB", label: "Protein Data Bank", urlPattern: "https://www.rcsb.org/structure/{id}" },
    { name: "UniProt", label: "UniProt Knowledgebase", urlPattern: "https://www.uniprot.org/uniprot/{id}" },
    {
      name: "GEO",
      label: "Gene Expression Omnibus",
      urlPattern: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={id}",
    },
    { name: "Custom", label: "Custom Repository", urlPattern: "" },
  ]

  const generateUrl = (repositoryType: string, accession: string) => {
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

  const handleSaveNotes = () => {
    console.log("[v0] Saving notes for manuscript:", manuscript.id, "Notes:", notesValue)
    setIsEditingNotes(false)
    manuscript.notes = notesValue
    setNotes(notesValue)
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

  useEffect(() => {
    const updatedManuscript = getManuscriptDetail(msid)
    setManuscript(updatedManuscript)
    setNotes(updatedManuscript.notes)
    setDataAvailability(updatedManuscript.dataAvailability)
  }, [msid])

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

  const [approvedChecks, setApprovedChecks] = useState(new Set())
  const [ignoredChecks, setIgnoredChecks] = useState(new Set())
  const [showIgnoredChecks, setShowIgnoredChecks] = useState(false)

  const getCheckId = (check: any, location: string, index: number) => {
    return `${location}-${index}-${check.message.substring(0, 20)}`
  }

  const getQCActions = (check: any, location = "general", index = 0) => {
    const checkId = getCheckId(check, location, index)

    if (check.aiGenerated) {
      if (approvedChecks.has(checkId)) {
        return (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-mono">
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
            </Button>
          </div>
        )
      }

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
          </Button>
        </div>
      )
    } else {
      return (
        <div className="flex gap-1">
          <Badge variant="destructive" className="text-xs">
            Fix Required
          </Badge>
        </div>
      )
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
                    <input
                      type="text"
                      value={linkedDataForm.identifier}
                      onChange={(e) => setLinkedDataForm((prev) => ({ ...prev, identifier: e.target.value }))}
                      placeholder="Enter accession number..."
                      className="w-full p-2 border rounded-md text-sm"
                    />
                  </div>

                  {linkedDataForm.isCustom && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">URL</Label>
                      <input
                        type="url"
                        value={linkedDataForm.url}
                        onChange={(e) => setLinkedDataForm((prev) => ({ ...prev, url: e.target.value }))}
                        placeholder="Enter full URL..."
                        className="w-full p-2 border rounded-md text-sm"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <input
                      type="text"
                      value={linkedDataForm.description}
                      onChange={(e) => setLinkedDataForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the data..."
                      className="w-full p-2 border rounded-md text-sm"
                    />
                  </div>

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
            {manuscript.qcChecks.map((check, checkIndex) => {
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
          </CardContent>
        </Card>
      )}

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

                <div className="relative">
                  <img
                    src={manuscript.figureImage || "/placeholder.svg"}
                    alt={figure.title}
                    className={`w-full object-contain border rounded-lg ${
                      showExpandedFigure === figure.id ? "max-h-96" : "max-h-64"
                    }`}
                    onError={(e) => {
                      console.log("[v0] Image failed to load:", manuscript.figureImage)
                      e.currentTarget.src = "/placeholder.svg?height=300&width=400&text=Figure+Image"
                    }}
                  />

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

              <div className="space-y-2">
                <div className="text-sm text-gray-900 bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed shadow-sm">
                  {figure.legend || "No legend available for this figure."}
                </div>
              </div>

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
                          <p className="text-sm text-gray-600">{panel.description}</p>
                        </div>
                        {panel.hasIssues && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs">Needs attention</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {figure.qcChecks && figure.qcChecks.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Figure Issues</Label>
                  {figure.qcChecks.map((check, checkIndex) => (
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

export { ManuscriptDetail }
