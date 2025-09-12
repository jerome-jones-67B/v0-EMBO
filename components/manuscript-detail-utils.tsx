import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Check,
  RotateCcw,
} from "lucide-react"

// QC Check utilities
export const getQCIcon = (type: string) => {
  switch (type) {
    case "error":
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    case "info":
      return <Info className="w-4 h-4 text-blue-500" />
    default:
      return <CheckCircle className="w-4 h-4 text-green-500" />
  }
}

// Status badge utilities
export const getStatusBadge = (status: string, priority: string) => {
  const statusVariants = {
    "under-review": "default",
    "needs-revision": "destructive", 
    "approved": "secondary",
    "published": "outline",
  } as const

  const priorityColors = {
    high: "border-red-200 bg-red-50 text-red-700",
    medium: "border-yellow-200 bg-yellow-50 text-yellow-700", 
    low: "border-green-200 bg-green-50 text-green-700",
  } as const

  return (
    <div className="flex items-center gap-2">
      <Badge variant={statusVariants[status as keyof typeof statusVariants] || "default"}>
        {status}
      </Badge>
      <Badge 
        variant="outline" 
        className={priorityColors[priority as keyof typeof priorityColors] || ""}
      >
        {priority} priority
      </Badge>
    </div>
  )
}

// Check ID generation
export const getCheckId = (check: any, location: string, index: number) => {
  const message = check.message || check.check_name || 'unknown'
  if (typeof message === 'string' && message.length >= 20) {
    return `${location}-${index}-${message.substring(0, 20)}`
  }
  return `${location}-${index}-${message}`
}

// QC Actions component
export const QCActions = ({ 
  check, 
  location = "general", 
  index = 0, 
  approvedChecks,
  ignoredChecks,
  showIgnoredChecks,
  onApprove,
  onIgnore,
  onUndo
}: {
  check: any
  location?: string
  index?: number
  approvedChecks: Set<string>
  ignoredChecks: Set<string>
  showIgnoredChecks: boolean
  onApprove: (checkId: string) => void
  onIgnore: (checkId: string) => void
  onUndo: (checkId: string) => void
}) => {
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
            onClick={() => onUndo(checkId)}
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
            onClick={() => onUndo(checkId)}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="sr-only">Undo</span>
          </Button>
        </div>
      )
    }

    // AI checks can be approved or ignored
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="text-green-600 hover:text-green-700 hover:bg-green-50 h-6 px-2"
          onClick={() => onApprove(checkId)}
          title="Approve this AI check"
        >
          <Check className="w-3 h-3" />
          <span className="sr-only">Approve</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-500 hover:text-gray-700 h-6 px-2"
          onClick={() => onIgnore(checkId)}
          title="Ignore this AI check"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="sr-only">Ignore</span>
        </Button>
      </div>
    )
  }

  // Manual QC checks cannot be approved/ignored
  return null
}

// Filter utilities
export const filterAIChecks = (checks: any[]) => {
  return checks.filter((check) => check.aiGenerated)
}

export const filterFigureAIChecks = (checks: any[], figureId: string) => {
  return checks.filter((check) => {
    const checkId = getCheckId(check, `figure-${figureId}`, 0)
    return check.aiGenerated
  })
}

// Repository utilities
export const repositories = [
  { name: "ArrayExpress", baseUrl: "https://www.ebi.ac.uk/arrayexpress/experiments/", urlPattern: "E-MTAB-{accession}" },
  { name: "GEO", baseUrl: "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=", urlPattern: "GSE{accession}" },
  { name: "SRA", baseUrl: "https://www.ncbi.nlm.nih.gov/sra/?term=", urlPattern: "SRP{accession}" },
  { name: "BioStudies", baseUrl: "https://www.ebi.ac.uk/biostudies/studies/", urlPattern: "S-BSST{accession}" },
  { name: "ProteomeXchange", baseUrl: "http://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=", urlPattern: "PXD{accession}" },
  { name: "MetaboLights", baseUrl: "https://www.ebi.ac.uk/metabolights/", urlPattern: "MTBLS{accession}" },
  { name: "EMDB", baseUrl: "https://www.ebi.ac.uk/emdb/", urlPattern: "EMD-{accession}" },
  { name: "PDB", baseUrl: "https://www.rcsb.org/structure/", urlPattern: "{accession}" },
  { name: "ChEMBL", baseUrl: "https://www.ebi.ac.uk/chembl/compound_report_card/", urlPattern: "CHEMBL{accession}" },
  { name: "Other", baseUrl: "", urlPattern: "" },
]

export const generateUrl = (repositoryType: string, accession: string) => {
  const repo = repositories.find((r) => r.name === repositoryType)
  return repo ? `${repo.baseUrl}${accession}` : `https://example.com/${accession}`
}

export const generateRepositoryUrl = (repositoryType: string, accession: string) => {
  const repo = repositories.find((r) => r.name === repositoryType)
  return repo ? repo.baseUrl + accession : `https://example.com/${accession}`
}
