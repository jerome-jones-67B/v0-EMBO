"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { CheckCircle, FileText, AlertTriangle, Copy } from 'lucide-react'
import { api } from '@/lib/api-client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Utility functions for rendering check messages (matching ChecksTable logic)
const CheckUtils = {
  /**
   * Renders a message with context by replacing template placeholders
   */
  renderMessageWithContext: (description: string, context: any): string => {
    if (!description || !context) return description || ''

    let result = description

    // Parse context if it's a string
    let contextObj = context
    if (typeof context === 'string') {
      try {
        contextObj = JSON.parse(context)
      } catch (e) {
        return description
      }
    }

    // Replace template placeholders like {{ caption }}, {{ title }}, etc.
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/g
    result = result.replace(placeholderRegex, (match, key) => {
      // Try to get the value from context
      if (contextObj && typeof contextObj === 'object' && key in contextObj) {
        return contextObj[key] || match
      }
      return match
    })

    return result
  },

  /**
   * Removes severity prefix from description (e.g., "Warning: ", "Error: ", "Fail: ")
   */
  removeSeverityPrefix: (description: string): string => {
    if (!description) return ''

    // Remove common severity prefixes
    return description.replace(/^(Info|Warning|Error|Fail|Pass):\s*/i, '')
  }
}

interface ManuallyMarkedCheck {
  id: string
  manuscriptId: string
  manuscriptTitle: string
  figureLabel?: string
  panelLabel?: string
  checkName: string
  status: string
  message: string | null
  details: string | null
  description?: string | null  // Check result message from category/messages
  severity: number
  location: string
  checklist?: string
  check?: string
  context?: string
}

interface ManuallyMarkedChecksModalProps {
  manuscriptId?: string // If provided, only show checks for this manuscript
  trigger?: React.ReactNode // Custom trigger button
}

