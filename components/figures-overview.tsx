"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  ImageIcon,
  Edit3,
  Link,
  Database,
  Grid3X3,
  ZoomIn,
  ArrowUp,
  ArrowDown,
  Save,
  Edit,
} from "lucide-react"

interface FiguresOverviewProps {
  msid: string
  onEditFigure?: (figureIndex: number) => void // Added optional prop for figure editing
}

// Mock figure data
const mockFigures = [
  {
    id: "fig1",
    label: "Figure 1",
    title: "Protein folding dynamics under oxidative stress",
    image: "/protein-structures.png",
    caption:
      "Representative images showing protein folding changes. (A) Control conditions showing normal folding patterns. (B) Oxidative stress conditions with altered conformations. (C) Quantitative analysis of folding efficiency. Scale bars: 50 nm.",
    panels: [
      {
        id: "fig1a",
        label: "A",
        image: "/protein-structure-control.png",
        caption: "Control conditions showing normal folding patterns",
        boundingBox: { x: 10, y: 10, width: 180, height: 140 },
        linkedData: [{ type: "PDB", identifier: "7ABC", description: "Crystal structure data" }],
        qcStatus: "validated",
        hasErrors: false,
        hasWarnings: false,
      },
      {
        id: "fig1b",
        label: "B",
        image: "/placeholder-e9mgd.png",
        caption: "Oxidative stress conditions with altered conformations",
        boundingBox: { x: 200, y: 10, width: 180, height: 140 },
        linkedData: [{ type: "PDB", identifier: "7DEF", description: "Stress condition structure" }],
        qcStatus: "warning",
        hasErrors: false,
        hasWarnings: true,
      },
      {
        id: "fig1c",
        label: "C",
        image: "/quantitative-analysis-graph.png",
        caption: "Quantitative analysis of folding efficiency",
        boundingBox: { x: 10, y: 160, width: 370, height: 130 },
        linkedData: [{ type: "Source Data", identifier: "fig1c_data.xlsx", description: "Raw quantification data" }],
        qcStatus: "validated",
        hasErrors: false,
        hasWarnings: false,
      },
    ],
    linkedFiles: [
      { type: "Source Data", filename: "figure1_source_data.xlsx", size: "2.3 MB" },
      { type: "High Resolution", filename: "figure1_hires.tiff", size: "15.7 MB" },
    ],
    qcChecks: [
      {
        type: "info",
        message: "All panels properly labeled",
        category: "formatting",
      },
      {
        type: "warning",
        message: "Panel B resolution could be improved",
        category: "quality",
      },
    ],
    validationStatus: "validated",
    lastModified: "2024-01-20T10:30:00Z",
    linkedData: [{ type: "Supplementary", identifier: "supp1.pdf", description: "Supplementary information" }],
  },
  {
    id: "fig2",
    label: "Figure 2",
    title: "Molecular chaperone interactions",
    image: "/molecular-interactions.png",
    caption:
      "Schematic representation of chaperone-substrate interactions. (A) HSP70 binding mechanism. (B) Co-chaperone recruitment. (C) ATP-dependent folding cycle.",
    panels: [
      {
        id: "fig2a",
        label: "A",
        image: "/hsp70-binding.png",
        caption: "HSP70 binding mechanism",
        boundingBox: { x: 10, y: 10, width: 120, height: 280 },
        linkedData: [],
        qcStatus: "error",
        hasErrors: true,
        hasWarnings: false,
      },
      {
        id: "fig2b",
        label: "B",
        image: "/co-chaperone-recruitment.png",
        caption: "Co-chaperone recruitment",
        boundingBox: { x: 140, y: 10, width: 120, height: 280 },
        linkedData: [],
        qcStatus: "needs-validation",
        hasErrors: false,
        hasWarnings: true,
      },
      {
        id: "fig2c",
        label: "C",
        image: "/atp-folding-cycle.png",
        caption: "ATP-dependent folding cycle",
        boundingBox: { x: 270, y: 10, width: 120, height: 280 },
        linkedData: [],
        qcStatus: "validated",
        hasErrors: false,
        hasWarnings: false,
      },
    ],
    linkedFiles: [{ type: "Source Data", filename: "figure2_interactions.ai", size: "5.1 MB" }],
    qcChecks: [
      {
        type: "error",
        message: "Missing legend for panel A",
        category: "formatting",
      },
      {
        type: "warning",
        message: "Inconsistent font sizes across panels",
        category: "formatting",
      },
    ],
    validationStatus: "needs-validation",
    lastModified: "2024-01-19T15:45:00Z",
  },
  {
    id: "fig3",
    label: "Figure 3",
    title: "Time-course analysis of protein aggregation",
    image: "/protein-aggregation-time-course.png",
    caption:
      "Temporal analysis of protein aggregation under stress conditions. (A-D) Representative microscopy images at 0, 2, 6, and 24 hours. (E) Quantitative analysis of aggregation levels over time.",
    panels: [
      {
        id: "fig3a",
        label: "A",
        image: "/microscopy-0-hours.png",
        caption: "0 hours - baseline",
        boundingBox: { x: 10, y: 10, width: 90, height: 90 },
        linkedData: [],
        qcStatus: "validated",
        hasErrors: false,
        hasWarnings: false,
      },
      {
        id: "fig3b",
        label: "B",
        image: "/microscopy-two-hours.png",
        caption: "2 hours - early aggregation",
        boundingBox: { x: 110, y: 10, width: 90, height: 90 },
        linkedData: [],
        qcStatus: "validated",
        hasErrors: false,
        hasWarnings: false,
      },
      {
        id: "fig3c",
        label: "C",
        image: "/microscopy-6-hours.png",
        caption: "6 hours - moderate aggregation",
        boundingBox: { x: 210, y: 10, width: 90, height: 90 },
        linkedData: [],
        qcStatus: "validated",
        hasErrors: false,
        hasWarnings: false,
      },
      {
        id: "fig3d",
        label: "D",
        image: "/microscopy-24-hours.png",
        caption: "24 hours - extensive aggregation",
        boundingBox: { x: 310, y: 10, width: 90, height: 90 },
        linkedData: [],
        qcStatus: "validated",
        hasErrors: false,
        hasWarnings: false,
      },
      {
        id: "fig3e",
        label: "E",
        image: "/quantitative-aggregation-graph.png",
        caption: "Quantitative analysis of aggregation levels over time",
        boundingBox: { x: 10, y: 110, width: 390, height: 180 },
        linkedData: [
          { type: "Source Data", identifier: "fig3e_timecourse.xlsx", description: "Time-course quantification" },
        ],
        qcStatus: "validated",
        hasErrors: false,
        hasWarnings: false,
      },
    ],
    linkedFiles: [
      { type: "Source Data", filename: "figure3_timecourse.xlsx", size: "1.8 MB" },
      { type: "Raw Images", filename: "figure3_raw_microscopy.zip", size: "45.2 MB" },
    ],
    qcChecks: [
      {
        type: "info",
        message: "Excellent time-course documentation",
        category: "completeness",
      },
    ],
    validationStatus: "validated",
    lastModified: "2024-01-21T09:15:00Z",
  },
]

