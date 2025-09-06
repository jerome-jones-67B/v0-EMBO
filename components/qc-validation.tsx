"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  Bot,
  User,
  Flag,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Settings,
  FileText,
  ImageIcon,
  Grid3X3,
  BarChart3,
  Palette,
  Shield,
  Clock,
  MessageSquare,
} from "lucide-react"

interface QCValidationProps {
  msid: string
}

// Mock QC checks data with enhanced structure
const mockQCChecks = [
  // Manuscript-level checks
  {
    id: "qc1",
    level: "manuscript",
    type: "error",
    category: "metadata",
    subcategory: "author-info",
    title: "Missing author ORCID",
    message: "Missing author ORCID for corresponding author",
    details:
      "The corresponding author Dr. John Smith is missing a valid ORCID identifier. This is required for publication.",
    aiGenerated: false,
    confidence: null,
    dismissed: false,
    followUp: true,
    assignedTo: "Dr. Sarah Chen",
    createdDate: "2024-01-20T10:30:00Z",
    lastModified: "2024-01-20T10:30:00Z",
    source: "manual",
    severity: "high",
    autoFixable: false,
    relatedItems: ["author-1"],
  },
  {
    id: "qc2",
    level: "manuscript",
    type: "warning",
    category: "formatting",
    subcategory: "references",
    title: "Inconsistent reference formatting",
    message: "References use inconsistent formatting styles",
    details:
      "References 15-18 use different formatting style than the rest of the manuscript. Consider standardizing to journal format.",
    aiGenerated: true,
    confidence: 0.87,
    dismissed: false,
    followUp: false,
    assignedTo: null,
    createdDate: "2024-01-20T11:15:00Z",
    lastModified: "2024-01-20T11:15:00Z",
    source: "ai-formatting",
    severity: "medium",
    autoFixable: true,
    relatedItems: ["ref-15", "ref-16", "ref-17", "ref-18"],
  },
  {
    id: "qc3",
    level: "manuscript",
    type: "info",
    category: "statistical",
    subcategory: "power-analysis",
    title: "Statistical power analysis detected",
    message: "Appropriate statistical power analysis found",
    details:
      "The manuscript includes proper statistical power analysis in the methods section. Sample sizes appear adequate for the reported effects.",
    aiGenerated: true,
    confidence: 0.92,
    dismissed: false,
    followUp: false,
    assignedTo: null,
    createdDate: "2024-01-20T12:00:00Z",
    lastModified: "2024-01-20T12:00:00Z",
    source: "ai-statistical",
    severity: "low",
    autoFixable: false,
    relatedItems: ["methods-stats"],
  },
  // Figure-level checks
  {
    id: "qc4",
    level: "figure",
    type: "error",
    category: "validation",
    subcategory: "legends",
    title: "Missing figure legends",
    message: "Missing figure legend for panels C-E",
    details:
      "Figure 3 panels C, D, and E lack proper legends describing the experimental conditions. This affects reproducibility.",
    aiGenerated: false,
    confidence: null,
    dismissed: false,
    followUp: true,
    assignedTo: "Dr. Sarah Chen",
    createdDate: "2024-01-20T09:45:00Z",
    lastModified: "2024-01-20T09:45:00Z",
    source: "manual",
    severity: "high",
    autoFixable: false,
    relatedItems: ["figure-3", "panel-c", "panel-d", "panel-e"],
  },
  {
    id: "qc5",
    level: "figure",
    type: "warning",
    category: "quality",
    subcategory: "resolution",
    title: "Low resolution detected",
    message: "Panel B resolution could be improved",
    details:
      "Figure 2 Panel B appears to have lower resolution than recommended (current: 150 DPI, recommended: 300 DPI).",
    aiGenerated: true,
    confidence: 0.78,
    dismissed: false,
    followUp: false,
    assignedTo: null,
    createdDate: "2024-01-20T13:20:00Z",
    lastModified: "2024-01-20T13:20:00Z",
    source: "ai-image-analysis",
    severity: "medium",
    autoFixable: false,
    relatedItems: ["figure-2", "panel-b"],
  },
  {
    id: "qc6",
    level: "figure",
    type: "info",
    category: "statistical",
    subcategory: "error-bars",
    title: "Error bars detected",
    message: "Appropriate error bars found in quantitative figures",
    details:
      "Statistical analysis appears appropriate with error bars representing SEM. N values are clearly indicated.",
    aiGenerated: true,
    confidence: 0.95,
    dismissed: false,
    followUp: false,
    assignedTo: null,
    createdDate: "2024-01-20T14:10:00Z",
    lastModified: "2024-01-20T14:10:00Z",
    source: "ai-statistical",
    severity: "low",
    autoFixable: false,
    relatedItems: ["figure-1", "figure-3"],
  },
  // Panel-level checks
  {
    id: "qc7",
    level: "panel",
    type: "warning",
    category: "cosmetic",
    subcategory: "labeling",
    title: "Inconsistent panel labeling",
    message: "Panel labels use different font sizes",
    details:
      "Panels in Figure 2 use inconsistent font sizes for labels (A: 12pt, B: 10pt, C: 14pt). Consider standardizing.",
    aiGenerated: true,
    confidence: 0.83,
    dismissed: false,
    followUp: false,
    assignedTo: null,
    createdDate: "2024-01-20T15:30:00Z",
    lastModified: "2024-01-20T15:30:00Z",
    source: "ai-cosmetic",
    severity: "low",
    autoFixable: true,
    relatedItems: ["figure-2", "panel-a", "panel-b", "panel-c"],
  },
  {
    id: "qc8",
    level: "panel",
    type: "info",
    category: "ethics",
    subcategory: "animal-welfare",
    title: "Animal welfare compliance",
    message: "Proper animal welfare statements detected",
    details:
      "All animal experiments include appropriate welfare and ethics statements. IACUC approval numbers are provided.",
    aiGenerated: true,
    confidence: 0.91,
    dismissed: false,
    followUp: false,
    assignedTo: null,
    createdDate: "2024-01-20T16:00:00Z",
    lastModified: "2024-01-20T16:00:00Z",
    source: "ai-ethics",
    severity: "low",
    autoFixable: false,
    relatedItems: ["methods-animals"],
  },
]

