"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { SeverityIcon, SeverityIconForPanel } from "@/components/ui/severity-icon"
import { AlertCircle, AlertTriangle, CheckCircle, Edit, ExternalLink, Plus, Image as ImageIcon, Info, XCircle, FileText } from 'lucide-react'
import { api } from '@/lib/api-client'
import { buildApiUrl } from '@/lib/config'
import type { ManuscriptDetailData, Figure } from '@/types/manuscript-detail'
import type { LinkCreate, LinkDetails } from '@/lib/types'
import { ManuallyMarkedChecksModal } from '@/components/manuscript/manually-marked-checks-modal'

interface ManuscriptOverviewTabsProps {
  manuscript: ManuscriptDetailData
  selectedFigureIndex: number
  onFigureChange: (index: number) => void
  onNextFigure: () => void
  onPreviousFigure: () => void
  onLinksChange?: () => void
}

interface FigureDetailProps {
  figure: Figure
  figureIndex: number
  manuscriptId: string
  markedForFollowUp: Set<string>
  onToggleFollowUp: (checkId: string) => void
}


// Individual Figure Detail Component
function FigureDetail({ figure, figureIndex, manuscriptId, markedForFollowUp, onToggleFollowUp }: FigureDetailProps) {
  const [figurePreview, setFigurePreview] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [selectedCheck, setSelectedCheck] = useState<any | null>(null)
  const [highlightedPanel, setHighlightedPanel] = useState<string | null>(null)
  const [editingCheck, setEditingCheck] = useState<any | null>(null)
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [editData, setEditData] = useState<{ severity: number; result: string }>({ severity: 1, result: '' })
  const [checkTypeFilter, setCheckTypeFilter] = useState<string>('all')

  // Fetch figure preview
  useEffect(() => {
    const fetchPreview = async () => {
      if (!figure.image_file_id) return

      setIsLoadingPreview(true)
      try {
        const blob = await api.files.getPreview(manuscriptId, figure.image_file_id.toString())
        const url = URL.createObjectURL(blob)
        setFigurePreview(url)
      } catch (error) {
        console.error('Failed to load figure preview:', error)
      } finally {
        setIsLoadingPreview(false)
      }
    }

    fetchPreview()

    // Cleanup
    return () => {
      if (figurePreview) {
        URL.revokeObjectURL(figurePreview)
      }
    }
  }, [figure.image_file_id, manuscriptId])

  // Fetch messages for check name mapping
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesData = await api.messages.getAll()
        setMessages(messagesData && typeof messagesData === 'object' && !Array.isArray(messagesData)
          ? messagesData as unknown as Record<string, string>
          : {})
      } catch (error) {
        console.error('Failed to load messages:', error)
        setMessages({})
      }
    }

    fetchMessages()
  }, [])

  // Get severity badge for check results
  const getCheckSeverityBadge = (checkResult: any) => {
    const status = checkResult.status?.toLowerCase()
    if (status === 'fail' || status === 'error') {
      return <Badge variant="destructive" className="text-xs">Fail</Badge>
    } else if (status === 'warning' || status === 'warn') {
      return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Warning</Badge>
    }
    return <Badge variant="outline" className="text-xs">Pass</Badge>
  }

  // Get severity indicator for location column with panel label
  const getSeverityIndicator = (severity: number, panelLabel: string) => {
    return <SeverityIconForPanel severity={severity} panelLabel={panelLabel} />
  }

  // Get AI checks for this figure
  const figureChecks = figure.panels?.flatMap((panel, panelIndex) => {
    if (!panel.check_results || panel.check_results.length === 0) return []
    return panel.check_results.map((check: any, checkIndex: number) => {
      // Safely extract check key, ensuring it's a string
      const extractCheckKey = () => {
        // Handle nested check object structure: check.check.name
        if (check.check && typeof check.check === 'object' && check.check.name) {
          return check.check.name
        }

        // Fallback to check as string
        if (check.check && typeof check.check === 'string') {
          return check.check
        }

        // Try check_name
        if (check.check_name) {
          return typeof check.check_name === 'string' ? check.check_name : String(check.check_name)
        }

        // Handle nested category object: category.name
        if (check.category && typeof check.category === 'object' && check.category.name) {
          return check.category.name
        }

        // Fallback to category as string
        if (check.category && typeof check.category === 'string') {
          return check.category
        }

        return 'quality_check'
      }

      const checkKey = extractCheckKey()

      // Extract severity - handle nested category object
      let severity = check.severity
      if (!severity && check.category && typeof check.category === 'object') {
        severity = check.category.severity
      }
      // Map negative or missing severity to a default
      if (!severity || severity < 0) {
        severity = check.status === 'fail' ? 3 : check.status === 'warning' ? 2 : 1
      }

      // Generate unique ID in the same format as AI Checks tab
      // Format: manuscriptId-location-checkName-checkId
      // Location format: "Figure 1A" where 1 is figure label and A is panel label
      const location = `${figure.label}${panel.label}`
      const checkName = check.check || check.check_name || 'unknown'
      const uniqueId = `${manuscriptId}-${location}-${checkName}-${check.id || checkIndex}`

      return {
        ...check,
        uniqueId,
        panelId: panel.id,
        panelLabel: panel.label,
        severity,
        checkKey,
        checkType: 'Figures' // Currently all checks are figure-type
      }
    })
  }) || []

  // Filter checks by type
  const filteredChecks = checkTypeFilter === 'all'
    ? figureChecks
    : figureChecks.filter(check => check.checkType === checkTypeFilter)

  // Group checks by checkKey (check type) to show one row per check type
  const groupedChecks = filteredChecks.reduce((acc: any[], check: any) => {
    const existing = acc.find(item => item.checkKey === check.checkKey)
    if (existing) {
      existing.panels.push({
        panelId: check.panelId,
        panelLabel: check.panelLabel,
        severity: check.severity,
        uniqueId: check.uniqueId,
        ...check
      })
    } else {
      acc.push({
        checkKey: check.checkKey,
        checkType: check.checkType,
        panels: [{
          panelId: check.panelId,
          panelLabel: check.panelLabel,
          severity: check.severity,
          uniqueId: check.uniqueId,
          ...check
        }]
      })
    }
    return acc
  }, [])

  // Handle check click - show details and highlight panel
  const handleCheckClick = (check: any) => {
    console.log('🔍 Selected check data:', {
      uniqueId: check.uniqueId,
      checkKey: check.checkKey,
      check_name: check.check_name,
      message: check.message,
      details: check.details,
      validation_result: check.validation_result,
      result: check.result,
      status: check.status,
      severity: check.severity,
      panelLabel: check.panelLabel,
      isMarked: markedForFollowUp.has(check.uniqueId),
      fullCheck: check
    })
    setSelectedCheck(check)
    setHighlightedPanel(check.panelLabel)
  }

  // Handle override initiation
  const handleOverrideClick = (check: any) => {
    setEditingCheck(check)
    setEditData({
      severity: check.severity,
      result: check.validation_result || check.message || ''
    })
    setShowOverrideDialog(true)
  }

  // Handle override save
  const handleOverrideSave = async () => {
    if (!editingCheck) return

    try {
      // Update check via API
      await api.checks.update(manuscriptId, editingCheck.id?.toString() || '', {
        severity: editData.severity,
        validation_result: editData.result
      })

      // Close dialog and refresh (in a real implementation, you'd refresh the data)
      setShowOverrideDialog(false)
      setEditingCheck(null)

      // TODO: Refresh figure data
      console.log('Check updated successfully')
    } catch (error) {
      console.error('Failed to update check:', error)
      alert('Failed to save changes. Please try again.')
    }
  }

  // Helper to get display name for check
  const getCheckDisplayName = (checkKey: any) => {
    // Convert to string if needed
    const key = typeof checkKey === 'string' ? checkKey : String(checkKey || '')

    // Handle empty or invalid values
    if (!key || key === '' || key === 'undefined' || key === 'null' || key === '[object Object]') {
      return 'Quality Check'
    }

    // Look up in messages or format the key nicely
    try {
      return messages[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    } catch (error) {
      console.error('Error formatting check key:', key, error)
      return 'Quality Check'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Figure Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{figure.label}</h2>
        {figure.caption_confidence !== undefined && (
          <Badge variant="outline" className="text-xs">
            Confidence: {Math.round(figure.caption_confidence * 100)}%
          </Badge>
        )}
      </div>

      {/* Three Column Layout: Preview | Caption | AI Checks */}
      <div className="grid grid-cols-3 gap-2">
        {/* Column 1: Preview with Bounding Boxes (1/3 width) */}
        <div className="col-span-1 border rounded-lg shadow-sm bg-white p-4">
          {isLoadingPreview ? (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading image...</p>
              </div>
            </div>
          ) : figurePreview ? (
            <div className="relative bg-gray-100 rounded-md overflow-hidden">
              <img
                src={figurePreview}
                alt={figure.label}
                className="w-full h-auto object-contain"
              />
              {/* Panel Bounding Boxes Overlay */}
              {figure.panels?.map((panel) => {
                // Check if panel has valid coordinates (can be 0, but not null/undefined)
                if (panel.x1 != null && panel.y1 != null && panel.x2 != null && panel.y2 != null) {
                  const left = panel.x1 * 100
                  const top = panel.y1 * 100
                  const width = (panel.x2 - panel.x1) * 100
                  const height = (panel.y2 - panel.y1) * 100
                  const isHighlighted = highlightedPanel === panel.label

                  // Show all panels when nothing is selected, only show selected panel when one is selected
                  const shouldShow = !highlightedPanel || isHighlighted

                  if (!shouldShow) return null

                  return (
                    <div
                      key={panel.id}
                      className={`absolute border-2 pointer-events-none transition-all ${
                        isHighlighted
                          ? 'border-yellow-400 border-4 shadow-lg'
                          : 'border-blue-500'
                      }`}
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                      }}
                    >
                      <div className={`absolute top-1 right-1 text-white text-xs px-1 py-0 rounded font-medium shadow-sm ${
                        isHighlighted ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {panel.label}
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No preview available</p>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Caption (1/3 width) */}
        <div className="col-span-1 border rounded-lg shadow-sm bg-white">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold">Caption</h3>
          </div>
          <div className="p-4">
            <div
              className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: figure.caption || 'No caption provided' }}
            />
          </div>
        </div>

        {/* Column 3: AI Checks (1/3 width) */}
        <div className="col-span-1 border rounded-lg shadow-sm bg-white overflow-hidden">
          {/* Check Type Filter */}
          <div className="p-3 border-b bg-gray-50">
            <Label htmlFor="check-type-filter" className="text-xs text-gray-600 mb-1 block">
              Check Type
            </Label>
            <Select value={checkTypeFilter} onValueChange={setCheckTypeFilter}>
              <SelectTrigger id="check-type-filter" className="h-8 text-sm">
                <SelectValue placeholder="All Checks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Checks</SelectItem>
                <SelectItem value="Figures">Figures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-auto">
                  <div className="flex items-center gap-2">
                    <span>AI Check</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 rounded-full hover:bg-gray-100"
                      title="Add AI Check"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="w-auto">Panels</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedChecks.length > 0 ? (
                groupedChecks.map((group: any, index: number) => {
                  // Check if any panel in this group is marked for follow-up
                  const hasMarkedPanel = group.panels.some((p: any) => markedForFollowUp.has(p.uniqueId))
                  const isSelected = group.panels.some((p: any) => selectedCheck?.uniqueId === p.uniqueId)

                  return (
                    <TableRow
                      key={`${group.checkKey}-${index}`}
                      className={`transition-colors ${
                        isSelected ? 'bg-blue-50' : ''
                      } ${hasMarkedPanel ? 'border-l-4 border-l-blue-500' : ''}`}
                    >
                      <TableCell className="text-sm py-2">
                        {getCheckDisplayName(group.checkKey)}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {group.panels.map((panel: any) => {
                            const isMarked = markedForFollowUp.has(panel.uniqueId)
                            const isPanelSelected = selectedCheck?.uniqueId === panel.uniqueId

                            return (
                              <div
                                key={panel.uniqueId}
                                className={`inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${
                                  isPanelSelected ? 'ring-2 ring-blue-500 rounded' : ''
                                }`}
                                onClick={() => handleCheckClick(panel)}
                                title={`Panel ${panel.panelLabel} - Click to view details`}
                              >
                                <Checkbox
                                  checked={isMarked}
                                  onCheckedChange={() => onToggleFollowUp(panel.uniqueId)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-3 w-3"
                                />
                                {getSeverityIndicator(panel.severity, panel.panelLabel)}
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title={`Edit ${getCheckDisplayName(group.checkKey)}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              // Edit the first panel's check as representative
                              handleOverrideClick(group.panels[0])
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                    No AI checks available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Check Details Section */}
      {selectedCheck && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Check Details - Panel {selectedCheck.panelLabel}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCheck(null)
                  setHighlightedPanel(null)
                }}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Check Name */}
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Check Name</Label>
              <p className="text-sm font-medium">{getCheckDisplayName(selectedCheck.checkKey)}</p>
            </div>

            {/* Check Result with Severity Indicator */}
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Check Result</Label>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md border">
                {/* Severity Indicator Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <SeverityIcon severity={selectedCheck.severity} size="md" />
                </div>

                {/* Check Result Text */}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">
                    {(() => {
                      // Try multiple fields in order, checking for non-empty values
                      const messageLookup = messages[selectedCheck.checkKey]
                      if (messageLookup && messageLookup.trim()) return messageLookup

                      if (selectedCheck.details && selectedCheck.details.trim()) return selectedCheck.details
                      if (selectedCheck.message && selectedCheck.message.trim()) return selectedCheck.message
                      if (selectedCheck.validation_result && selectedCheck.validation_result.trim()) return selectedCheck.validation_result
                      if (selectedCheck.result && selectedCheck.result.trim()) return selectedCheck.result

                      // Fallback to check name if nothing else is available
                      if (selectedCheck.check_name) return `Check: ${selectedCheck.check_name}`

                      return 'No details available'
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                variant={markedForFollowUp.has(selectedCheck.uniqueId) ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleFollowUp(selectedCheck.uniqueId)}
                className="flex items-center gap-2"
              >
                {markedForFollowUp.has(selectedCheck.uniqueId) ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Marked for Follow-up
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Mark for Follow-up
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Override Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Override AI Check</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to override this AI check? You can modify the severity and result below.
            </p>

            <div className="space-y-2">
              <Label htmlFor="edit-severity">Severity</Label>
              <Select
                value={editData.severity.toString()}
                onValueChange={(value) => setEditData({ ...editData, severity: parseInt(value) })}
              >
                <SelectTrigger id="edit-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Info</SelectItem>
                  <SelectItem value="2">Warning</SelectItem>
                  <SelectItem value="3">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-result">Check Result</Label>
              <Input
                id="edit-result"
                value={editData.result}
                onChange={(e) => setEditData({ ...editData, result: e.target.value })}
                placeholder="Enter check result..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowOverrideDialog(false)
                setEditingCheck(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleOverrideSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper to get severity badge
const getSeverityBadge = (severity: number) => {
  if (severity === 3) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" />
        Error
      </Badge>
    )
  } else if (severity === 2) {
    return (
      <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
        <AlertTriangle className="w-3 h-3" />
        Warning
      </Badge>
    )
  } else if (severity === 1) {
    return (
      <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-800">
        <Info className="w-3 h-3" />
        Information
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1">
      <CheckCircle className="w-3 h-3" />
      Pass
    </Badge>
  )
}

export function ManuscriptOverviewTabs({
  manuscript,
  selectedFigureIndex,
  onFigureChange,
  onNextFigure,
  onPreviousFigure,
  onLinksChange
}: ManuscriptOverviewTabsProps) {
  const [activeTab, setActiveTab] = useState('manuscript')
  const [manuscriptChecks, setManuscriptChecks] = useState<any[]>([])
  const [isLoadingChecks, setIsLoadingChecks] = useState(false)
  const [manuscriptLinks, setManuscriptLinks] = useState<LinkDetails[]>(manuscript.links || [])
  const [showAddCheckDialog, setShowAddCheckDialog] = useState(false)
  const [newCheckData, setNewCheckData] = useState({ check: '', severity: 1, result: '' })
  const [editingCheckIndex, setEditingCheckIndex] = useState<number | null>(null)
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false)
  const [pendingEditIndex, setPendingEditIndex] = useState<number | null>(null)
  const [editCheckData, setEditCheckData] = useState<{ severity: number; result: string } | null>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkFormData, setLinkFormData] = useState<LinkCreate>({ name: '', uri: '', identifier: null, database: null })
  const [linkTabValue, setLinkTabValue] = useState<'structured' | 'freeform'>('structured')
  const [selectedDatabase, setSelectedDatabase] = useState<string>('')
  const [isSubmittingLink, setIsSubmittingLink] = useState(false)
  const [linkNotification, setLinkNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Shared state for marked checks (synchronized with AI Checks tab)
  const [markedForFollowUp, setMarkedForFollowUp] = useState<Set<string>>(new Set())

  // Known identifier types for structured links
  const knownDatabases = [
    'DOI',
    'PubMed',
    'Zenodo',
    'GitHub',
    'UniProt',
    'ArrayExpress',
    'PRIDE'
  ]

  // Available check types for manuscript
  const manuscriptCheckTypes = [
    'section_order',
    'image_quality',
    'data_availability',
    'references',
    'methodology',
    'ethics_statement',
    'funding_statement',
    'author_contributions',
    'competing_interests',
    'reproducibility'
  ]

  // Severity options
  const severityOptions = [
    { value: 1, label: 'Info' },
    { value: 2, label: 'Warning' },
    { value: 3, label: 'Error' }
  ]

  // Load persisted marked checks from localStorage on mount (shared with AI Checks tab)
  useEffect(() => {
    try {
      const version = 'v2'
      const storageKey = `manuallyMarkedAIChecks_${version}`
      const markedChecksJson = localStorage.getItem(storageKey)

      if (markedChecksJson) {
        const markedChecks = new Set<string>(JSON.parse(markedChecksJson))
        setMarkedForFollowUp(markedChecks)
      }
    } catch (error) {
      console.error('Failed to load persisted marked checks:', error)
    }
  }, [])

  // Toggle follow-up status for a check (persists to shared localStorage)
  const toggleCheckFollowUp = (checkUniqueId: string) => {
    setMarkedForFollowUp(prev => {
      const newSet = new Set(prev)
      if (newSet.has(checkUniqueId)) {
        newSet.delete(checkUniqueId)
      } else {
        newSet.add(checkUniqueId)
      }

      // Persist to localStorage (same storage as AI Checks tab)
      try {
        const version = 'v2'
        const storageKey = `manuallyMarkedAIChecks_${version}`
        localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)))
      } catch (error) {
        console.error('Failed to persist marked checks:', error)
      }

      return newSet
    })
  }

  // Fetch manuscript-level checks
  const fetchManuscriptChecks = useCallback(async () => {
    if (!manuscript?.id) return

    setIsLoadingChecks(true)
    try {
      // Fetch checks from the API (same endpoint as AI QC checks tab)
      const checksResponse = await api.checks.getByManuscriptId(manuscript.id)
      const allChecks = Array.isArray(checksResponse) ? checksResponse : []

      // Filter for manuscript-level checks with severity > 0
      const manuscriptLevelChecks = allChecks
        .filter((check: any) => {
          const location = check.location || {}
          const isManuscriptLevel = !location.figure && !location.panel
          const hasSeverity = check.severity !== undefined && check.severity > 0
          return isManuscriptLevel && hasSeverity
        })
        .map((check: any, index: number) => {
          // Generate unique ID for manuscript check (same format as AI checks)
          const location = 'Manuscript' // Manuscript-level checks have location "Manuscript"
          const checkName = check.check || check.check_name || 'unknown'
          const uniqueId = `${manuscript.id}-${location}-${checkName}-${check.id || index}`

          return {
            ...check,
            uniqueId
          }
        })

      setManuscriptChecks(manuscriptLevelChecks)
    } catch (error) {
      console.error('Failed to fetch manuscript checks:', error)
      setManuscriptChecks([])
    } finally {
      setIsLoadingChecks(false)
    }
  }, [manuscript?.id])

  // Fetch manuscript links
  const fetchManuscriptLinks = useCallback(async () => {
    if (!manuscript?.id) return

    try {
      const manuscriptData = await api.manuscripts.getById(manuscript.id)
      // API returns data directly, not wrapped
      setManuscriptLinks((manuscriptData as any).links || [])
    } catch (error) {
      console.error('Failed to fetch manuscript links:', error)
    }
  }, [manuscript?.id])

  useEffect(() => {
    fetchManuscriptChecks()
    fetchManuscriptLinks()
  }, [fetchManuscriptChecks, fetchManuscriptLinks])

  // Handle adding a new link
  const handleAddLink = async () => {
    if (!manuscript?.id) return

    try {
      setIsSubmittingLink(true)
      setLinkNotification(null)

      let linkData: LinkCreate

      if (linkTabValue === 'structured') {
        // Structured identifier
        if (!selectedDatabase || !linkFormData.identifier) {
          setLinkNotification({ type: 'error', message: 'Please fill in all required fields' })
          return
        }

        linkData = {
          name: linkFormData.name || `${selectedDatabase} ${linkFormData.identifier}`,
          uri: linkFormData.uri || `https://identifiers.org/${selectedDatabase.toLowerCase()}:${linkFormData.identifier}`,
          identifier: linkFormData.identifier,
          database: selectedDatabase
        }
      } else {
        // Freeform URL
        if (!linkFormData.uri) {
          setLinkNotification({ type: 'error', message: 'Please provide a URL' })
          return
        }

        linkData = {
          name: linkFormData.name || linkFormData.uri,
          uri: linkFormData.uri,
          identifier: null,
          database: null
        }
      }

      // Create the link
      await api.links.createManuscript(manuscript.id, linkData)

      // Refresh the links
      await fetchManuscriptLinks()

      // Notify parent component
      if (onLinksChange) {
        onLinksChange()
      }

      // Show success notification
      setLinkNotification({ type: 'success', message: 'Link added successfully!' })

      // Reset form
      setLinkFormData({ name: '', uri: '', identifier: null, database: null })
      setSelectedDatabase('')

      // Close dialog after a short delay
      setTimeout(() => {
        setShowLinkDialog(false)
        setLinkNotification(null)
      }, 1500)
    } catch (error) {
      console.error('Failed to add link:', error)
      setLinkNotification({ type: 'error', message: 'Failed to add link. Please try again.' })
    } finally {
      setIsSubmittingLink(false)
    }
  }

  // Render severity badge
  const getSeverityBadge = (severity: number) => {
    if (severity === 3) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Error
        </Badge>
      )
    } else if (severity === 2) {
      return (
        <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3" />
          Warning
        </Badge>
      )
    } else if (severity === 1) {
      return (
        <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-800">
          <Info className="w-3 h-3" />
          Information
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="gap-1">
        <CheckCircle className="w-3 h-3" />
        Pass
      </Badge>
    )
  }

  // Render severity icon for table
  const getSeverityIcon = (severity: number) => {
    if (severity === 3) {
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500">
          <XCircle className="w-4 h-4 text-white" />
        </div>
      )
    } else if (severity === 2) {
      return (
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center w-6 h-6">
            <AlertTriangle className="w-6 h-6 text-yellow-500 fill-yellow-500" strokeWidth={1.5} />
            <span className="absolute text-yellow-900 font-bold text-xs">!</span>
          </div>
        </div>
      )
    } else if (severity === 1) {
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500">
          <Info className="w-4 h-4 text-white" />
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
        <CheckCircle className="w-4 h-4 text-white" />
      </div>
    )
  }

  return (
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="w-full overflow-x-auto mb-6">
        <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="manuscript" className="px-3 py-1 text-sm whitespace-nowrap">
            Manuscript
          </TabsTrigger>
          <TabsTrigger value="data-availability" className="px-3 py-1 text-sm whitespace-nowrap">
            Data availability
          </TabsTrigger>
          {manuscript.figures?.map((figure, index) => (
            <TabsTrigger key={figure.id} value={`figure-${index}`} className="px-3 py-1 text-sm whitespace-nowrap">
              Fig {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Manuscript Tab */}
      <TabsContent value="manuscript" className="space-y-6">
        {isLoadingChecks ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading checks...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* AI Checks Section */}
            {manuscriptChecks.length > 0 && (
              <>
                {/* Summary Table */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle>AI Checks Summary</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <ManuallyMarkedChecksModal
                          manuscriptId={manuscript.id}
                          trigger={
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              View AI report
                            </Button>
                          }
                        />
                        <Dialog open={showAddCheckDialog} onOpenChange={setShowAddCheckDialog}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-full"
                            title="Add AI Check"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Add AI Check</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {/* AI Check Type and Severity in one row */}
                            <div className="grid grid-cols-12 items-center gap-4">
                              <Label htmlFor="check-type" className="col-span-2 text-right">
                                AI Check:
                              </Label>
                              <div className="col-span-5">
                                <Select
                                  value={newCheckData.check}
                                  onValueChange={(value) => setNewCheckData({ ...newCheckData, check: value })}
                                >
                                  <SelectTrigger id="check-type">
                                    <SelectValue placeholder="Select check type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {manuscriptCheckTypes.map((checkType) => (
                                      <SelectItem key={checkType} value={checkType}>
                                        {checkType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Label htmlFor="severity" className="col-span-2 text-right">
                                Severity:
                              </Label>
                              <div className="col-span-3">
                                <Select
                                  value={newCheckData.severity.toString()}
                                  onValueChange={(value) => setNewCheckData({ ...newCheckData, severity: parseInt(value) })}
                                >
                                  <SelectTrigger id="severity">
                                    <SelectValue placeholder="Select severity" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {severityOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value.toString()}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Check Result */}
                            <div className="grid grid-cols-4 items-start gap-4">
                              <Label htmlFor="check-result" className="text-right mt-2">
                                Check result:
                              </Label>
                              <div className="col-span-3">
                                <Input
                                  id="check-result"
                                  placeholder="Enter check result..."
                                  value={newCheckData.result}
                                  onChange={(e) => setNewCheckData({ ...newCheckData, result: e.target.value })}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowAddCheckDialog(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={async () => {
                                try {
                                  // Create new check via API
                                  const checkData = {
                                    check: newCheckData.check,
                                    severity: newCheckData.severity,
                                    validation_result: newCheckData.result,
                                    checklist: 'manual', // User-added checks
                                    location: {
                                      figure: null,
                                      panel: null
                                    }
                                  }

                                  await api.checks.create(manuscript.id, checkData)

                                  // Refresh checks
                                  await fetchManuscriptChecks()

                                  // Close dialog and reset
                                  setShowAddCheckDialog(false)
                                  setNewCheckData({ check: '', severity: 1, result: '' })

                                  console.log('Check added successfully')
                                } catch (error) {
                                  console.error('Failed to add check:', error)
                                  alert('Failed to add check. Please try again.')
                                }
                              }}
                              disabled={!newCheckData.check || !newCheckData.result}
                            >
                              Add Check
                            </Button>
                          </div>
                        </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-auto">AI check</TableHead>
                          <TableHead className="w-20 text-center">Severity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {manuscriptChecks.map((check, index) => (
                          <TableRow key={check.id || index}>
                            <TableCell className="font-medium py-2">
                              {check.check || check.check_name || 'Unknown check'}
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex justify-center">
                                {getSeverityIcon(check.severity)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Detailed Check Results */}
                <div className="space-y-4">
                  {manuscriptChecks.map((check, index) => {
                    // Check if this is a section order check
                    const isSectionOrderCheck = check.check === 'section_order' ||
                                                check.check?.toLowerCase().includes('section') &&
                                                check.check?.toLowerCase().includes('order')

                    // Parse context if it's an object
                    let parsedContext = check.context
                    if (typeof check.context === 'string') {
                      try {
                        parsedContext = JSON.parse(check.context)
                      } catch (e) {
                        // Keep as string if parsing fails
                      }
                    }

                    // Check if this check is being edited
                    const isEditing = editingCheckIndex === index

                    // Special rendering for section order check
                    if (isSectionOrderCheck && parsedContext && typeof parsedContext === 'object' && parsedContext.sections) {
                      const sections = parsedContext.sections
                      const hasChanges = sections.some((s: any) => s.move || s.remove || s.rename || s.missing)

                      return (
                        <Card key={check.id || index} className="border-l-4 border-l-red-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base font-medium">
                                Check results: Manuscript: section order
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-0.5">
                                {isEditing ? (
                                  <Select
                                    value={editCheckData?.severity.toString() || check.severity.toString()}
                                    onValueChange={(value) => setEditCheckData({
                                      ...editCheckData!,
                                      severity: parseInt(value)
                                    })}
                                  >
                                    <SelectTrigger className="w-32 h-7">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {severityOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value.toString()}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  getSeverityBadge(check.severity)
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {isEditing ? (
                              <div className="space-y-2">
                                <Label htmlFor={`check-result-${index}`} className="text-sm font-medium">
                                  Check Result:
                                </Label>
                                <Input
                                  id={`check-result-${index}`}
                                  value={editCheckData?.result || check.validation_result || 'The manuscript sections should be changed in the following way(s):'}
                                  onChange={(e) => setEditCheckData({
                                    ...editCheckData!,
                                    result: e.target.value
                                  })}
                                  placeholder="Enter check result..."
                                  className="text-sm"
                                />
                              </div>
                            ) : (
                              hasChanges && (
                                <div className="flex items-start gap-2 text-sm text-gray-700">
                                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <span>The manuscript sections should be changed in the following way(s):</span>
                                </div>
                              )
                            )}

                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-1/2">Original Manuscript Sections</TableHead>
                                  <TableHead className="w-1/2">Changes</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sections.map((section: any, sectionIndex: number) => {
                                  let changeText = ''
                                  if (section.missing) {
                                    changeText = 'Missing - should be added'
                                  } else if (section.remove) {
                                    changeText = 'Should be removed'
                                  } else if (section.rename) {
                                    changeText = `Rename to "${section.rename}"`
                                  } else if (section.move) {
                                    changeText = `Move before ${section.move}`
                                  }

                                  return (
                                    <TableRow key={sectionIndex}>
                                      <TableCell className="font-medium">{section.name}</TableCell>
                                      <TableCell className={changeText ? 'text-orange-600 font-medium' : 'text-gray-400'}>
                                        {changeText || '—'}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>

                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`follow-up-${check.uniqueId || check.id || index}`}
                                  checked={markedForFollowUp.has(check.uniqueId)}
                                  onCheckedChange={() => toggleCheckFollowUp(check.uniqueId)}
                                />
                                <label
                                  htmlFor={`follow-up-${check.uniqueId || check.id || index}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  Mark for follow-up
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingCheckIndex(null)
                                        setEditCheckData(null)
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          if (!editCheckData) return

                                          // Update check via API
                                          const updateData = {
                                            severity: editCheckData.severity,
                                            validation_result: editCheckData.result
                                          }

                                          await api.checks.update(manuscript.id, check.id.toString(), updateData)

                                          // Refresh checks
                                          await fetchManuscriptChecks()

                                          // Clear edit mode
                                          setEditingCheckIndex(null)
                                          setEditCheckData(null)

                                          console.log('Check updated successfully')
                                        } catch (error) {
                                          console.error('Failed to update check:', error)
                                          alert('Failed to save changes. Please try again.')
                                        }
                                      }}
                                    >
                                      Save
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => {
                                      setPendingEditIndex(index)
                                      setShowOverrideConfirm(true)
                                    }}
                                  >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    }

                    // Default rendering for other checks
                    const validationResult = typeof check.validation_result === 'object'
                      ? JSON.stringify(check.validation_result, null, 2)
                      : check.validation_result

                    const context = typeof check.context === 'object'
                      ? JSON.stringify(check.context, null, 2)
                      : check.context

                    return (
                      <Card key={check.id || index} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isEditing ? (
                              <Select
                                value={editCheckData?.severity.toString() || check.severity.toString()}
                                onValueChange={(value) => setEditCheckData({
                                  ...editCheckData!,
                                  severity: parseInt(value)
                                })}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {severityOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              getSeverityBadge(check.severity)
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="font-medium text-sm">
                              {check.checklist && <span className="text-muted-foreground">{check.checklist}: </span>}
                              {check.check}
                            </div>
                            {isEditing ? (
                              <Input
                                value={editCheckData?.result || validationResult || ''}
                                onChange={(e) => setEditCheckData({
                                  ...editCheckData!,
                                  result: e.target.value
                                })}
                                placeholder="Enter check result..."
                                className="text-sm"
                              />
                            ) : (
                              <>
                                {validationResult && (
                                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{validationResult}</div>
                                )}
                                {context && !isSectionOrderCheck && (
                                  <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                                    Context: {context}
                                  </div>
                                )}
                              </>
                            )}
                            {/* Mark for follow-up checkbox */}
                            <div className="flex items-center gap-2 pt-2 border-t mt-3">
                              <Checkbox
                                id={`follow-up-default-${check.uniqueId || check.id || index}`}
                                checked={markedForFollowUp.has(check.uniqueId)}
                                onCheckedChange={() => toggleCheckFollowUp(check.uniqueId)}
                              />
                              <label
                                htmlFor={`follow-up-default-${check.uniqueId || check.id || index}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Mark for follow-up
                              </label>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => {
                                    setEditingCheckIndex(null)
                                    setEditCheckData(null)
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 px-3"
                                  onClick={async () => {
                                    try {
                                      if (!editCheckData) return

                                      // Update check via API
                                      const updateData = {
                                        severity: editCheckData.severity,
                                        validation_result: editCheckData.result
                                      }

                                      await api.checks.update(manuscript.id, check.id.toString(), updateData)

                                      // Refresh checks
                                      await fetchManuscriptChecks()

                                      // Clear edit mode
                                      setEditingCheckIndex(null)
                                      setEditCheckData(null)

                                      console.log('Check updated successfully')
                                    } catch (error) {
                                      console.error('Failed to update check:', error)
                                      alert('Failed to save changes. Please try again.')
                                    }
                                  }}
                                >
                                  Save
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setPendingEditIndex(index)
                                  setShowOverrideConfirm(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}

            {manuscriptChecks.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-lg font-medium">No Issues Found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All manuscript-level checks have passed successfully
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </TabsContent>

      {/* Data availability Tab */}
      <TabsContent value="data-availability" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {manuscript.notes && (
              <div className="text-sm text-gray-700">
                {manuscript.notes}
              </div>
            )}
            {!manuscript.notes && (
              <div className="text-sm text-muted-foreground italic">
                No data availability statement provided.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <CardTitle>Linked Information</CardTitle>
              <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="gap-2">
                    <Edit className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Linked Data to Manuscript</DialogTitle>
                  </DialogHeader>

                  {/* Notification */}
                  {linkNotification && (
                    <div className={`p-3 rounded-md ${
                      linkNotification.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {linkNotification.message}
                    </div>
                  )}

                  <div className="p-4">
                    <Tabs value={linkTabValue} onValueChange={(value) => setLinkTabValue(value as 'structured' | 'freeform')}>
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="structured">Structured Identifier</TabsTrigger>
                        <TabsTrigger value="freeform">Freeform URL</TabsTrigger>
                      </TabsList>

                      {/* Structured Identifier Tab */}
                      <TabsContent value="structured" className="space-y-4">
                        <div>
                          <Label htmlFor="identifier-type" className="text-sm font-medium text-gray-700 mb-1 block">
                            Identifier Type
                          </Label>
                          <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                            <SelectTrigger id="identifier-type">
                              <SelectValue placeholder="Select identifier type" />
                            </SelectTrigger>
                            <SelectContent>
                              {knownDatabases.map((db) => (
                                <SelectItem key={db} value={db}>
                                  {db}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="identifier-value" className="text-sm font-medium text-gray-700 mb-1 block">
                            Identifier
                          </Label>
                          <Input
                            id="identifier-value"
                            type="text"
                            placeholder="e.g., 10.1234/example"
                            value={linkFormData.identifier || ''}
                            onChange={(e) => setLinkFormData({ ...linkFormData, identifier: e.target.value })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label htmlFor="link-name" className="text-sm font-medium text-gray-700 mb-1 block">
                            Display Name (Optional)
                          </Label>
                          <Input
                            id="link-name"
                            type="text"
                            placeholder="e.g., Dataset on Zenodo"
                            value={linkFormData.name}
                            onChange={(e) => setLinkFormData({ ...linkFormData, name: e.target.value })}
                            className="w-full"
                          />
                        </div>
                      </TabsContent>

                      {/* Freeform URL Tab */}
                      <TabsContent value="freeform" className="space-y-4">
                        <div>
                          <Label htmlFor="url-input" className="text-sm font-medium text-gray-700 mb-1 block">
                            URL
                          </Label>
                          <Input
                            id="url-input"
                            type="url"
                            placeholder="https://example.com/data"
                            value={linkFormData.uri}
                            onChange={(e) => setLinkFormData({ ...linkFormData, uri: e.target.value })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label htmlFor="url-name" className="text-sm font-medium text-gray-700 mb-1 block">
                            Display Name (Optional)
                          </Label>
                          <Input
                            id="url-name"
                            type="text"
                            placeholder="e.g., Supplementary Data"
                            value={linkFormData.name}
                            onChange={(e) => setLinkFormData({ ...linkFormData, name: e.target.value })}
                            className="w-full"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setShowLinkDialog(false)} disabled={isSubmittingLink}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddLink} disabled={isSubmittingLink}>
                        {isSubmittingLink ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {manuscriptLinks.length > 0 ? (
              <div className="space-y-3">
                {manuscriptLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <a
                        href={link.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium block truncate"
                      >
                        {link.name || link.uri}
                      </a>
                      {link.database && link.identifier && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {link.database}: {link.identifier}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No linked information available</p>
                <p className="text-sm mt-1">Click "Edit" to add external links</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Individual Figure Tabs */}
      {manuscript.figures?.map((figure, index) => (
        <TabsContent key={figure.id} value={`figure-${index}`} className="space-y-6">
          <FigureDetail
            figure={figure}
            figureIndex={index}
            manuscriptId={manuscript.id}
            markedForFollowUp={markedForFollowUp}
            onToggleFollowUp={toggleCheckFollowUp}
          />
        </TabsContent>
      ))}

      {/* No Figures Message */}
      {(!manuscript.figures || manuscript.figures.length === 0) && (
        <div className="py-12 text-center text-muted-foreground">
          <p>No figures available in this manuscript</p>
        </div>
      )}
    </Tabs>

    {/* Override Confirmation Dialog */}
    <Dialog open={showOverrideConfirm} onOpenChange={setShowOverrideConfirm}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Override AI Check?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to override the AI Check? This will allow you to manually edit the check result and severity.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowOverrideConfirm(false)
              setPendingEditIndex(null)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (pendingEditIndex !== null) {
                const check = manuscriptChecks[pendingEditIndex]
                setEditCheckData({
                  severity: check.severity,
                  result: check.validation_result || ''
                })
                setEditingCheckIndex(pendingEditIndex)
              }
              setShowOverrideConfirm(false)
              setPendingEditIndex(null)
            }}
          >
            Override
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
