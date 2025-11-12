"use client"

/**
 * FigureList Component with Lazy Loading
 *
 * This component implements lazy loading for file previews using the Intersection Observer API.
 * Key features:
 * - Previews are only fetched when file items become visible on screen
 * - 100px rootMargin ensures smooth loading before elements come into view
 * - Debounced intersection detection prevents rapid toggling
 * - Optimized re-renders with useMemo and useCallback
 * - Memory management with proper cleanup of object URLs
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, FileText, Image, AlertCircle, CheckCircle, X, Search, File, Plus, ChevronDown, ChevronUp, ExternalLink, Link as LinkIcon } from "lucide-react"
import { buildApiUrl, config } from '@/lib/config'
import { api } from '@/lib/api-client'
import type { ManuscriptDetailData } from '@/types/manuscript-detail'
import type { ManuscriptFileDetails, FileDetails, LinkDetails, LinkCreate } from '@/lib/types'

// Custom hook for intersection observer with debouncing
function useIntersectionObserver(
  elementRef: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Debounce the intersection changes to prevent rapid toggling
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          setIsIntersecting(entry.isIntersecting)
        }, 100) // 100ms debounce
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '100px', // Start loading 100px before the element comes into view
        ...options
      }
    )

    observer.observe(element)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      observer.unobserve(element)
    }
  }, [elementRef, options])

  return isIntersecting
}

interface FigureListProps {
  manuscript: ManuscriptDetailData
  sourceFiles?: ManuscriptFileDetails[]
  onFileAssignment?: (fileId: number, figureId?: number, panelId?: number) => void
  onFileRemoval?: (fileId: number, figureId?: number, panelId?: number) => void
}

interface FileWithPreview {
  id: number
  filename: string
  content_type: string
  size: number
  previewUrl?: string
  isImage?: boolean
  source?: string
  fullPath?: string
}

export function FigureList({ manuscript, sourceFiles = [], onFileAssignment, onFileRemoval }: FigureListProps) {
  const [manuscriptFiles, setManuscriptFiles] = useState<FileWithPreview[]>([])
  const [figureFiles, setFigureFiles] = useState<Map<number, FileWithPreview[]>>(new Map())
  const [panelFiles, setPanelFiles] = useState<Map<string, FileWithPreview[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [showSourceFileDialog, setShowSourceFileDialog] = useState(false)
  const [mappingTarget, setMappingTarget] = useState<{ figureId?: number, panelId?: number } | null>(null)
  const [mapping, setMapping] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSourceFile, setSelectedSourceFile] = useState<ManuscriptFileDetails | null>(null)
  const [figurePreviews, setFigurePreviews] = useState<Map<number, string>>(new Map())
  const [loadingPreviews, setLoadingPreviews] = useState(false)
  const [zoomedPanel, setZoomedPanel] = useState<{ figureId: number; panelId: number; panel: any } | null>(null)
  const [collapsedFigurePanels, setCollapsedFigurePanels] = useState<Set<number>>(new Set())

  // Link management state
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkTarget, setLinkTarget] = useState<{ figureId?: number, panelId?: number } | null>(null)
  const [linkFormData, setLinkFormData] = useState<LinkCreate>({ name: '', uri: '', identifier: null, database: null })
  const [linkTabValue, setLinkTabValue] = useState<'structured' | 'freeform'>('structured')
  const [selectedDatabase, setSelectedDatabase] = useState<string>('')

  // Known identifier types for structured links
  const knownDatabases = [
    'DOI', 'PubMed', 'PubMed Central', 'Zenodo', 'Dryad', 'FigShare',
    'BioStudies', 'ArrayExpress', 'Gene Expression Omnibus (GEO)', 'PRIDE',
    'ProteomeXchange', 'MetaboLights', 'European Nucleotide Archive (ENA)',
    'Sequence Read Archive (SRA)', 'GenBank', 'UniProt', 'PDB', 'GitHub',
    'GitLab', 'Bitbucket', 'Open Science Framework (OSF)', 'Mendeley Data',
    'Harvard Dataverse', 'ClinicalTrials.gov', 'Other'
  ]

  // Optimized preview management - using refs to prevent re-renders
  const previewCache = useRef<Map<number, string>>(new Map())
  const requestedPreviews = useRef<Set<number>>(new Set())
  const loadedPreviews = useRef<Set<number>>(new Set())

  // Fetch figure previews from Data4Rev API (same as Manage Figures popup)
  const fetchFigurePreviews = useCallback(async () => {
    if (!manuscript.figures || manuscript.figures.length === 0) return

    setLoadingPreviews(true)
    const previews = new Map<number, string>()

    try {
      for (const figure of manuscript.figures) {
        if (figure.image_file_id) {
          try {
            const previewUrl = `https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api/v1/manuscripts/${manuscript.id}/files/${figure.image_file_id}/preview`
            const response = await fetch(previewUrl, {
              headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJpYXQiOjE3NTc1MjAyOTksImV4cCI6MTc4ODYyNDI5OSwiYXVkIjoiZGF0YTRyZXYiLCJpc3MiOiJ0ZXN0LWlzc3VlciJ9.z8-At4lk5g1z1PqFxvGCDJfKr4qoUgM0GWMqxmebZpo'
              }
            })

            if (response.ok) {
              const blob = await response.blob()
              const objectUrl = URL.createObjectURL(blob)
              previews.set(figure.id, objectUrl)
            }
          } catch (error) {
            console.warn(`Failed to load preview for figure ${figure.id}:`, error)
          }
        }
      }
      setFigurePreviews(previews)
    } catch (error) {
      console.error('Failed to fetch figure previews:', error)
    } finally {
      setLoadingPreviews(false)
    }
  }, [manuscript.figures, manuscript.id])

  // Load manuscript files when manuscript data changes
  useEffect(() => {
    if (manuscript.id) {
      loadManuscriptFiles()
      fetchFigurePreviews()
    }
  }, [manuscript.id, manuscript.source_data, manuscript.figures, fetchFigurePreviews])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup preview cache
      previewCache.current.forEach((url: string) => URL.revokeObjectURL(url))
      // Cleanup figure previews
      figurePreviews.forEach((url: string) => URL.revokeObjectURL(url))
    }
  }, [figurePreviews]) // Include figurePreviews to cleanup when it changes

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const loadManuscriptFiles = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Loading manuscript files for manuscript:', manuscript.id)

      // Load all files from the API using the /v1/manuscripts/{id}/files endpoint
      let allFiles: ManuscriptFileDetails[] = []
      try {
        const filesResponse = await api.files.getByManuscriptId(manuscript.id.toString())
        allFiles = Array.isArray(filesResponse) ? filesResponse : []
        console.log('📁 Loaded files from API:', allFiles.length, 'files')
        console.log('📁 Sample file structure:', allFiles[0])

        // Debug: Log assignment processing
        allFiles.forEach((file, index) => {
          if (index < 3) { // Log first 3 files for debugging
            console.log(`📁 File ${file.id} (${file.name}):`, {
              assigned_to: file.assigned_to,
              source: file.source
            })
          }
        })
      } catch (apiError) {
        console.warn('Failed to load files from API, using source data only:', apiError)
        allFiles = []
      }

      // Initialize file maps
      const manuscriptFiles: FileWithPreview[] = []
      const figureFilesMap = new Map<number, FileWithPreview[]>()
      const panelFilesMap = new Map<string, FileWithPreview[]>()

      // Process each file and categorize based on assigned_to mappings
      allFiles.forEach(file => {
        const fileWithPreview: FileWithPreview = {
          id: file.id,
          filename: file.name, // Use the unedited name from API
          content_type: 'application/octet-stream',
          size: 0,
          isImage: false,
          source: file.source || '',
          fullPath: file.name // Use the unedited name as the full path
        }

        // Track where this file has been assigned to avoid duplicates
        const assignedLocations = new Set<string>()

        // Check if file has assignments
        if (file.assigned_to && file.assigned_to.length > 0) {
          // Process each assignment in the assigned_to array
          file.assigned_to.forEach(assignment => {
            if (assignment.figure && assignment.panel) {
              // File is assigned to a specific panel
              const key = `${assignment.figure.id}-${assignment.panel.id}`
              const locationKey = `panel-${key}`

              if (!assignedLocations.has(locationKey)) {
                assignedLocations.add(locationKey)
                if (!panelFilesMap.has(key)) {
                  panelFilesMap.set(key, [])
                }
                panelFilesMap.get(key)!.push(fileWithPreview)
              }
            } else if (assignment.figure && !assignment.panel) {
              // File is assigned to a figure (but not a specific panel)
              const locationKey = `figure-${assignment.figure.id}`

              if (!assignedLocations.has(locationKey)) {
                assignedLocations.add(locationKey)
                if (!figureFilesMap.has(assignment.figure.id)) {
                  figureFilesMap.set(assignment.figure.id, [])
                }
                figureFilesMap.get(assignment.figure.id)!.push(fileWithPreview)
              }
            } else if (assignment.figure === null && assignment.panel === null) {
              // File is explicitly assigned to manuscript level (both figure and panel are null)
              const locationKey = 'manuscript'

              if (!assignedLocations.has(locationKey)) {
                assignedLocations.add(locationKey)
                manuscriptFiles.push(fileWithPreview)
              }
            }
          })
        }
        // Note: Files without assignments are not displayed anywhere
      })

      // Also load files from source_data as fallback (for backward compatibility)
      if (allFiles.length === 0) {
        console.log('📁 No files from API, falling back to source_data approach')

        // Load manuscript-level files from source_data
        const manuscriptFileIds = manuscript.source_data?.map((sd: { file_id: number; id: number }) => sd.file_id) || []
        manuscriptFileIds.forEach((fileId: number) => {
          manuscriptFiles.push({
            id: fileId,
            filename: `file_${fileId}`,
            content_type: 'application/octet-stream',
            size: 0,
            isImage: false,
            source: '',
            fullPath: `file_${fileId}`
          })
        })

        // Load figure files from source_data
        for (const figure of manuscript.figures || []) {
          const figureFileIds = figure.source_data?.map((sd: { file_id: number; id: number }) => sd.file_id) || []
          const figureFiles: FileWithPreview[] = figureFileIds.map((fileId: number) => ({
            id: fileId,
            filename: `figure_${figure.id}_file_${fileId}`,
            content_type: 'application/octet-stream',
            size: 0,
            isImage: false,
            source: '',
            fullPath: `figure_${figure.id}_file_${fileId}`
          }))
          figureFilesMap.set(figure.id, figureFiles)
        }

        // Load panel files from source_data
        for (const figure of manuscript.figures || []) {
          for (const panel of figure.panels || []) {
            const panelFileIds = panel.source_data?.map((sd: { file_id: number; id: number }) => sd.file_id) || []
            const panelFiles: FileWithPreview[] = panelFileIds.map((fileId: number) => ({
              id: fileId,
              filename: `panel_${panel.id}_file_${fileId}`,
              content_type: 'application/octet-stream',
              size: 0,
              isImage: false,
              source: '',
              fullPath: `panel_${panel.id}_file_${fileId}`
            }))
          panelFilesMap.set(`${figure.id}-${panel.id}`, panelFiles)
          }
        }
      }

      // Update state
      setManuscriptFiles(manuscriptFiles)
      setFigureFiles(figureFilesMap)
      setPanelFiles(panelFilesMap)

      const totalFiles = manuscriptFiles.length +
        Array.from(figureFilesMap.values()).reduce((sum, files) => sum + files.length, 0) +
        Array.from(panelFilesMap.values()).reduce((sum, files) => sum + files.length, 0)

      console.log(`📊 Loaded files - Manuscript: ${manuscriptFiles.length}, Figures: ${figureFilesMap.size}, Panels: ${panelFilesMap.size}, Total: ${totalFiles}`)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const getFilePreviewUrl = useCallback(async (fileId: number): Promise<string | undefined> => {
    // Check cache first
    if (previewCache.current.has(fileId)) {
      return previewCache.current.get(fileId)
    }

    try {
      const previewUrl = buildApiUrl(`/v1/manuscripts/${manuscript.id}/files/${fileId}/preview`)
      const authToken = config.api.token

      const response = await fetch(previewUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        // Cache the result
        previewCache.current.set(fileId, objectUrl)
        return objectUrl
      } else {
        console.warn(`Failed to get preview for file ${fileId}:`, response.status, response.statusText)
      }
    } catch (error) {
      console.warn(`Network error for file ${fileId}:`, error)
    }
    return undefined
  }, [manuscript.id])

  const isImageFile = (contentTypeOrFilename: string): boolean => {
    if (!contentTypeOrFilename) return false
    const lower = contentTypeOrFilename.toLowerCase()
    return lower.startsWith('image/') ||
           lower.includes('png') ||
           lower.includes('jpg') ||
           lower.includes('jpeg') ||
           lower.includes('gif') ||
           lower.includes('svg') ||
           lower.includes('tiff') ||
           lower.includes('webp') ||
           lower.includes('bmp') ||
           lower.includes('figure') ||
           lower.includes('image')
  }

  // OPTIMIZED: Load preview for a specific file - with better state management
  const loadPreviewForFile = useCallback(async (fileId: number) => {
    // Check if we've already requested or loaded this preview
    if (requestedPreviews.current.has(fileId) || loadedPreviews.current.has(fileId)) {
      return
    }

    // Mark as requested
    requestedPreviews.current.add(fileId)

    const previewUrl = await getFilePreviewUrl(fileId)
    if (previewUrl) {
      // Mark as loaded
      loadedPreviews.current.add(fileId)

      // Update the specific file in panel files - OPTIMIZED: Only update if needed
      setPanelFiles(prev => {
        const newMap = new Map(prev)
        let hasChanges = false

        for (const [key, files] of newMap.entries()) {
          const updatedFiles = files.map(file => {
            if (file.id === fileId && !file.previewUrl) {
              hasChanges = true
              return { ...file, previewUrl }
            }
            return file
          })
          if (hasChanges) {
            newMap.set(key, updatedFiles)
            break
          }
        }
        return hasChanges ? newMap : prev
      })
    }
  }, [getFilePreviewUrl])

  const handleRemoveFile = async (fileId: number, figureId?: number, panelId?: number) => {
    console.log('handleRemoveFile', fileId, figureId, panelId)
    try {
      // Find the source data ID to delete
      let sourceDataId: number | null = null

      if (figureId && panelId) {
        // Find in panel files
        const key = `${figureId}-${panelId}`
        const files = panelFiles.get(key) || []
        const file = files.find(f => f.id === fileId)
        // For now, we'll use the file ID as the source data ID
        // In a real implementation, you'd need to track the actual source data IDs
        sourceDataId = fileId
      } else if (figureId) {
        // Find in figure files
        const files = figureFiles.get(figureId) || []
        const file = files.find(f => f.id === fileId)
        sourceDataId = fileId
      } else {
        // Find in manuscript files
        const file = manuscriptFiles.find(f => f.id === fileId)
        sourceDataId = fileId
      }

      if (sourceDataId) {
        // Call the appropriate API endpoint based on the level
        if (figureId && panelId) {
          // Remove from panel source data
          await api.sourceData.deleteFromPanel(manuscript.id.toString(), figureId.toString(), panelId.toString(), sourceDataId.toString())
        } else if (figureId) {
          // Remove from figure source data
          await api.sourceData.deleteFromFigure(manuscript.id.toString(), figureId.toString(), sourceDataId.toString())
        } else {
          // Remove from manuscript source data
          await api.sourceData.deleteFromManuscript(manuscript.id.toString(), sourceDataId.toString())
        }
      }

      // Update local state
      if (figureId && panelId) {
        const key = `${figureId}-${panelId}`
        setPanelFiles(prev => {
          const newMap = new Map(prev)
          const files = newMap.get(key) || []
          newMap.set(key, files.filter(f => f.id !== fileId))
          return newMap
        })
      } else if (figureId) {
        setFigureFiles(prev => {
          const newMap = new Map(prev)
          const files = newMap.get(figureId) || []
          newMap.set(figureId, files.filter(f => f.id !== fileId))
          return newMap
        })
      } else {
        setManuscriptFiles(prev => prev.filter(f => f.id !== fileId))
      }

      if (onFileRemoval) {
        onFileRemoval(fileId, figureId, panelId)
      }

      // Show success notification
      setNotification({
        type: 'success',
        message: 'File removed successfully'
      })
    } catch (error) {
      console.error('Failed to remove file:', error)
      setNotification({
        type: 'error',
        message: 'Failed to remove file. Please try again.'
      })
    }
  }

  const handleAddFile = async (figureId?: number, panelId?: number) => {
    // Set the mapping target and show the source file selection dialog
    setMappingTarget({ figureId, panelId })
    setShowSourceFileDialog(true)
  }

  const handleSourceFileSelection = async (sourceFile: ManuscriptFileDetails) => {
    if (!mappingTarget) return

    setMapping(true)
    try {
      if (mappingTarget.figureId && mappingTarget.panelId) {
        // Map source file to panel
        await api.sourceData.assignToPanel(
          manuscript.id.toString(),
          mappingTarget.figureId.toString(),
          mappingTarget.panelId.toString(),
          sourceFile.id
        )

        // Add to panel files
        const key = `${mappingTarget.figureId}-${mappingTarget.panelId}`
        setPanelFiles(prev => {
          const newMap = new Map(prev)
          const files = newMap.get(key) || []
          const newFile: FileWithPreview = {
            id: sourceFile.id,
            filename: sourceFile.name || `file_${sourceFile.id}`,
            content_type: 'application/octet-stream',
            size: 0,
            isImage: false
          }
          newMap.set(key, [...files, newFile])
          return newMap
        })
      } else if (mappingTarget.figureId) {
        // Map source file to figure
        await api.sourceData.assignToFigure(
          manuscript.id.toString(),
          mappingTarget.figureId.toString(),
          sourceFile.id
        )

        // Add to figure files
        setFigureFiles(prev => {
          const newMap = new Map(prev)
          const files = newMap.get(mappingTarget.figureId!) || []
          const newFile: FileWithPreview = {
            id: sourceFile.id,
            filename: sourceFile.name || `file_${sourceFile.id}`,
            content_type: 'application/octet-stream',
            size: 0,
            isImage: false
          }
          newMap.set(mappingTarget.figureId!, [...files, newFile])
          return newMap
        })
      } else {
        // Map source file to manuscript
        await api.sourceData.assignToManuscript(
          manuscript.id.toString(),
          sourceFile.id
        )

        // Add to manuscript files
        const newFile: FileWithPreview = {
          id: sourceFile.id,
          filename: sourceFile.name || `file_${sourceFile.id}`,
          content_type: 'application/octet-stream',
          size: 0,
          isImage: false
        }
        setManuscriptFiles(prev => [...prev, newFile])
      }

      if (onFileAssignment) {
        onFileAssignment(sourceFile.id, mappingTarget.figureId, mappingTarget.panelId)
      }

      // Show success notification
      setNotification({
        type: 'success',
        message: 'File mapped successfully'
      })

      // Close dialog
      setShowSourceFileDialog(false)
      setMappingTarget(null)
      setSelectedSourceFile(null)
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to map file:', error)
      setNotification({
        type: 'error',
        message: 'Failed to map file. Please try again.'
      })
    } finally {
      setMapping(false)
    }
  }


  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const toggleFigurePanelsCollapse = (figureId: number) => {
    setCollapsedFigurePanels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(figureId)) {
        newSet.delete(figureId)
      } else {
        newSet.add(figureId)
      }
      return newSet
    })
  }

  // Link management functions
  const handleAddLink = (figureId?: number, panelId?: number) => {
    setLinkTarget({ figureId, panelId })
    setLinkFormData({ name: '', uri: '', identifier: null, database: null })
    setSelectedDatabase('')
    setLinkTabValue('structured')
    setShowLinkDialog(true)
  }

  const handleDeleteLink = async (linkId: number, figureId?: number, panelId?: number) => {
    try {
      if (panelId && figureId) {
        await api.links.deletePanel(manuscript.id.toString(), figureId.toString(), panelId.toString(), linkId.toString())
      } else if (figureId) {
        await api.links.deleteFigure(manuscript.id.toString(), figureId.toString(), linkId.toString())
      } else {
        await api.links.deleteManuscript(manuscript.id.toString(), linkId.toString())
      }

      setNotification({ type: 'success', message: 'Link deleted successfully' })
      loadManuscriptFiles() // Reload to get updated data
      setTimeout(() => setNotification(null), 3000)
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete link' })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleSaveLink = async () => {
    try {
      let linkData: LinkCreate

      if (linkTabValue === 'structured') {
        // Structured identifier
        if (!selectedDatabase || !linkFormData.identifier) {
          setNotification({ type: 'error', message: 'Please fill in both identifier type and identifier' })
          setTimeout(() => setNotification(null), 3000)
          return
        }

        // Generate URI based on database type
        let uri = linkFormData.identifier
        const identifier = linkFormData.identifier

        // Add common URI patterns for known databases
        if (selectedDatabase === 'DOI' && !identifier.startsWith('http')) {
          uri = `https://doi.org/${identifier}`
        } else if (selectedDatabase === 'PubMed' && !identifier.startsWith('http')) {
          uri = `https://pubmed.ncbi.nlm.nih.gov/${identifier}/`
        } else if (selectedDatabase === 'Zenodo' && !identifier.startsWith('http')) {
          uri = `https://zenodo.org/record/${identifier}`
        } else if (selectedDatabase === 'GitHub' && !identifier.startsWith('http')) {
          uri = `https://github.com/${identifier}`
        }

        linkData = {
          name: `${selectedDatabase}: ${identifier}`,
          uri,
          identifier,
          database: selectedDatabase
        }
      } else {
        // Freeform URL
        if (!linkFormData.uri) {
          setNotification({ type: 'error', message: 'Please provide a URL' })
          setTimeout(() => setNotification(null), 3000)
          return
        }

        linkData = {
          name: linkFormData.uri,
          uri: linkFormData.uri,
          identifier: null,
          database: null
        }
      }

      // Create link at appropriate level
      if (linkTarget?.panelId && linkTarget?.figureId) {
        await api.links.createPanel(manuscript.id.toString(), linkTarget.figureId.toString(), linkTarget.panelId.toString(), linkData)
      } else if (linkTarget?.figureId) {
        await api.links.createFigure(manuscript.id.toString(), linkTarget.figureId.toString(), linkData)
      } else {
        await api.links.createManuscript(manuscript.id.toString(), linkData)
      }

      setNotification({ type: 'success', message: 'Link added successfully' })
      setShowLinkDialog(false)
      loadManuscriptFiles() // Reload to get updated data
      setTimeout(() => setNotification(null), 3000)
    } catch (err) {
      setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Failed to add link' })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  // Simplified FileItem component - shows only full pathname
  const FileItem = useMemo(() => {
    return ({ file, onRemove }: {
      file: FileWithPreview
      onRemove: () => void
    }) => {
      return (
        <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 truncate" title={file.fullPath}>
              {file.fullPath || file.filename}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )
    }
  }, [])

  const AddMoreButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-dashed border-gray-300 hover:border-gray-400 transition-colors"
    >
      <span className="text-lg">+</span>
      Add source data
    </button>
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading files...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Notification Display */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Source File Selection Dialog */}
      {showSourceFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Source Files</h3>
              <button
                onClick={() => {
                  setShowSourceFileDialog(false)
                  setMappingTarget(null)
                  setSelectedSourceFile(null)
                  setSearchQuery('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Mapping Target:</h4>
                <p className="text-sm text-blue-700">
                  {mappingTarget?.figureId && mappingTarget?.panelId
                    ? (() => {
                        const figure = manuscript.figures?.find(f => f.id === mappingTarget.figureId)
                        const panel = figure?.panels?.find(p => p.id === mappingTarget.panelId)
                        return `📄 Manuscript > 🖼️ ${figure?.label || `Figure ${mappingTarget.figureId}`} > 🔲 Panel ${panel?.label || mappingTarget.panelId}`
                      })()
                    : mappingTarget?.figureId
                      ? (() => {
                          const figure = manuscript.figures?.find(f => f.id === mappingTarget.figureId)
                          return `📄 Manuscript > 🖼️ ${figure?.label || `Figure ${mappingTarget.figureId}`}`
                        })()
                      : '📄 Manuscript'
                  }
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Select source files to map to this location in the manuscript structure.
              </p>

              {/* Search input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* File list - One file per row */}
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-1">
                  {sourceFiles
                    .filter(file =>
                      file.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      file.source?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedSourceFile?.id === file.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedSourceFile(file)}
                      >
                        <div className="flex-shrink-0">
                          <File className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 truncate" title={file.name}>
                            {file.name || `File ${file.id}`}
                          </div>
                        </div>
                        {selectedSourceFile?.id === file.id && (
                          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                </div>
                {sourceFiles.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <File className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No source files available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setShowSourceFileDialog(false)
                  setMappingTarget(null)
                  setSelectedSourceFile(null)
                  setSearchQuery('')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedSourceFile && handleSourceFileSelection(selectedSourceFile)}
                disabled={!selectedSourceFile || mapping}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mapping ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Mapping...
                  </>
                ) : (
                  'Map File'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manuscript Level - Main Container */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">Manuscript</h3>
            <p className="text-sm text-gray-500">Main document files</p>
          </div>
          <div className="text-sm text-gray-500">
            {manuscriptFiles.length} file{manuscriptFiles.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Manuscript Files and Links - Two Column Layout */}
        <div className="ml-11 mb-6 flex gap-4">
          {/* Source Files Column - 2/3 width */}
          <div className="flex-1" style={{ flexBasis: '66.666%' }}>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Source Files</h5>
            <div className="space-y-1 mb-3">
              {manuscriptFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  onRemove={() => handleRemoveFile(file.id)}
                />
              ))}
            </div>
            <AddMoreButton onClick={() => handleAddFile()} />
          </div>

          {/* External Links Column - 1/3 width */}
          <div className="flex-1" style={{ flexBasis: '33.333%' }}>
            <h5 className="text-sm font-medium text-gray-700 mb-2">External Data Links</h5>
            <div className="space-y-1 mb-3">
              {manuscript.links?.map((link) => (
                <div key={link.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors">
                  <ExternalLink className="w-3 h-3 text-blue-600 flex-shrink-0" />
                  <a
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm text-blue-600 hover:underline truncate"
                    title={link.name}
                  >
                    {link.name}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLink(link.id)}
                    className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleAddLink()}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Link to external data
            </button>
          </div>
        </div>

        {/* Figures - Nested within Manuscript */}
        {manuscript.figures?.map((figure) => (
          <div key={figure.id} className="border-l-2 border-gray-200 pl-4 ml-4 mb-6">
            {/* Figure Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-7 h-7 bg-green-100 rounded-lg">
                <Image className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base text-gray-900">{figure.label}</h4>
                <p className="text-sm text-gray-500">Figure files and data</p>
              </div>
              <div className="text-sm text-gray-500">
                {(figureFiles.get(figure.id) || []).length} file{(figureFiles.get(figure.id) || []).length !== 1 ? 's' : ''}
              </div>
            </div>


            {/* Figure Content with Preview */}
            <div className="ml-10 mb-4">
              <div className="flex gap-4">
                {/* Figure Preview - Left Side */}
                <div className="flex-shrink-0">
                  {loadingPreviews ? (
                    <div className="w-80 h-64 flex items-center justify-center bg-gray-100 rounded-md">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading image...</p>
                      </div>
                    </div>
                  ) : figurePreviews.has(figure.id) ? (
                    <div className="w-80 bg-gray-100 rounded-md overflow-hidden relative">
                      <img
                        src={figurePreviews.get(figure.id)}
                        alt={figure.label}
                        className="w-full h-full object-contain"
                      />
                      {/* Panel Bounding Boxes Overlay */}
                      {figure.panels?.map((panel) => {
                        // Check if panel has valid coordinates (can be 0, but not null/undefined)
                        if (panel.x1 != null && panel.y1 != null && panel.x2 != null && panel.y2 != null) {
                          // Convert normalized coordinates (0-1) to percentages
                          const left = panel.x1 * 100
                          const top = panel.y1 * 100
                          const width = (panel.x2 - panel.x1) * 100
                          const height = (panel.y2 - panel.y1) * 100

                          return (
                            <div
                              key={panel.id}
                              className="absolute border-2 border-blue-500 pointer-events-none"
                              style={{
                                left: `${left}%`,
                                top: `${top}%`,
                                width: `${width}%`,
                                height: `${height}%`,
                              }}
                            >
                              {/* Panel Label */}
                              <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0 rounded font-medium shadow-sm">
                                {panel.label}
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  ) : (
                    <div className="w-80 h-64 flex items-center justify-center bg-gray-100 rounded-md">
                      <div className="text-center text-muted-foreground">
                        <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No preview available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Figure Files and Panels - Right Side */}
                <div className="flex-1">
                  {/* Figure Files and Links - Two Column Layout */}
                  <div className="flex gap-4 mb-4">
                    {/* Source Files Column - 2/3 width */}
                    <div className="flex-1" style={{ flexBasis: '66.666%' }}>
                      <h6 className="text-xs font-medium text-gray-600 mb-2">Source Files</h6>
                      <div className="space-y-1 mb-2">
                        {(figureFiles.get(figure.id) || []).map((file) => (
                          <FileItem
                            key={file.id}
                            file={file}
                            onRemove={() => handleRemoveFile(file.id, figure.id)}
                          />
                        ))}
                      </div>
                      <AddMoreButton onClick={() => handleAddFile(figure.id)} />
                    </div>

                    {/* External Links Column - 1/3 width */}
                    <div className="flex-1" style={{ flexBasis: '33.333%' }}>
                      <h6 className="text-xs font-medium text-gray-600 mb-2">External Data Links</h6>
                      <div className="space-y-1 mb-2">
                        {figure.links?.map((link) => (
                          <div key={link.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <ExternalLink className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            <a
                              href={link.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-xs text-blue-600 hover:underline truncate"
                              title={link.name}
                            >
                              {link.name}
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLink(link.id, figure.id)}
                              className="h-5 w-5 p-0 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleAddLink(figure.id)}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md border border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Link to external data
                      </button>
                    </div>
                  </div>

                  {/* Detected Panels Information */}
                  {figure.panels && figure.panels.length > 0 && (
                    <button
                      onClick={() => toggleFigurePanelsCollapse(figure.id)}
                      className="w-full mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors text-left cursor-pointer"
                    >
                      <p className="text-sm text-blue-800 flex items-center gap-2">
                        <span className="font-medium">List of detected panels:</span>
                        <span>{figure.panels.map(p => p.label).join(', ')}</span>
                        <span className="ml-auto flex items-center gap-1 text-xs">
                          {collapsedFigurePanels.has(figure.id) ? (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Show
                            </>
                          ) : (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Hide
                            </>
                          )}
                        </span>
                      </p>
                    </button>
                  )}

                  {/* Panels - Indented under Figure */}
                  {!collapsedFigurePanels.has(figure.id) && figure.panels?.map((panel) => (
                    <div key={panel.id} className="border-l-2 border-gray-100 pl-4 bg-gray-50 rounded-md p-3 mb-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-5 h-5 bg-purple-100 rounded-md">
                          <Image className="w-3 h-3 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <button
                            onClick={() => setZoomedPanel({ figureId: figure.id, panelId: panel.id, panel })}
                            className="font-medium text-sm text-gray-900 hover:text-blue-600 hover:underline cursor-pointer transition-colors text-left"
                            title="Click to view figure with this panel highlighted"
                          >
                            Panel {panel.label}
                          </button>
                          <p className="text-xs text-gray-500">Panel-specific files</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {(panelFiles.get(`${figure.id}-${panel.id}`) || []).length} file{(panelFiles.get(`${figure.id}-${panel.id}`) || []).length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Panel Files and Links - Two Column Layout */}
                      <div className="ml-6 flex gap-4">
                        {/* Source Files Column - 2/3 width */}
                        <div className="flex-1" style={{ flexBasis: '66.666%' }}>
                          <div className="space-y-1 mb-2">
                            {(panelFiles.get(`${figure.id}-${panel.id}`) || []).map((file) => (
                              <FileItem
                                key={file.id}
                                file={file}
                                onRemove={() => handleRemoveFile(file.id, figure.id, panel.id)}
                              />
                            ))}
                          </div>
                          <AddMoreButton onClick={() => handleAddFile(figure.id, panel.id)} />
                        </div>

                        {/* External Links Column - 1/3 width */}
                        <div className="flex-1" style={{ flexBasis: '33.333%' }}>
                          <div className="space-y-1 mb-2">
                            {panel.links?.map((link) => (
                              <div key={link.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors">
                                <ExternalLink className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                <a
                                  href={link.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 text-xs text-blue-600 hover:underline truncate"
                                  title={link.name}
                                >
                                  {link.name}
                                </a>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteLink(link.id, figure.id, panel.id)}
                                  className="h-5 w-5 p-0 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => handleAddLink(figure.id, panel.id)}
                            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md border border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Link to external data
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLinkDialog(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add External Data Link</h3>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
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
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveLink}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Panel Zoom Modal */}
      {zoomedPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setZoomedPanel(null)}>
          <div className="bg-white rounded-lg p-6 max-w-5xl max-h-[90vh] mx-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {manuscript.figures?.find(f => f.id === zoomedPanel.figureId)?.label}
                </h3>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Panel {zoomedPanel.panel.label}:</span> {zoomedPanel.panel.caption}
                </p>
              </div>
              <button
                onClick={() => setZoomedPanel(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center">
              {figurePreviews.has(zoomedPanel.figureId) ? (
                <div className="relative inline-block bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={figurePreviews.get(zoomedPanel.figureId)}
                    alt={manuscript.figures?.find(f => f.id === zoomedPanel.figureId)?.label}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                  {/* Panel Bounding Boxes Overlay */}
                  {manuscript.figures?.find(f => f.id === zoomedPanel.figureId)?.panels?.map((panel) => {
                    if (panel.x1 != null && panel.y1 != null && panel.x2 != null && panel.y2 != null) {
                      const left = panel.x1 * 100
                      const top = panel.y1 * 100
                      const width = (panel.x2 - panel.x1) * 100
                      const height = (panel.y2 - panel.y1) * 100
                      const isHighlighted = panel.id === zoomedPanel.panelId

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
                <div className="flex items-center justify-center py-16">
                  <div className="text-center text-gray-500">
                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>Figure preview not available</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => setZoomedPanel(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
