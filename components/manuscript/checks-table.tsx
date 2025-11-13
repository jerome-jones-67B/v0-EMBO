"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { SeverityIcon } from "@/components/ui/severity-icon"
import { Eye, Download, AlertTriangle, CheckCircle, XCircle, Clock, X, Copy, ArrowUpDown, Search, Filter, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { api } from '@/lib/api-client'
import { ManuallyMarkedChecksModal } from './manually-marked-checks-modal'

/**
 * Represents a single validation or AI check item
 */
interface CheckItem {
  id: string
  location: string
  validation_result: string
  status: 'pass' | 'fail' | 'warning' | 'pending'
  category: string
  originalCategory?: string
  description?: string
  file_id?: number
  figure_id?: number
  panel_id?: number
  severity?: number
  checklist?: string
  check?: string
  context?: string
}

/**
 * Represents a grouped validation result for a figure
 */
interface ValidationResultGroup {
  resultText: string
  panels: string[]
  checks: CheckItem[]
}

/**
 * Represents a figure group with all its validation results
 */
interface FigureGroup {
  location: string
  validationResults: ValidationResultGroup[]
  checks: CheckItem[]
  panels: string[]
  fullLocations: string[]
}

/**
 * Props for the ChecksTable component
 */
interface ChecksTableProps {
  manuscriptId: string
  type: 'validation' | 'ai-checks'
}

/**
 * Utility functions for checks processing
 */
const ChecksUtils = {
  /**
   * Maps severity number to status string
   */
  mapSeverityToStatus: (severity: number): 'pass' | 'fail' | 'warning' | 'pending' => {
    switch (severity) {
      case 0:
        return 'pass' // Info level
      case 1:
        return 'warning'
      case 2:
        return 'fail'
      default:
        return 'pending'
    }
  },

  /**
   * Renders a message with context by replacing template placeholders
   */
  renderMessageWithContext: (description: string, context: any): string => {
    if (!description || !context) return description || ''

    let result = description

    // Replace template placeholders like {{ caption }}, {{ title }}, etc.
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/g
    result = result.replace(placeholderRegex, (match, key) => {
      // Try to get the value from context
      if (context && typeof context === 'object' && key in context) {
        return context[key] || match
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
  },

  /**
   * Transforms validation message to use collective/plural form when multiple panels share the same result
   */
  makeCollectiveMessage: (message: string, panelCount: number, panelLabels: string[]): string => {
    if (!message || panelCount <= 1) return message

    // Transform singular to plural and add panel list
    const transformations: Array<{pattern: RegExp, replacement: string}> = [
      // "The label of this panel is valid" -> "The labels of these N panels are valid: A-N"
      {
        pattern: /^The label of this panel is (valid|invalid)/i,
        replacement: `The labels of these ${panelCount} panels are $1: ${panelLabels.join(', ')}`
      },
      // "Panel label is valid" -> "Panel labels are valid: A-N"
      {
        pattern: /^Panel label is (valid|invalid)/i,
        replacement: `Panel labels are $1: ${panelLabels.join(', ')}`
      },
      // "This panel's label is valid" -> "These N panels' labels are valid: A-N"
      {
        pattern: /^This panel'?s? label is (valid|invalid)/i,
        replacement: `These ${panelCount} panels' labels are $1: ${panelLabels.join(', ')}`
      },
      // Generic: "The X of this panel" -> "The X of these N panels"
      {
        pattern: /\bthis panel\b/gi,
        replacement: `these ${panelCount} panels`
      },
      // Generic: "panel is" -> "panels are"
      {
        pattern: /\bpanel is\b/gi,
        replacement: 'panels are'
      },
      // Generic: "panel has" -> "panels have"
      {
        pattern: /\bpanel has\b/gi,
        replacement: 'panels have'
      },
    ]

    let result = message
    for (const {pattern, replacement} of transformations) {
      if (pattern.test(result)) {
        result = result.replace(pattern, replacement)
        break // Only apply first matching transformation
      }
    }

    // If no transformation matched but we have multiple panels, append the panel list
    if (result === message && panelCount > 1) {
      result = `${result} (Panels: ${panelLabels.join(', ')})`
    }

    return result
  },

  /**
   * Enriches validation message with specific context (e.g., link URL, panel label)
   */
  enrichValidationMessage: (message: string, checks: CheckItem[]): string => {
    if (!message || !checks || checks.length === 0) return message

    const firstCheck = checks[0]

    // For link validation messages, include the actual link
    if (message.toLowerCase().includes('link') && firstCheck.context) {
      try {
        const context = typeof firstCheck.context === 'string'
          ? JSON.parse(firstCheck.context)
          : firstCheck.context

        // Try multiple possible field names for the link URL
        const linkUrl = context.url || context.uri || context.link || context.href ||
                       context.link_url || context.target_url

        if (linkUrl && typeof linkUrl === 'string') {
          // Extract just the domain/path for readability
          const displayUrl = linkUrl.length > 50
            ? linkUrl.substring(0, 47) + '...'
            : linkUrl

          // Replace generic "Link" or "Link URL" with specific link
          // Use word boundaries to avoid replacing "Link" in "Linking"
          let enriched = message

          // First try to replace "Link URL" as a phrase
          if (/\bLink URL\b/i.test(enriched)) {
            enriched = enriched.replace(/\bLink URL\b/gi, `Link "${displayUrl}"`)
          }
          // Then try to replace standalone "Link" at the beginning
          else if (/^Link\b/i.test(enriched)) {
            enriched = enriched.replace(/^Link\b/i, `Link "${displayUrl}"`)
          }
          // Finally, try to insert link after any "Link" mention
          else if (/\bLink\b/i.test(enriched)) {
            enriched = enriched.replace(/\bLink\b/i, `Link "${displayUrl}"`)
          }

          return enriched
        }
      } catch (e) {
        // If context parsing fails, return original message
        console.debug('Failed to parse validation context:', e)
      }
    }

    return message
  },

  /**
   * Formats location string from check data
   */
  formatLocation: (check: any): string => {
    if (check.location) {
      const { figure, panel } = check.location

      if (!figure && !panel) {
        return 'Manuscript'
      }

      if (figure?.label) {
        if (panel?.label) {
          return `${figure.label}${panel.label}`
        } else {
          return figure.label
        }
      }

      return 'Manuscript'
    }

    return ''
  },

  /**
   * Extracts figure name from location string
   */
  extractFigureName: (location: string): string => {
    const figureMatch = location.match(/^(Figure \d+)/)
    return figureMatch ? figureMatch[1] : location
  },

  /**
   * Extracts panel letter from location string
   */
  extractPanelLetter: (location: string): string | null => {
    const panelMatch = location.match(/Figure \d+([A-Z])/)
    return panelMatch ? panelMatch[1] : null
  },

  /**
   * Gets status icon component
   */
  getStatusIcon: (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }
}

export function ChecksTable({ manuscriptId, type }: ChecksTableProps) {
  const [checks, setChecks] = useState<CheckItem[]>([])
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [manuscriptData, setManuscriptData] = useState<any>(null)
  const [selectedChecks, setSelectedChecks] = useState<Set<string>>(new Set())
  const [readChecks, setReadChecks] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string[]>([])
  const [checklistFilter, setChecklistFilter] = useState<string[]>([])
  const [checkFilter, setCheckFilter] = useState<string[]>([])
  const [checkResultFilter, setCheckResultFilter] = useState<string[]>([])
  const [sortField, setSortField] = useState<string>('location')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Load persisted selections from localStorage on mount
  useEffect(() => {
    try {
      // Use versioned key to avoid conflicts with old format
      const version = 'v2'
      const storageKey = `manuallyMarkedAIChecks_${version}`
      const markedChecksJson = localStorage.getItem(storageKey)

      if (markedChecksJson) {
        const markedChecks = new Set<string>(JSON.parse(markedChecksJson))
        setSelectedChecks(markedChecks)
      }

      // Clean up old format data
      const oldKey = 'manuallyMarkedAIChecks'
      if (localStorage.getItem(oldKey)) {
        console.log('Migrating to new check ID format - previous selections cleared')
        localStorage.removeItem(oldKey)
      }
    } catch (error) {
      console.error('Failed to load persisted marked checks:', error)
    }
  }, [])

  // Load persisted read checks from localStorage on mount
  useEffect(() => {
    try {
      const storageKey = `readChecks_${manuscriptId}_${type}`
      const readChecksJson = localStorage.getItem(storageKey)

      if (readChecksJson) {
        const readChecksArray = JSON.parse(readChecksJson)
        setReadChecks(new Set(readChecksArray))
      }
    } catch (error) {
      console.error('Failed to load persisted read checks:', error)
    }
  }, [manuscriptId, type])

  useEffect(() => {
    const fetchChecksAndMessages = async () => {
      if (!manuscriptId) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch checks/validation, messages, and manuscript data in parallel
        const [checksData, messagesData, manuscriptResponse] = await Promise.all([
          type === 'validation'
            ? api.validation.getByManuscriptId(manuscriptId)
            : api.checks.getByManuscriptId(manuscriptId),
          api.messages.getAll(),
          api.manuscripts.getById(manuscriptId)
        ])

        setManuscriptData(manuscriptResponse)
        setMessages(messagesData && typeof messagesData === 'object' && !Array.isArray(messagesData) ? messagesData as unknown as Record<string, string> : {})

        // Transform the API response to our expected format
        const transformedChecks = Array.isArray(checksData) ? checksData.map((check: any, index: number) => {
          // Map severity to status
          const status = ChecksUtils.mapSeverityToStatus(check.severity)

          // Get description from messages using category as key
          const description = messagesData && typeof messagesData === 'object' && !Array.isArray(messagesData)
            ? (messagesData as unknown as Record<string, string>)[check.category] || check.category || ''
            : check.category || ''

          // Create a unique ID that includes location and check name for uniqueness
          const location = ChecksUtils.formatLocation(check)
          const checkName = check.check || check.check_name || 'unknown'
          const uniqueId = `${manuscriptId}-${location}-${checkName}-${check.id || index}`

          return {
            id: uniqueId,
            location: location,
            validation_result: check.check || 'No result available',
            status: status,
            category: check.category || 'General',
            description: description,
            severity: check.severity,
            checklist: check.checklist,
            check: check.check,
            context: check.context,
            file_id: check.file_id,
            figure_id: check.location?.figure?.id,
            panel_id: check.location?.panel?.id
          }
        }) : []

        setChecks(transformedChecks)
              } catch (err) {
        console.error(`❌ Failed to fetch ${type} data:`, err)
        setError(`Failed to load ${type} data. Please try again.`)

        setMessages({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchChecksAndMessages()
  }, [manuscriptId, type])



  const markCheckAsRead = (checkId: string) => {
    setReadChecks(prev => {
      const newSet = new Set(prev)
      newSet.add(checkId)

      // Persist to localStorage
      try {
        const storageKey = `readChecks_${manuscriptId}_${type}`
        localStorage.setItem(storageKey, JSON.stringify(Array.from(newSet)))
      } catch (error) {
        console.error('Failed to persist read checks:', error)
      }

      return newSet
    })
  }

  const handlePreview = async (check: CheckItem, relatedChecks?: CheckItem[]) => {
    if (!manuscriptData || !check.figure_id) {
      console.log('No manuscript data or figure ID available for preview')
      return
    }

    // Mark the check as read (and any related checks for grouped validation results)
    markCheckAsRead(check.id)
    if (relatedChecks && relatedChecks.length > 0) {
      relatedChecks.forEach(relatedCheck => markCheckAsRead(relatedCheck.id))
    }

    setIsPreviewLoading(true)
    setPreviewImage(null)

    try {
      // Find the figure in manuscript data to get the image_file_id
      const figure = manuscriptData.figures?.find((f: any) => f.id === check.figure_id)
      if (!figure || !figure.image_file_id) {
        console.log('No image file ID found for figure:', check.figure_id)
        return
      }

      // Get the preview image
      const blob = await api.files.getPreview(manuscriptId, figure.image_file_id.toString())
      const imageUrl = URL.createObjectURL(blob)
      setPreviewImage(imageUrl)
    } catch (error) {
      console.error('Failed to load preview:', error)
    } finally {
      setIsPreviewLoading(false)
    }
  }


  const handleCheckboxChange = (checkId: string, checked: boolean) => {
    setSelectedChecks(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(checkId)
      } else {
        newSet.delete(checkId)
      }

      // Persist to localStorage for the manually marked checks modal
      try {
        // Use versioned key to match the load logic
        const version = 'v2'
        const storageKey = `manuallyMarkedAIChecks_${version}`

        // Get existing marked checks from localStorage
        const existingMarkedChecksJson = localStorage.getItem(storageKey)
        const existingMarkedChecks: Set<string> = existingMarkedChecksJson
          ? new Set(JSON.parse(existingMarkedChecksJson))
          : new Set()

        // Update the persisted set
        if (checked) {
          existingMarkedChecks.add(checkId)
        } else {
          existingMarkedChecks.delete(checkId)
        }

        // Save back to localStorage
        localStorage.setItem(storageKey, JSON.stringify(Array.from(existingMarkedChecks)))
      } catch (error) {
        console.error('Failed to persist marked checks:', error)
      }

      return newSet
    })
  }

  const handleCopySelected = () => {
    if (selectedChecks.size === 0) {
      alert('No checks selected')
      return
    }

    const selectedCheckData = checks
      .filter(check => selectedChecks.has(check.id))
      .map(check => ({
        location: check.location,
        message: check.description || check.validation_result,
        checklist: check.checklist,
        check: check.check,
        severity: check.severity
      }))

    const copyText = selectedCheckData
      .map(item => `Location: ${item.location}\nMessage: ${item.message}\nChecklist: ${item.checklist}\nCheck: ${item.check}\nSeverity: ${item.severity}\n---`)
      .join('\n\n')

    navigator.clipboard.writeText(copyText).then(() => {
      alert(`Copied ${selectedCheckData.length} selected checks to clipboard`)
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err)
      alert('Failed to copy to clipboard')
    })
  }

  /**
   * Filters checks based on search term, severity, and location filters
   */
  const filterChecks = (checks: CheckItem[]): CheckItem[] => {
    return checks.filter(check => {
      // Exclude severity 0 (pass) items - show only severity 1 and above
      if (check.severity === 0) {
        return false
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          check.location.toLowerCase().includes(searchLower) ||
          check.checklist?.toLowerCase().includes(searchLower) ||
          check.check?.toLowerCase().includes(searchLower) ||
          check.description?.toLowerCase().includes(searchLower) ||
          check.validation_result.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Severity filter
      if (severityFilter !== 'all') {
        const severityNum = parseInt(severityFilter)
        if (check.severity !== severityNum) return false
      }

      // Location filter (for both validation and ai-checks)
      if (locationFilter.length > 0) {
        // For AI checks, match exact location; for validation, match figure name
        if (type === 'ai-checks') {
          if (!locationFilter.includes(check.location)) return false
        } else {
          const figureName = ChecksUtils.extractFigureName(check.location)
          if (!locationFilter.includes(figureName)) return false
        }
      }

      // Checklist filter for ai-checks type
      if (type === 'ai-checks' && checklistFilter.length > 0) {
        const checklistValue = check.checklist || 'N/A'
        if (!checklistFilter.includes(checklistValue)) return false
      }

      // Check filter for ai-checks type
      if (type === 'ai-checks' && checkFilter.length > 0) {
        const checkValue = check.check || 'N/A'
        if (!checkFilter.includes(checkValue)) return false
      }

      // Check result filter for ai-checks type
      if (type === 'ai-checks' && checkResultFilter.length > 0) {
        const resultValue = check.description || check.validation_result
        if (!checkResultFilter.includes(resultValue)) return false
      }

      return true
    })
  }

  // Filter and sort checks
  const filteredAndSortedChecks = useMemo(() => {
    const filtered = filterChecks(checks)

  /**
   * Groups validation checks by figure and validation result type
   */
  const groupValidationChecks = (filtered: CheckItem[]): FigureGroup[] => {
    // First group by figure name only
    const figureGroups = filtered.reduce((acc, check) => {
      // Additional defensive check: exclude severity 0 items for validation
      if (check.severity === 0) {
        return acc
      }

      const figureName = ChecksUtils.extractFigureName(check.location)
      const panelLetter = ChecksUtils.extractPanelLetter(check.location)

      if (!acc[figureName]) {
        acc[figureName] = {
          figureName,
          checks: [],
          panels: new Set<string>(),
          fullLocations: new Set<string>(),
          validationResults: new Map<string, {
            resultText: string
            panels: Set<string>
            checks: CheckItem[]
          }>()
        }
      }

      acc[figureName].checks.push(check)
      acc[figureName].fullLocations.add(check.location)

      if (panelLetter) {
        acc[figureName].panels.add(panelLetter)
      }

      // Group by validation result type within the figure
      const resultKey = check.description || check.validation_result || 'Unknown'
      if (!acc[figureName].validationResults.has(resultKey)) {
        acc[figureName].validationResults.set(resultKey, {
          resultText: resultKey,
          panels: new Set<string>(),
          checks: []
        })
      }

      const resultGroup = acc[figureName].validationResults.get(resultKey)!
      // Additional defensive check: only add non-severity 0 checks
      if (check.severity !== 0) {
        resultGroup.checks.push(check)
        if (panelLetter) {
          resultGroup.panels.add(panelLetter)
        }
      }

      return acc
    }, {} as Record<string, {
      figureName: string
      checks: CheckItem[]
      panels: Set<string>
      fullLocations: Set<string>
      validationResults: Map<string, {
        resultText: string
        panels: Set<string>
        checks: CheckItem[]
      }>
    }>)

    // Convert to final result format
    const result: FigureGroup[] = []

    Object.entries(figureGroups).forEach(([figureName, group]) => {
      // Convert validation results map to array, filtering out empty groups
      const validationResults = Array.from(group.validationResults.entries())
        .filter(([resultKey, resultGroup]) => resultGroup.checks.length > 0) // Only include groups with checks
        .map(([resultKey, resultGroup]) => ({
          resultText: resultGroup.resultText,
          panels: Array.from(resultGroup.panels).sort(),
          checks: resultGroup.checks.sort((a, b) => (b.severity || 0) - (a.severity || 0))
        }))

      // Only add figures that have validation results
      if (validationResults.length > 0) {
        result.push({
          location: figureName,
          validationResults: validationResults.sort((a, b) => (b.checks[0]?.severity || 0) - (a.checks[0]?.severity || 0)),
          checks: group.checks.sort((a, b) => (b.severity || 0) - (a.severity || 0)),
          panels: Array.from(group.panels).sort(),
          fullLocations: Array.from(group.fullLocations).sort()
        })
      }
    })

    return result
  }

  /**
   * Sorts validation results by the specified field
   */
  const sortValidationResults = (results: FigureGroup[]): FigureGroup[] => {
    return results.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'location':
          aValue = a.location
          bValue = b.location
          break
        case 'result':
          // For validation, sort by the first validation result text
          aValue = a.validationResults[0]?.resultText || ''
          bValue = b.validationResults[0]?.resultText || ''
          break
        case 'severity':
          // For validation, sort by the highest severity in the group
          aValue = Math.max(...a.checks.map(check => check.severity || 0))
          bValue = Math.max(...b.checks.map(check => check.severity || 0))
          break
        default:
          aValue = a.location
          bValue = b.location
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      return 0
    })
  }

    // Group by location for validation type
    if (type === 'validation') {
      const groupedResults = groupValidationChecks(filtered)
      return sortValidationResults(groupedResults)
    }

    // Sort checks for other types
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'location':
          aValue = a.location
          bValue = b.location
          break
        case 'checklist':
          aValue = a.checklist || ''
          bValue = b.checklist || ''
          break
        case 'check':
          aValue = a.check || ''
          bValue = b.check || ''
          break
        case 'severity':
          aValue = a.severity || 0
          bValue = b.severity || 0
          break
        case 'result':
          aValue = a.description || a.validation_result
          bValue = b.description || b.validation_result
          break
        default:
          aValue = a.location
          bValue = b.location
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      return 0
    })

    return filtered
  }, [checks, searchTerm, severityFilter, locationFilter, checklistFilter, checkFilter, checkResultFilter, sortField, sortDirection, type])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  /**
   * Get all available locations for filtering
   */
  const getAvailableLocations = (): string[] => {
    const locations = new Set<string>()
    checks.forEach(check => {
      if (check.severity !== 0) { // Only include non-severity 0 items
        if (type === 'ai-checks') {
          // For AI checks, use exact location
          locations.add(check.location)
        } else {
          // For validation, use figure name only
          const figureName = ChecksUtils.extractFigureName(check.location)
          locations.add(figureName)
        }
      }
    })
    return Array.from(locations).sort()
  }

  /**
   * Get all available checklists for filtering
   */
  const getAvailableChecklists = (): string[] => {
    if (type !== 'ai-checks') return []

    const checklists = new Set<string>()
    checks.forEach(check => {
      // Only include severity 1 and above
      if (check.severity !== 0) {
        checklists.add(check.checklist || 'N/A')
      }
    })
    return Array.from(checklists).sort()
  }

  /**
   * Get all available checks for filtering
   */
  const getAvailableChecks = (): string[] => {
    if (type !== 'ai-checks') return []

    const checkValues = new Set<string>()
    checks.forEach(check => {
      // Only include severity 1 and above
      if (check.severity !== 0) {
        checkValues.add(check.check || 'N/A')
      }
    })
    return Array.from(checkValues).sort()
  }

  /**
   * Get all available check results for filtering
   */
  const getAvailableCheckResults = (): string[] => {
    if (type !== 'ai-checks') return []

    const results = new Set<string>()
    checks.forEach(check => {
      // Only include severity 1 and above
      if (check.severity !== 0) {
        const resultValue = check.description || check.validation_result
        results.add(resultValue)
      }
    })
    return Array.from(results).sort()
  }

  const handleLocationFilterChange = (location: string, checked: boolean) => {
    setLocationFilter(prev => {
      if (checked) {
        return [...prev, location]
      } else {
        return prev.filter(l => l !== location)
      }
    })
  }

  const handleChecklistFilterChange = (checklist: string, checked: boolean) => {
    setChecklistFilter(prev => {
      if (checked) {
        return [...prev, checklist]
      } else {
        return prev.filter(c => c !== checklist)
      }
    })
  }

  const handleCheckFilterChange = (checkValue: string, checked: boolean) => {
    setCheckFilter(prev => {
      if (checked) {
        return [...prev, checkValue]
      } else {
        return prev.filter(c => c !== checkValue)
      }
    })
  }

  const handleCheckResultFilterChange = (result: string, checked: boolean) => {
    setCheckResultFilter(prev => {
      if (checked) {
        return [...prev, result]
      } else {
        return prev.filter(r => r !== result)
      }
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2">Loading {type} data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Count only checks with severity 1 and above
  const visibleChecksCount = checks.filter(check => check.severity !== 0).length

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {type === 'validation' ? 'Validation Checks' : 'AI Quality Checks'}
              <Badge variant="outline">{visibleChecksCount} checks</Badge>
            </div>
            <div className="flex items-center gap-2">
              {type === 'ai-checks' && (
                <ManuallyMarkedChecksModal
                  manuscriptId={manuscriptId}
                  trigger={
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      View AI report
                    </Button>
                  }
                />
              )}
              {type === 'ai-checks' && selectedChecks.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySelected}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Selected ({selectedChecks.size})
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {type} data available for this manuscript.
            </div>
          ) : (
            <>
              {type === 'ai-checks' && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search checks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('location')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Location
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                        <Select>
                          <SelectTrigger className="h-8 w-8 p-0">
                            <Filter className="h-4 w-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <div className="text-sm font-medium mb-2">Filter by Location</div>
                              <div className="space-y-1 max-h-60 overflow-y-auto">
                                {getAvailableLocations().map((location) => (
                                  <div key={location} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`location-${location}`}
                                      checked={locationFilter.includes(location)}
                                      onCheckedChange={(checked) =>
                                        handleLocationFilterChange(location, checked as boolean)
                                      }
                                    />
                                    <label
                                      htmlFor={`location-${location}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {location}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              {locationFilter.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setLocationFilter([])}
                                    className="h-6 text-xs"
                                  >
                                    Clear All
                                  </Button>
                                </div>
                              )}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                    {type === 'ai-checks' && (
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('checklist')}
                            className="h-8 px-2 lg:px-3"
                          >
                            Checklist
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                          <Select>
                            <SelectTrigger className="h-8 w-8 p-0">
                              <Filter className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2">
                                <div className="text-sm font-medium mb-2">Filter by Checklist</div>
                                <div className="space-y-1 max-h-60 overflow-y-auto">
                                  {getAvailableChecklists().map((checklist) => (
                                    <div key={checklist} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`checklist-${checklist}`}
                                        checked={checklistFilter.includes(checklist)}
                                        onCheckedChange={(checked) =>
                                          handleChecklistFilterChange(checklist, checked as boolean)
                                        }
                                      />
                                      <label
                                        htmlFor={`checklist-${checklist}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {checklist}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                                {checklistFilter.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setChecklistFilter([])}
                                      className="h-6 text-xs"
                                    >
                                      Clear All
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                    )}
                    {type === 'ai-checks' && (
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('check')}
                            className="h-8 px-2 lg:px-3"
                          >
                            Check
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                          <Select>
                            <SelectTrigger className="h-8 w-8 p-0">
                              <Filter className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2">
                                <div className="text-sm font-medium mb-2">Filter by Check</div>
                                <div className="space-y-1 max-h-60 overflow-y-auto">
                                  {getAvailableChecks().map((check) => (
                                    <div key={check} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`check-${check}`}
                                        checked={checkFilter.includes(check)}
                                        onCheckedChange={(checked) =>
                                          handleCheckFilterChange(check, checked as boolean)
                                        }
                                      />
                                      <label
                                        htmlFor={`check-${check}`}
                                        className="text-sm font-normal cursor-pointer"
                                      >
                                        {check}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                                {checkFilter.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setCheckFilter([])}
                                      className="h-6 text-xs"
                                    >
                                      Clear All
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                    )}
                    {type === 'ai-checks' && (
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('severity')}
                            className="h-8 px-2 lg:px-3"
                          >
                            Severity
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                          <Select value={severityFilter} onValueChange={setSeverityFilter}>
                            <SelectTrigger className="h-8 w-8 p-0">
                              <Filter className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2">
                                <div className="text-sm font-medium mb-2">Filter by Severity</div>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="severity-all"
                                      checked={severityFilter === 'all'}
                                      onCheckedChange={() => setSeverityFilter('all')}
                                    />
                                    <label htmlFor="severity-all" className="text-sm font-normal cursor-pointer">
                                      All Severities
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="severity-1"
                                      checked={severityFilter === '1'}
                                      onCheckedChange={(checked) => setSeverityFilter(checked ? '1' : 'all')}
                                    />
                                    <label htmlFor="severity-1" className="text-sm font-normal cursor-pointer">
                                      Warning
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="severity-2"
                                      checked={severityFilter === '2'}
                                      onCheckedChange={(checked) => setSeverityFilter(checked ? '2' : 'all')}
                                    />
                                    <label htmlFor="severity-2" className="text-sm font-normal cursor-pointer">
                                      Fail
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                    )}
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('result')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Check Result
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                        {type === 'ai-checks' && (
                          <Select>
                            <SelectTrigger className="h-8 w-8 p-0">
                              <Filter className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2">
                                <div className="text-sm font-medium mb-2">Filter by Result</div>
                                <div className="space-y-1 max-h-60 overflow-y-auto">
                                  {getAvailableCheckResults().map((result) => (
                                    <div key={result} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`result-${result}`}
                                        checked={checkResultFilter.includes(result)}
                                        onCheckedChange={(checked) =>
                                          handleCheckResultFilterChange(result, checked as boolean)
                                        }
                                      />
                                      <label
                                        htmlFor={`result-${result}`}
                                        className="text-sm font-normal cursor-pointer max-w-xs truncate"
                                        title={result}
                                      >
                                        {result}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                                {checkResultFilter.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setCheckResultFilter([])}
                                      className="h-6 text-xs"
                                    >
                                      Clear All
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    {type === 'ai-checks' && (
                      <TableHead className="text-center">
                        Follow-up
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {type === 'validation' ? (
                    // Render grouped validation results - one row per figure with all validation results
                    (filteredAndSortedChecks as Array<{location: string, validationResults: Array<{resultText: string, panels: string[], checks: CheckItem[]}>, checks: CheckItem[], panels: string[], fullLocations: string[]}>).map((group) => {
                      // Get the first check with a figure_id for preview
                      const previewCheck = group.checks.find(check => check.figure_id)
                      // Check if any check in the group is unread
                      const isUnread = group.checks.some(check => !readChecks.has(check.id))
                      const textClass = isUnread ? 'font-bold' : 'font-normal'
                      // Check if any check in the group is selected for follow-up
                      const isSelected = group.checks.some(check => selectedChecks.has(check.id))
                      const rowClass = isSelected ? 'bg-gray-100' : ''

                      return (
                        <TableRow key={group.location} className={rowClass}>
                          <TableCell className={textClass}>
                            {group.location}
                          </TableCell>
                          <TableCell className={textClass}>
                            <div className="space-y-2">
                              {group.validationResults.map((validationResult, index) => {
                                // Transform message to collective form if multiple panels
                                let displayMessage = validationResult.resultText
                                if (validationResult.panels.length > 1) {
                                  displayMessage = ChecksUtils.makeCollectiveMessage(
                                    displayMessage,
                                    validationResult.panels.length,
                                    validationResult.panels
                                  )
                                }
                                // Enrich message with context (e.g., link URLs)
                                displayMessage = ChecksUtils.enrichValidationMessage(
                                  displayMessage,
                                  validationResult.checks
                                )

                                return (
                                  <div key={index} className="flex items-center gap-2">
                                    {ChecksUtils.getStatusIcon(validationResult.checks[0]?.status || 'pending')}
                                    <span className="text-sm">
                                      {displayMessage}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => previewCheck && handlePreview(previewCheck, group.checks)}
                                    className="h-8 w-8 p-0"
                                    disabled={!previewCheck?.figure_id}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Preview - {group.location}</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex items-center justify-center p-4">
                                    {isPreviewLoading ? (
                                      <div className="flex items-center gap-2">
                                        <LoadingSpinner />
                                        <span>Loading preview...</span>
                                      </div>
                                    ) : previewImage ? (
                                      <img
                                        src={previewImage}
                                        alt={`Preview of ${group.location}`}
                                        className="max-w-full max-h-[70vh] object-contain"
                                      />
                                    ) : (
                                      <div className="text-muted-foreground">
                                        No preview available
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    // Render regular AI checks
                    (filteredAndSortedChecks as CheckItem[]).map((check) => {
                      const isUnread = !readChecks.has(check.id)
                      const textClass = isUnread ? 'font-bold' : 'font-normal'
                      const isSelected = selectedChecks.has(check.id)
                      const rowClass = isSelected ? 'bg-gray-100' : ''

                      return (
                        <TableRow key={check.id} className={rowClass}>
                          <TableCell className={textClass}>
                            {check.location}
                          </TableCell>
                          {type === 'ai-checks' && (
                            <TableCell className={textClass}>
                              {check.checklist || 'N/A'}
                            </TableCell>
                          )}
                          {type === 'ai-checks' && (
                            <TableCell className={textClass}>
                              {check.check || 'N/A'}
                            </TableCell>
                          )}
                          {type === 'ai-checks' && (
                            <TableCell className={textClass}>
                              <div className="flex items-center justify-center">
                                <SeverityIcon severity={check.severity || 0} size="md" />
                              </div>
                            </TableCell>
                          )}
                          <TableCell className={textClass}>
                            {(() => {
                              const rawDescription = check.description || check.validation_result
                              // Remove severity prefix
                              const withoutPrefix = ChecksUtils.removeSeverityPrefix(rawDescription)
                              // Render with context
                              return ChecksUtils.renderMessageWithContext(withoutPrefix, check.context)
                            })()}
                          </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePreview(check)}
                                  className="h-8 w-8 p-0"
                                  disabled={!check.figure_id}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Preview - {check.location}</DialogTitle>
                                </DialogHeader>
                                <div className="flex items-center justify-center p-4">
                                  {isPreviewLoading ? (
                                    <div className="flex items-center gap-2">
                                      <LoadingSpinner />
                                      <span>Loading preview...</span>
                                    </div>
                                  ) : previewImage ? (
                                    <img
                                      src={previewImage}
                                      alt={`Preview of ${check.location}`}
                                      className="max-w-full max-h-[70vh] object-contain"
                                    />
                                  ) : (
                                    <div className="text-muted-foreground">
                                      No preview available
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                        {type === 'ai-checks' && (
                          <TableCell className="text-center p-2">
                            <div className="flex items-center justify-center min-h-[32px]">
                              <Checkbox
                                checked={selectedChecks.has(check.id)}
                                onCheckedChange={(checked) => handleCheckboxChange(check.id, checked as boolean)}
                                className="h-5 w-5 border-2 border-gray-400 hover:border-gray-600 focus:border-blue-500"
                              />
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            </>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