export function ManuallyMarkedChecksModal({ manuscriptId, trigger }: ManuallyMarkedChecksModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [checks, setChecks] = useState<ManuallyMarkedCheck[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Load manually marked checks from localStorage
  useEffect(() => {
    if (!isOpen) return

    const loadManuallyMarkedChecks = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get manually marked checks from localStorage (use versioned key)
        const version = 'v2'
        const storageKey = `manuallyMarkedAIChecks_${version}`
        const markedChecksJson = localStorage.getItem(storageKey)
        const markedChecks: Set<string> = markedChecksJson
          ? new Set(JSON.parse(markedChecksJson))
          : new Set()

        if (markedChecks.size === 0) {
          setChecks([])
          setIsLoading(false)
          return
        }

        // If manuscriptId is provided, only load checks for that manuscript
        const manuscriptIds = manuscriptId ? [manuscriptId] : []

        // If no specific manuscript, we need to get all manuscripts
        if (!manuscriptId) {
          const manuscriptsResponse = await api.manuscripts.getAll({ pagesize: 1000 })
          const manuscriptsData = manuscriptsResponse?.data || manuscriptsResponse
          if (manuscriptsData && manuscriptsData.manuscripts) {
            manuscriptIds.push(...manuscriptsData.manuscripts.map((m: any) => m.id.toString()))
          }
        }

        // Load all checks for the manuscripts
        const allMarkedChecks: ManuallyMarkedCheck[] = []

        // Fetch messages for description lookup
        let messagesData: Record<string, string> = {}
        try {
          const messages = await api.messages.getAll()
          messagesData = messages && typeof messages === 'object' && !Array.isArray(messages)
            ? messages as unknown as Record<string, string>
            : {}
        } catch (err) {
          console.warn('Failed to fetch messages for descriptions:', err)
        }

        for (const msId of manuscriptIds) {
          try {
            const [checksResponse, manuscriptResponse] = await Promise.all([
              api.checks.getByManuscriptId(msId),
              api.manuscripts.getById(msId)
            ])

            // Unwrap API responses - handle both wrapped and unwrapped responses
            const checksData = Array.isArray(checksResponse)
              ? checksResponse
              : (checksResponse?.data && Array.isArray(checksResponse.data) ? checksResponse.data : [])

            const manuscriptData = manuscriptResponse?.data || manuscriptResponse || {}

            console.log(`Processing manuscript ${msId}:`, {
              checksCount: checksData.length,
              manuscriptTitle: manuscriptData.title,
              hasFigures: !!manuscriptData.figures
            })

            // Process manuscript-level checks
            if (Array.isArray(checksData)) {
              checksData.forEach((check: any, index: number) => {
                const checkId = generateCheckId(check, msId, index)
                if (markedChecks.has(checkId)) {
                  console.log('Processing check:', {
                    id: check.id,
                    check_name: check.check_name,
                    check: check.check,
                    hasCheckName: !!check.check_name,
                    hasCheck: !!check.check
                  })
                  // Helper to safely convert to string, return undefined if object
                  const safeString = (val: any): string | undefined => {
                    if (val == null) return undefined
                    if (typeof val === 'string') return val
                    if (typeof val === 'number') return String(val)
                    if (typeof val === 'object') return undefined // Don't show objects
                    return String(val)
                  }

                  // Helper to stringify context if it's an object
                  const formatContext = (ctx: any): string | undefined => {
                    if (ctx == null) return undefined
                    if (typeof ctx === 'string') return ctx
                    if (typeof ctx === 'object') return JSON.stringify(ctx, null, 2)
                    return String(ctx)
                  }

                  const checkName = safeString(check.check_name) || safeString(check.check) || 'AI Quality Check'
                  const checkIdentifier = safeString(check.check)

                  // Get description from messages (matching ChecksTable logic)
                  const description = check.category && messagesData[check.category]
                    ? messagesData[check.category]
                    : (check.category || null)

                  allMarkedChecks.push({
                    id: checkId,
                    manuscriptId: msId,
                    manuscriptTitle: String(manuscriptData.title || 'Untitled'),
                    checkName: checkName,
                    status: String(check.status || 'pending'),
                    message: typeof check.message === 'string' ? check.message : null,
                    details: typeof check.details === 'string' ? check.details : null,
                    description: typeof description === 'string' ? description : null,
                    severity: Number(check.severity || 0),
                    location: String(formatLocation(check)),
                    figureLabel: check.location?.figure?.label ? String(check.location.figure.label) : undefined,
                    panelLabel: check.location?.panel?.label ? String(check.location.panel.label) : undefined,
                    checklist: safeString(check.checklist),
                    check: checkIdentifier,
                    context: formatContext(check.context)
                  })
                }
              })
            }

            // Process figure-level checks
            if (manuscriptData.figures) {
              manuscriptData.figures.forEach((figure: any) => {
                if (figure.check_results) {
                  figure.check_results.forEach((check: any, checkIndex: number) => {
                    const checkWithLocation = {
                      ...check,
                      location: {
                        figure: { id: figure.id, label: figure.label }
                      }
                    }
                    const checkId = generateCheckId(checkWithLocation, msId, checkIndex)
                    if (markedChecks.has(checkId)) {
                      // Helper to safely convert to string, return undefined if object
                      const safeString = (val: any): string | undefined => {
                        if (val == null) return undefined
                        if (typeof val === 'string') return val
                        if (typeof val === 'number') return String(val)
                        if (typeof val === 'object') return undefined // Don't show objects
                        return String(val)
                      }

                      // Helper to stringify context if it's an object
                      const formatContext = (ctx: any): string | undefined => {
                        if (ctx == null) return undefined
                        if (typeof ctx === 'string') return ctx
                        if (typeof ctx === 'object') return JSON.stringify(ctx, null, 2)
                        return String(ctx)
                      }

                      const checkName = safeString(check.check_name) || safeString(check.check) || 'AI Quality Check'
                      const checkIdentifier = safeString(check.check)

                      // Get description from messages (matching ChecksTable logic)
                      const description = check.category && messagesData[check.category]
                        ? messagesData[check.category]
                        : (check.category || null)

                      allMarkedChecks.push({
                        id: checkId,
                        manuscriptId: msId,
                        manuscriptTitle: String(manuscriptData.title || 'Untitled'),
                        figureLabel: String(figure.label),
                        checkName: checkName,
                        status: String(check.status || 'pending'),
                        message: typeof check.message === 'string' ? check.message : null,
                        details: typeof check.details === 'string' ? check.details : null,
                        description: typeof description === 'string' ? description : null,
                        severity: Number(check.severity || 0),
                        location: String(figure.label),
                        checklist: safeString(check.checklist),
                        check: checkIdentifier,
                        context: formatContext(check.context)
                      })
                    }
                  })
                }

                // Process panel-level checks
                if (figure.panels) {
                  figure.panels.forEach((panel: any) => {
                    if (panel.check_results) {
                      panel.check_results.forEach((check: any, checkIndex: number) => {
                        const checkWithLocation = {
                          ...check,
                          location: {
                            figure: { id: figure.id, label: figure.label },
                            panel: { id: panel.id, label: panel.label }
                          }
                        }
                        const checkId = generateCheckId(checkWithLocation, msId, checkIndex)
                        if (markedChecks.has(checkId)) {
                          // Helper to safely convert to string, return undefined if object
                          const safeString = (val: any): string | undefined => {
                            if (val == null) return undefined
                            if (typeof val === 'string') return val
                            if (typeof val === 'number') return String(val)
                            if (typeof val === 'object') return undefined // Don't show objects
                            return String(val)
                          }

                          // Helper to stringify context if it's an object
                          const formatContext = (ctx: any): string | undefined => {
                            if (ctx == null) return undefined
                            if (typeof ctx === 'string') return ctx
                            if (typeof ctx === 'object') return JSON.stringify(ctx, null, 2)
                            return String(ctx)
                          }

                          const checkName = safeString(check.check_name) || safeString(check.check) || 'AI Quality Check'
                          const checkIdentifier = safeString(check.check)

                          // Get description from messages (matching ChecksTable logic)
                          const description = check.category && messagesData[check.category]
                            ? messagesData[check.category]
                            : (check.category || null)

                          allMarkedChecks.push({
                            id: checkId,
                            manuscriptId: msId,
                            manuscriptTitle: String(manuscriptData.title || 'Untitled'),
                            figureLabel: String(figure.label),
                            panelLabel: String(panel.label),
                            checkName: checkName,
                            status: String(check.status || 'pending'),
                            message: typeof check.message === 'string' ? check.message : null,
                            details: typeof check.details === 'string' ? check.details : null,
                            description: typeof description === 'string' ? description : null,
                            severity: Number(check.severity || 0),
                            location: `${figure.label}${panel.label}`,
                            checklist: safeString(check.checklist),
                            check: checkIdentifier,
                            context: formatContext(check.context)
                          })
                        }
                      })
                    }
                  })
                }
              })
            }
          } catch (err) {
            console.error(`Failed to load checks for manuscript ${msId}:`, err)
            // Continue with other manuscripts
          }
        }

        // Sort by manuscript, then figure, then panel
        allMarkedChecks.sort((a, b) => {
          // First by manuscript title
          const manuscriptCompare = a.manuscriptTitle.localeCompare(b.manuscriptTitle)
          if (manuscriptCompare !== 0) return manuscriptCompare

          // Then by figure
          const figureA = a.figureLabel || ''
          const figureB = b.figureLabel || ''
          const figureCompare = figureA.localeCompare(figureB)
          if (figureCompare !== 0) return figureCompare

          // Finally by panel
          const panelA = a.panelLabel || ''
          const panelB = b.panelLabel || ''
          return panelA.localeCompare(panelB)
        })

        setChecks(allMarkedChecks)
      } catch (err) {
        console.error('Failed to load manually marked checks:', err)
        setError('Failed to load marked checks. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadManuallyMarkedChecks()
  }, [isOpen, manuscriptId])

  // Helper function to generate check ID (should match the one used in the checks table)
  const generateCheckId = (check: any, manuscriptId: string, index: number = 0): string => {
    // Match the format used in ChecksTable: ${manuscriptId}-${location}-${checkName}-${check.id || index}
    const location = formatLocation(check)
    const checkName = check.check || check.check_name || 'unknown'
    return `${manuscriptId}-${location}-${checkName}-${check.id || index}`
  }

  const formatLocation = (check: any): string => {
    if (check.location) {
      const { figure, panel } = check.location

      if (!figure && !panel) {
        return 'Manuscript'
      }

      if (figure?.label) {
        if (panel?.label) {
          return `${figure.label}${panel.label}`
        }
        return figure.label
      }

      return 'Manuscript'
    }

    return 'Unknown'
  }

  const getSeverityBadge = (severity: number) => {
    switch (severity) {
      case 0:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pass</Badge>
      case 1:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Warning</Badge>
      case 2:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getSeverityText = (severity: number): string => {
    switch (severity) {
      case 0: return '✅ Pass'
      case 1: return '⚠️ Warning'
      case 2: return '❌ Error'
      default: return 'Unknown'
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      // Group checks by manuscript
      const checksByManuscript = checks.reduce((acc, check) => {
        if (!acc[check.manuscriptId]) {
          acc[check.manuscriptId] = []
        }
        acc[check.manuscriptId].push(check)
        return acc
      }, {} as Record<string, ManuallyMarkedCheck[]>)

      // Generate markdown
      let markdown = '# Manually Marked AI Quality Checks\n\n'
      markdown += `Generated: ${new Date().toLocaleString()}\n`
      markdown += `Total Checks: ${checks.length}\n\n`
      markdown += '---\n\n'

      Object.entries(checksByManuscript).forEach(([msId, manuscriptChecks]) => {
        const manuscriptTitle = manuscriptChecks[0].manuscriptTitle
        markdown += `## ${manuscriptTitle}\n\n`
        markdown += `**Manuscript ID:** ${msId}\n`
        markdown += `**Number of Checks:** ${manuscriptChecks.length}\n\n`

        manuscriptChecks.forEach((check, index) => {
          markdown += `### Check ${index + 1}: ${check.location}\n\n`

          // Basic info
          markdown += `**Severity:** ${getSeverityText(check.severity)}\n`
          if (check.checklist) {
            markdown += `**Checklist:** ${check.checklist}\n`
          }
          if (check.checkName) {
            markdown += `**Check:** ${check.checkName}\n`
          }
          markdown += '\n'

          // Check Result (description) - render with context
          if (check.description) {
            const withoutPrefix = CheckUtils.removeSeverityPrefix(check.description)
            const rendered = CheckUtils.renderMessageWithContext(withoutPrefix, check.context)
            markdown += `**Check Result:**\n\n${rendered}\n\n`
          }

          // Message
          if (check.message) {
            markdown += `**Message:**\n\n${check.message}\n\n`
          }

          // Details
          if (check.details) {
            markdown += `**Details:**\n\n${check.details}\n\n`
          }

          // Context is now rendered inline in Check Result
          // Debug context removed - no longer needed

          markdown += '---\n\n'
        })
      })

      // Copy to clipboard
      await navigator.clipboard.writeText(markdown)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      alert('Failed to copy to clipboard. Please try again.')
    }
  }

  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2">
      <CheckCircle className="w-4 h-4" />
      View Manually Marked Checks ({checks.length})
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Manually Marked AI Quality Checks
            </DialogTitle>
            {checks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copySuccess ? 'Copied!' : 'Copy Report'}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          ) : checks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No manually marked checks</p>
              <p className="text-sm">Approved AI checks will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <p className="text-sm text-gray-600">
                  Showing {checks.length} manually marked check{checks.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Group checks by manuscript */}
              {Object.entries(
                checks.reduce((acc, check) => {
                  if (!acc[check.manuscriptId]) {
                    acc[check.manuscriptId] = []
                  }
                  acc[check.manuscriptId].push(check)
                  return acc
                }, {} as Record<string, ManuallyMarkedCheck[]>)
              ).map(([msId, manuscriptChecks]) => (
                <Card key={msId} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {manuscriptChecks[0].manuscriptTitle}
                      <Badge variant="secondary">{manuscriptChecks.length} checks</Badge>
                    </h3>

                    <div className="space-y-4">
                      {manuscriptChecks.map((check) => (
                        <div
                          key={check.id}
                          className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono">
                                  {check.location}
                                </Badge>
                                {getSeverityBadge(check.severity)}
                                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approved
                                </Badge>
                              </div>

                              {check.checklist && (
                                <div className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Checklist:</span> {check.checklist}
                                </div>
                              )}

                              {check.checkName && (
                                <div className="text-sm font-medium mb-2">
                                  <span className="font-medium">Check:</span> {check.checkName}
                                </div>
                              )}

                              {check.description && typeof check.description === 'string' && (
                                <div className="text-sm text-gray-700 mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                  <span className="font-medium">Check Result:</span>
                                  <div className="mt-1">
                                    {(() => {
                                      // Remove severity prefix and render with context
                                      const withoutPrefix = CheckUtils.removeSeverityPrefix(check.description)
                                      return CheckUtils.renderMessageWithContext(withoutPrefix, check.context)
                                    })()}
                                  </div>
                                </div>
                              )}

                              {check.message && typeof check.message === 'string' && (
                                <div className="prose prose-sm max-w-none">
                                  <div className="text-sm text-gray-700">
                                    <span className="font-medium">Message:</span>
                                    <div className="mt-1 pl-4 border-l-2 border-gray-300">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {check.message}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {check.details && typeof check.details === 'string' && (
                                <div className="prose prose-sm max-w-none mt-3">
                                  <div className="text-sm text-gray-700">
                                    <span className="font-medium">Details:</span>
                                    <div className="mt-1 pl-4 border-l-2 border-blue-300 bg-blue-50 rounded p-2">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {check.details}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Context is now rendered inline in Check Result */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