const getStatusIcon = (status: string, hasErrors: boolean, hasWarnings: boolean) => {
  if (hasErrors) {
    return <AlertTriangle className="w-4 h-4 text-red-500" />
  } else if (hasWarnings) {
    return <AlertCircle className="w-4 h-4 text-amber-500" />
  } else if (status === "validated") {
    return <CheckCircle className="w-4 h-4 text-emerald-500" />
  } else {
    return <Info className="w-4 h-4 text-blue-500" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "validated":
      return (
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Validated
        </Badge>
      )
    case "needs-validation":
      return <Badge variant="destructive">Needs Validation</Badge>
    case "error":
      return <Badge variant="destructive">Error</Badge>
    case "warning":
      return (
        <Badge variant="outline" className="border-amber-200 text-amber-700">
          Warning
        </Badge>
      )
    default:
      return <Badge variant="outline">Pending</Badge>
  }
}

export function FiguresOverview({ msid, onEditFigure }: FiguresOverviewProps) {
  const [selectedFigure, setSelectedFigure] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const totalPanels = mockFigures.reduce((sum, fig) => sum + fig.panels.length, 0)
  const validatedPanels = mockFigures.reduce(
    (sum, fig) => sum + fig.panels.filter((panel) => panel.qcStatus === "validated").length,
    0,
  )
  const errorPanels = mockFigures.reduce((sum, fig) => sum + fig.panels.filter((panel) => panel.hasErrors).length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Figures Overview</h2>
          <p className="text-sm text-muted-foreground">
            {mockFigures.length} figures, {totalPanels} panels • {validatedPanels} validated
            {errorPanels > 0 && `, ${errorPanels} with errors`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <ImageIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Figures Grid/List */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
        {mockFigures.map((figure, figureIndex) => (
          <Card key={figure.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{figure.label}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(figure.validationStatus)}
                  {onEditFigure && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditFigure(figureIndex)}
                      title="Edit figure details and data links"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>
                          {figure.label}: {figure.title}
                        </DialogTitle>
                      </DialogHeader>
                      <FigureValidationView figure={figure} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{figure.title}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Figure Image */}
              <div className="relative">
                <img
                  src={figure.image || "/placeholder.svg"}
                  alt={figure.title}
                  className="w-full h-48 object-cover rounded-lg border"
                />
                {/* Panel Indicators */}
                <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                  {figure.panels.map((panel) => (
                    <div
                      key={panel.id}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        panel.hasErrors
                          ? "bg-red-500 text-white"
                          : panel.hasWarnings
                            ? "bg-amber-500 text-white"
                            : panel.qcStatus === "validated"
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-400 text-white"
                      }`}
                    >
                      {panel.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <p className="text-sm leading-relaxed">{figure.caption}</p>
              </div>

              {/* Figure-level Linked Data */}
              {figure.linkedData && figure.linkedData.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Figure-level Linked Data:</p>
                  {figure.linkedData.map((data: any, dataIndex: number) => (
                    <div key={dataIndex} className="flex items-center gap-2 text-xs">
                      <Database className="w-3 h-3" />
                      <span className="font-mono">{data.identifier}</span>
                      <span className="text-muted-foreground">({data.description})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* QC Status and Files */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  {figure.qcChecks.map((check, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {getStatusIcon(check.type, check.type === "error", check.type === "warning")}
                      <span>{check.message}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>{figure.linkedFiles.length} files</span>
                </div>
              </div>

              {/* Panel Summary */}
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  {figure.panels.filter((p) => p.qcStatus === "validated").length} validated
                </span>
                {figure.panels.some((p) => p.hasWarnings) && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    {figure.panels.filter((p) => p.hasWarnings).length} warnings
                  </span>
                )}
                {figure.panels.some((p) => p.hasErrors) && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {figure.panels.filter((p) => p.hasErrors).length} errors
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Figure Validation View Component
function FigureValidationView({ figure }: { figure: any }) {
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null)
  const [editingPanel, setEditingPanel] = useState<string | null>(null)
  const [panelCaption, setPanelCaption] = useState("")

  const handleEditPanel = (panelId: string, caption: string) => {
    setEditingPanel(panelId)
    setPanelCaption(caption)
  }

  const handleSavePanel = () => {
    // Save panel changes
    setEditingPanel(null)
    setPanelCaption("")
  }

  return (
    <ScrollArea className="h-[70vh]">
      <div className="space-y-6 p-4">
        {/* Large Figure Image with Panel Overlays */}
        <div className="relative">
          <img
            src={figure.image || "/placeholder.svg"}
            alt={figure.title}
            className="w-full max-h-96 object-contain border rounded-lg"
          />
          {/* Panel Bounding Boxes */}
          {figure.panels.map((panel: any) => (
            <div
              key={panel.id}
              className={`absolute border-2 cursor-pointer transition-all ${
                selectedPanel === panel.id
                  ? "border-blue-500 bg-blue-500/20"
                  : panel.hasErrors
                    ? "border-red-500 bg-red-500/10"
                    : panel.hasWarnings
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-emerald-500 bg-emerald-500/10"
              }`}
              style={{
                left: `${(panel.boundingBox.x / 400) * 100}%`,
                top: `${(panel.boundingBox.y / 300) * 100}%`,
                width: `${(panel.boundingBox.width / 400) * 100}%`,
                height: `${(panel.boundingBox.height / 300) * 100}%`,
              }}
              onClick={() => setSelectedPanel(selectedPanel === panel.id ? null : panel.id)}
            >
              <div className="absolute -top-6 left-0 bg-white border rounded px-2 py-1 text-xs font-bold shadow-sm">
                {panel.label}
              </div>
            </div>
          ))}
        </div>

        {/* Panel List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Panels</h3>
          {figure.panels.map((panel: any, index: number) => (
            <Card
              key={panel.id}
              className={`${selectedPanel === panel.id ? "ring-2 ring-blue-500" : ""} ${
                panel.hasErrors ? "border-red-200 bg-red-50" : panel.hasWarnings ? "border-amber-200 bg-amber-50" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Panel Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={panel.image || "/placeholder.svg"}
                      alt={`Panel ${panel.label}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>

                  {/* Panel Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          Panel {panel.label}
                        </Badge>
                        {getStatusIcon(panel.qcStatus, panel.hasErrors, panel.hasWarnings)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPanel(panel.id, panel.caption)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Caption */}
                    {editingPanel === panel.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={panelCaption}
                          onChange={(e) => setPanelCaption(e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={handleSavePanel}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingPanel(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{panel.caption}</p>
                    )}

                    {/* Linked Data */}
                    {panel.linkedData.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Linked Data:</p>
                        {panel.linkedData.map((data: any, dataIndex: number) => (
                          <div key={dataIndex} className="flex items-center gap-2 text-xs">
                            <Database className="w-3 h-3" />
                            <span className="font-mono">{data.identifier}</span>
                            <span className="text-muted-foreground">({data.description})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Linked Files */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link className="w-5 h-5" />
              Linked Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {figure.linkedFiles.map((file: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.type} • {file.size}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Link className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