const getQCIcon = (type: string) => {
  switch (type) {
    case "error":
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    case "warning":
      return <AlertCircle className="w-4 h-4 text-amber-500" />
    case "info":
      return <Info className="w-4 h-4 text-blue-500" />
    case "pass":
      return <CheckCircle className="w-4 h-4 text-emerald-500" />
    default:
      return <Info className="w-4 h-4 text-gray-500" />
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "metadata":
      return <FileText className="w-4 h-4" />
    case "formatting":
      return <Settings className="w-4 h-4" />
    case "validation":
      return <CheckCircle className="w-4 h-4" />
    case "quality":
      return <ImageIcon className="w-4 h-4" />
    case "statistical":
      return <BarChart3 className="w-4 h-4" />
    case "cosmetic":
      return <Palette className="w-4 h-4" />
    case "ethics":
      return <Shield className="w-4 h-4" />
    default:
      return <Grid3X3 className="w-4 h-4" />
  }
}

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "high":
      return (
        <Badge variant="destructive" className="text-xs">
          High
        </Badge>
      )
    case "medium":
      return (
        <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
          Medium
        </Badge>
      )
    case "low":
      return (
        <Badge variant="secondary" className="text-xs">
          Low
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Unknown
        </Badge>
      )
  }
}

export function QCValidation({ msid }: QCValidationProps) {
  const [checks, setChecks] = useState(mockQCChecks)
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [showDismissed, setShowDismissed] = useState(false)
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null)
  const [newCheckDialog, setNewCheckDialog] = useState(false)

  const filteredChecks = checks.filter((check) => {
    if (!showDismissed && check.dismissed) return false
    if (selectedLevel !== "all" && check.level !== selectedLevel) return false
    if (selectedCategory !== "all" && check.category !== selectedCategory) return false
    if (selectedType !== "all" && check.type !== selectedType) return false
    return true
  })

  const groupedChecks = {
    manuscript: filteredChecks.filter((c) => c.level === "manuscript"),
    figure: filteredChecks.filter((c) => c.level === "figure"),
    panel: filteredChecks.filter((c) => c.level === "panel"),
  }

  const handleDismissCheck = (checkId: string) => {
    setChecks((prev) =>
      prev.map((check) =>
        check.id === checkId
          ? { ...check, dismissed: !check.dismissed, lastModified: new Date().toISOString() }
          : check,
      ),
    )
  }

  const handleToggleFollowUp = (checkId: string) => {
    setChecks((prev) =>
      prev.map((check) =>
        check.id === checkId ? { ...check, followUp: !check.followUp, lastModified: new Date().toISOString() } : check,
      ),
    )
  }

  const handleRunQC = () => {
    // Simulate running QC checks
    const newCheck = {
      id: `qc${Date.now()}`,
      level: "manuscript" as const,
      type: "info" as const,
      category: "validation",
      subcategory: "completeness",
      title: "QC scan completed",
      message: "Automated QC scan completed successfully",
      details: "All automated checks have been run. No new issues detected.",
      aiGenerated: true,
      confidence: 0.99,
      dismissed: false,
      followUp: false,
      assignedTo: null,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      source: "ai-validation",
      severity: "low" as const,
      autoFixable: false,
      relatedItems: [],
    }
    setChecks((prev) => [newCheck, ...prev])
  }

  const errorCount = filteredChecks.filter((c) => c.type === "error").length
  const warningCount = filteredChecks.filter((c) => c.type === "warning").length
  const followUpCount = filteredChecks.filter((c) => c.followUp && !c.dismissed).length
  const aiGeneratedCount = filteredChecks.filter((c) => c.aiGenerated).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Control Checks</h2>
          <p className="text-sm text-muted-foreground">
            {filteredChecks.length} checks • {errorCount} errors • {warningCount} warnings • {followUpCount} follow-ups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRunQC} className="flex items-center gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            Run QC
          </Button>
          <Dialog open={newCheckDialog} onOpenChange={setNewCheckDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Check
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Manual QC Check</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manuscript">Manuscript</SelectItem>
                      <SelectItem value="figure">Figure</SelectItem>
                      <SelectItem value="panel">Panel</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Check details..." />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewCheckDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setNewCheckDialog(false)}>Add Check</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                <p className="text-sm text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{warningCount}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{followUpCount}</p>
                <p className="text-sm text-muted-foreground">Follow-ups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{aiGeneratedCount}</p>
                <p className="text-sm text-muted-foreground">AI Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="manuscript">Manuscript</SelectItem>
                <SelectItem value="figure">Figure</SelectItem>
                <SelectItem value="panel">Panel</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="metadata">Metadata</SelectItem>
                <SelectItem value="formatting">Formatting</SelectItem>
                <SelectItem value="validation">Validation</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="statistical">Statistical</SelectItem>
                <SelectItem value="cosmetic">Cosmetic</SelectItem>
                <SelectItem value="ethics">Ethics</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showDismissed ? "default" : "outline"}
              size="sm"
              onClick={() => setShowDismissed(!showDismissed)}
              className="flex items-center gap-2"
            >
              {showDismissed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showDismissed ? "Hide" : "Show"} Dismissed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QC Checks by Level */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({filteredChecks.length})</TabsTrigger>
          <TabsTrigger value="manuscript">Manuscript ({groupedChecks.manuscript.length})</TabsTrigger>
          <TabsTrigger value="figure">Figure ({groupedChecks.figure.length})</TabsTrigger>
          <TabsTrigger value="panel">Panel ({groupedChecks.panel.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {Object.entries(groupedChecks).map(([level, levelChecks]) => (
            <div key={level}>
              {levelChecks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center gap-2">
                      {getCategoryIcon(level)}
                      {level} Level Checks ({levelChecks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {levelChecks.map((check) => (
                      <QCCheckCard
                        key={check.id}
                        check={check}
                        onDismiss={handleDismissCheck}
                        onToggleFollowUp={handleToggleFollowUp}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </TabsContent>

        {["manuscript", "figure", "panel"].map((level) => (
          <TabsContent key={level} value={level} className="space-y-4">
            {groupedChecks[level as keyof typeof groupedChecks].map((check) => (
              <QCCheckCard
                key={check.id}
                check={check}
                onDismiss={handleDismissCheck}
                onToggleFollowUp={handleToggleFollowUp}
              />
            ))}
            {groupedChecks[level as keyof typeof groupedChecks].length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No {level} level checks found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

// QC Check Card Component
function QCCheckCard({
  check,
  onDismiss,
  onToggleFollowUp,
}: {
  check: any
  onDismiss: (id: string) => void
  onToggleFollowUp: (id: string) => void
}) {
  return (
    <div
      className={`p-4 border rounded-lg ${
        check.dismissed
          ? "opacity-60 bg-gray-50"
          : check.type === "error"
            ? "border-red-200 bg-red-50"
            : check.type === "warning"
              ? "border-amber-200 bg-amber-50"
              : "border-blue-200 bg-blue-50"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getQCIcon(check.type)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-medium text-sm">{check.title}</p>
              <Badge variant="outline" className="text-xs">
                {check.level}
              </Badge>
              <div className="flex items-center gap-1">
                {getCategoryIcon(check.category)}
                <Badge variant="secondary" className="text-xs">
                  {check.category}
                </Badge>
              </div>
              {getSeverityBadge(check.severity)}
              {check.aiGenerated && (
                <Badge variant="outline" className="text-xs border-purple-200 text-purple-700 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  AI {check.confidence && `(${Math.round(check.confidence * 100)}%)`}
                </Badge>
              )}
              {check.autoFixable && (
                <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                  Auto-fixable
                </Badge>
              )}
            </div>
            <p className="text-sm mb-2">{check.message}</p>
            <p className="text-xs text-muted-foreground mb-3">{check.details}</p>

            {check.relatedItems.length > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs text-muted-foreground">Related:</span>
                {check.relatedItems.map((item: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(check.createdDate).toLocaleDateString()}
              </span>
              {check.assignedTo && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {check.assignedTo}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {check.source}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={check.followUp ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleFollowUp(check.id)}
            className="flex items-center gap-1"
          >
            <Flag className="w-3 h-3" />
            {check.followUp ? "Following" : "Follow-up"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDismiss(check.id)} className="flex items-center gap-1">
            {check.dismissed ? <Eye className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {check.dismissed ? "Show" : "Dismiss"}
          </Button>
        </div>
      </div>
    </div>
  )
}
