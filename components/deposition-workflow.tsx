"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  Database,
  RefreshCw,
  AlertCircle,
  Info,
  MessageSquare,
  XCircle,
  Loader2,
  ArrowRight,
  History,
  Settings,
} from "lucide-react"

interface DepositionWorkflowProps {
  msid: string
}

// Mock deposition data
const mockDepositionData = {
  validationStatus: {
    hasErrors: true,
    hasWarnings: true,
    errorCount: 2,
    warningCount: 3,
    criticalErrors: ["Missing author ORCID for corresponding author", "Missing figure legend for panels C-E"],
    warnings: [
      "Inconsistent reference formatting",
      "Panel B resolution could be improved",
      "Inconsistent panel labeling",
    ],
    lastValidated: "2024-01-20T14:30:00Z",
  },
  depositionHistory: [
    {
      id: "dep1",
      attemptNumber: 1,
      status: "failed",
      startedAt: "2024-01-19T10:30:00Z",
      completedAt: "2024-01-19T10:35:00Z",
      initiatedBy: "Dr. Sarah Chen",
      repository: "BioStudies",
      accessionNumber: null,
      errorMessage: "Validation errors must be resolved before deposition",
      logs: [
        { timestamp: "2024-01-19T10:30:00Z", level: "info", message: "Deposition initiated" },
        { timestamp: "2024-01-19T10:31:00Z", level: "info", message: "Validating manuscript data" },
        { timestamp: "2024-01-19T10:32:00Z", level: "error", message: "Critical validation errors found" },
        { timestamp: "2024-01-19T10:35:00Z", level: "error", message: "Deposition failed: validation errors" },
      ],
    },
    {
      id: "dep2",
      attemptNumber: 2,
      status: "failed",
      startedAt: "2024-01-20T09:15:00Z",
      completedAt: "2024-01-20T09:22:00Z",
      initiatedBy: "Dr. Sarah Chen",
      repository: "BioStudies",
      accessionNumber: null,
      errorMessage: "Network timeout during file upload",
      logs: [
        { timestamp: "2024-01-20T09:15:00Z", level: "info", message: "Deposition initiated" },
        { timestamp: "2024-01-20T09:16:00Z", level: "info", message: "Validation passed" },
        { timestamp: "2024-01-20T09:17:00Z", level: "info", message: "Uploading files to repository" },
        { timestamp: "2024-01-20T09:20:00Z", level: "warning", message: "Upload progress: 45%" },
        { timestamp: "2024-01-20T09:22:00Z", level: "error", message: "Network timeout during upload" },
      ],
    },
  ],
  currentDeposition: null,
  repositorySettings: {
    biostudies: {
      enabled: true,
      endpoint: "https://www.ebi.ac.uk/biostudies/api",
      credentials: "configured",
      lastTested: "2024-01-15T08:00:00Z",
    },
    arrayexpress: {
      enabled: false,
      endpoint: "https://www.ebi.ac.uk/arrayexpress/api",
      credentials: "not_configured",
      lastTested: null,
    },
  },
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-emerald-500" />
    case "failed":
      return <XCircle className="w-4 h-4 text-red-500" />
    case "in-progress":
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    case "queued":
      return <Clock className="w-4 h-4 text-amber-500" />
    default:
      return <Info className="w-4 h-4 text-gray-500" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          Completed
        </Badge>
      )
    case "failed":
      return <Badge variant="destructive">Failed</Badge>
    case "in-progress":
      return (
        <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">
          In Progress
        </Badge>
      )
    case "queued":
      return (
        <Badge variant="outline" className="border-amber-200 text-amber-700">
          Queued
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

const getLogLevelIcon = (level: string) => {
  switch (level) {
    case "error":
      return <AlertTriangle className="w-3 h-3 text-red-500" />
    case "warning":
      return <AlertCircle className="w-3 h-3 text-amber-500" />
    case "info":
      return <Info className="w-3 h-3 text-blue-500" />
    default:
      return <MessageSquare className="w-3 h-3 text-gray-500" />
  }
}

export function DepositionWorkflow({ msid }: DepositionWorkflowProps) {
  const [depositionData, setDepositionData] = useState(mockDepositionData)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [selectedAttempt, setSelectedAttempt] = useState<string | null>(null)
  const [depositionNotes, setDepositionNotes] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositionProgress, setDepositionProgress] = useState(0)

  const canDeposit = !depositionData.validationStatus.hasErrors
  const hasWarnings = depositionData.validationStatus.hasWarnings

  const handleStartDeposition = async () => {
    setIsDepositing(true)
    setDepositionProgress(0)
    setShowConfirmDialog(false)

    // Simulate deposition process
    const steps = [
      { progress: 10, message: "Initializing deposition..." },
      { progress: 25, message: "Validating manuscript data..." },
      { progress: 40, message: "Preparing files for upload..." },
      { progress: 60, message: "Uploading to BioStudies..." },
      { progress: 80, message: "Generating accession number..." },
      { progress: 100, message: "Deposition completed successfully!" },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setDepositionProgress(step.progress)
    }

    // Add successful deposition to history
    const newDeposition = {
      id: `dep${Date.now()}`,
      attemptNumber: depositionData.depositionHistory.length + 1,
      status: "completed",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      initiatedBy: "Current User",
      repository: "BioStudies",
      accessionNumber: `S-BSST${Math.floor(Math.random() * 1000000)}` as string | null,
      errorMessage: null as string | null,
      logs: [{ timestamp: new Date().toISOString(), level: "info", message: "Deposition completed successfully" }],
    }

    setDepositionData((prev) => ({
      ...prev,
      depositionHistory: [newDeposition as any, ...prev.depositionHistory],
    }))

    setIsDepositing(false)
    setDepositionProgress(0)
  }

  const handleRetryDeposition = () => {
    // Reset validation status for demo
    setDepositionData((prev) => ({
      ...prev,
      validationStatus: {
        ...prev.validationStatus,
        hasErrors: false,
        errorCount: 0,
        criticalErrors: [],
      },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deposition Workflow</h2>
          <p className="text-sm text-muted-foreground">Deposit manuscript data to public repositories</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowHistoryDialog(true)} className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History ({depositionData.depositionHistory.length})
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      <Card
        className={`border-l-4 ${canDeposit ? "border-l-emerald-500 bg-emerald-50" : "border-l-red-500 bg-red-50"}`}
      >
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center gap-2 ${canDeposit ? "text-emerald-700" : "text-red-700"}`}>
            {canDeposit ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              {depositionData.validationStatus.errorCount > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  {depositionData.validationStatus.errorCount} error
                  {depositionData.validationStatus.errorCount !== 1 ? "s" : ""}
                </div>
              )}
              {depositionData.validationStatus.warningCount > 0 && (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  {depositionData.validationStatus.warningCount} warning
                  {depositionData.validationStatus.warningCount !== 1 ? "s" : ""}
                </div>
              )}
              {canDeposit && (
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  Ready for deposition
                </div>
              )}
            </div>

            {!canDeposit && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-700">Critical errors must be resolved:</p>
                <ul className="space-y-1">
                  {depositionData.validationStatus.criticalErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasWarnings && canDeposit && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-700">Warnings (deposition allowed):</p>
                <ul className="space-y-1">
                  {depositionData.validationStatus.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-amber-600 flex items-start gap-2">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Last validated: {new Date(depositionData.validationStatus.lastValidated).toLocaleString()}
              </span>
              <Button variant="outline" size="sm" onClick={handleRetryDeposition}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-validate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposition Progress */}
      {isDepositing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Deposition in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={depositionProgress} className="w-full" />
              <div className="flex items-center justify-between text-sm">
                <span>Depositing to BioStudies...</span>
                <span>{depositionProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deposition Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Repository Deposition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">BioStudies</p>
                <p className="text-sm text-muted-foreground">European Bioinformatics Institute</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Configured
              </Badge>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogTrigger asChild>
                <Button disabled={!canDeposit || isDepositing} className="flex items-center gap-2" size="lg">
                  <Upload className="w-4 h-4" />
                  Deposit to BioStudies
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deposition</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      This will deposit the manuscript data to BioStudies. Once deposited, an accession number will be
                      generated and the data will be publicly accessible.
                    </p>
                  </div>

                  {hasWarnings && (
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <p className="text-sm text-amber-800 font-medium mb-2">Warnings detected:</p>
                      <ul className="text-sm text-amber-700 space-y-1">
                        {depositionData.validationStatus.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-amber-800 mt-2">
                        You can proceed with deposition, but consider addressing these warnings.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deposition Notes (Optional)</label>
                    <Textarea
                      value={depositionNotes}
                      onChange={(e) => setDepositionNotes(e.target.value)}
                      placeholder="Add any notes about this deposition..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleStartDeposition}>Confirm Deposition</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {!canDeposit && (
              <p className="text-sm text-muted-foreground">Resolve validation errors to enable deposition</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Deposition History */}
      {depositionData.depositionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {depositionData.depositionHistory.slice(0, 3).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(attempt.status)}
                    <div>
                      <p className="font-medium text-sm">Attempt #{attempt.attemptNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(attempt.startedAt).toLocaleString()} by {attempt.initiatedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(attempt.status)}
                    {attempt.accessionNumber && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {attempt.accessionNumber}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAttempt(attempt.id)}>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deposition History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Deposition History</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4 p-4">
              {depositionData.depositionHistory.map((attempt) => (
                <Card key={attempt.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(attempt.status)}
                        Attempt #{attempt.attemptNumber}
                      </CardTitle>
                      {getStatusBadge(attempt.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Started:</span> {new Date(attempt.startedAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Completed:</span> {new Date(attempt.completedAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Initiated by:</span> {attempt.initiatedBy}
                      </div>
                      <div>
                        <span className="font-medium">Repository:</span> {attempt.repository}
                      </div>
                    </div>

                    {attempt.accessionNumber && (
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <p className="text-sm font-medium text-emerald-800">Accession Number:</p>
                        <p className="font-mono text-emerald-700">{attempt.accessionNumber}</p>
                      </div>
                    )}

                    {attempt.errorMessage && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-red-800">Error:</p>
                        <p className="text-sm text-red-700">{attempt.errorMessage}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Logs:</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {attempt.logs.map((log, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs">
                            {getLogLevelIcon(log.level)}
                            <span className="text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span>{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
