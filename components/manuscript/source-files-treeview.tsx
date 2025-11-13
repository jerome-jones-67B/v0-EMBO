"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { ChevronDown, ChevronRight, ChevronLeft, File, Folder, MoreHorizontal, Download, Link2, Eye, RotateCcw, AlertTriangle, FolderOpen, FolderClosed, Archive, FileArchive, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MultiSelect } from "@/components/ui/multi-select"
import type { ManuscriptFileDetails } from "@/lib/types"
import type { Figure } from "@/types/manuscript-detail"
import { api } from "@/lib/api-client"

interface SourceFilesTreeviewProps {
  sourceFiles: ManuscriptFileDetails[]
  figures?: Figure[]
  manuscriptId: string
  isLoading?: boolean
  error?: string | null
  onRefresh?: () => void
  onAssignmentChange?: (fileId: number, figureId?: number, panelId?: number) => Promise<void>
}

interface TreeNode {
  id: string
  name: string
  type: 'folder' | 'file' | 'zip'
  children?: TreeNode[]
  file?: ManuscriptFileDetails
}

export function SourceFilesTreeview({
  sourceFiles,
  figures = [],
  manuscriptId,
  isLoading = false,
  error = null,
  onRefresh,
  onAssignmentChange
}: SourceFilesTreeviewProps) {
  // Generate available elements from actual figures data - memoized to prevent re-renders
  const availableElements = useMemo(() => {
    const elements: Array<{
      value: string
      label: string
      figure_id?: number | null
      panel_id?: number | null
    }> = []

    if (figures.length === 0) {
      return elements
    }

    // Add figure and panel options with simplified label format
    figures.forEach((figure, index) => {
      // Add the main figure option
      elements.push({
        value: `figure-${figure.id}`,
        label: figure.label || `Figure ${figure.id}`,
        figure_id: figure.id,
        panel_id: null
      })

      // Add individual panel options
      figure.panels?.forEach((panel, panelIndex) => {
        elements.push({
          value: `panel-${figure.id}-${panel.id}`,
          label: `${figure.label || `Figure ${figure.id}`}${panel.label || `Panel ${panel.id}`}`,
          figure_id: figure.id,
          panel_id: panel.id
        })
      })
    })

    return elements
  }, [figures])

  // Only use the manuscript figures - no assignment-based elements
  const allAvailableElements = availableElements
  // Show loading state if we're loading or if we have no files and no error (initial state)
  const shouldShowLoading = isLoading || (sourceFiles.length === 0 && !error)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [mappingTargets, setMappingTargets] = useState<Record<string, string[]>>({})
  const [sourceDataIds, setSourceDataIds] = useState<Record<string, Record<string, number>>>({})

  // Bulk mapping state
  const [bulkMappingTarget, setBulkMappingTarget] = useState<string>('')
  const [isBulkMapping, setIsBulkMapping] = useState(false)
  const [bulkMappingNotification, setBulkMappingNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Left nav panel state
  const [showLeftNav, setShowLeftNav] = useState(true)

  // Use ref to store source data IDs that persist across function calls
  const sourceDataIdsRef = useRef<Record<string, Record<string, number>>>({})
  const lastSourceFilesRef = useRef<any[]>([])

  // Helper function to find assignment value for source data
  const findAssignmentValueForSourceData = (sourceData: any, manuscriptData: any): string | null => {
    if (sourceData.panel_id && sourceData.figure_id) {
      // Panel assignment
      return `panel-${sourceData.figure_id}-${sourceData.panel_id}`
    } else if (sourceData.figure_id) {
      // Figure assignment
      return `figure-${sourceData.figure_id}`
    } else {
      // Manuscript assignment
      return 'manuscript'
    }
  }

  // Organize files into a tree structure based on file paths
  const organizeFilesIntoTree = (files: ManuscriptFileDetails[]): TreeNode[] => {
    const root: TreeNode = {
      id: 'root',
      name: 'root',
      type: 'folder',
      children: []
    }

    // Process files and build tree structure
    files.forEach(file => {
      const fileName = file.name || ''
      const isZipFile = fileName.toLowerCase().endsWith('.zip')

      if (isZipFile) {
        // For ZIP files, find related files that should be their children
        const zipBaseName = fileName.replace(/\.zip$/i, '')
        const relatedFiles = files.filter(f =>
          f.id !== file.id &&
          !f.name.toLowerCase().endsWith('.zip') &&
          (f.name.includes(zipBaseName) ||
           (f.source && f.source.includes(zipBaseName)) ||
           (f.path && f.path.includes(zipBaseName)))
        )

        let filePath = fileName

        // If filename contains path-like structure, use it as-is
        if (filePath.includes('/') || filePath.includes(':')) {
          // File already has path structure
        } else {
          // Put uncategorized zip files in a default folder based on source
          const sourceType = file.source?.toLowerCase().replace(/\s+/g, '_') || 'uncategorized'
          filePath = `${sourceType}/${file.name}`
        }

        // Split path into segments (treat both '/' and ':' as separators)
        const pathSegments = filePath
          .replace(/:/g, '/') // Convert colons to slashes
          .split('/')
          .filter(segment => segment.length > 0)

        // If no segments, put in root
        if (pathSegments.length === 0) {
          pathSegments.push('root', file.name)
        }

        // Navigate/create the folder structure
        let currentNode = root

        // Process all segments except the last one (which is the filename)
        for (let i = 0; i < pathSegments.length - 1; i++) {
          const segment = pathSegments[i]

          // Extract clean folder name (segment should already be clean, but this ensures it)
          const cleanSegment = segment.split('/').pop() || segment

          // Look for existing folder
          let childFolder = currentNode.children?.find(
            child => child.type === 'folder' && child.name === cleanSegment
          )

          // Create folder if it doesn't exist
          if (!childFolder) {
            const folderPath = pathSegments.slice(0, i + 1).join('/')
            childFolder = {
              id: `folder-${folderPath}`,
              name: cleanSegment,
              type: 'folder',
              children: []
            }
            if (!currentNode.children) currentNode.children = []
            currentNode.children.push(childFolder)
          }

          currentNode = childFolder
        }

        // Add the zip file to the current folder with its children
        const rawFileName = pathSegments[pathSegments.length - 1] || file.name
        const finalFileName = rawFileName.split('/').pop() || rawFileName

        // Create a tree structure for the ZIP file's children
        const zipRoot: TreeNode = {
          id: `zip-root-${file.id}`,
          name: 'root',
          type: 'folder',
          children: []
        }

        // Process each related file and build tree structure under the ZIP
        relatedFiles.forEach(childFile => {
          const childFileName = childFile.name || ''
          let childFilePath = childFileName

          // Handle the specific pattern: 'suppl_data/Figure 8.zip:Figure 8/8G/DUSP6.tiff'
          // We need to remove everything up to and including the colon
          if (childFilePath.includes(':')) {
            const colonIndex = childFilePath.indexOf(':')
            childFilePath = childFilePath.substring(colonIndex + 1)
          }

          // If the child file has a path that starts with the ZIP base name, remove it
          if (childFilePath.startsWith(zipBaseName)) {
            childFilePath = childFilePath.substring(zipBaseName.length).replace(/^[\/\\]/, '')
          }

          // Remove any `.zip` directory from the path
          childFilePath = childFilePath.replace(/^\.zip[\/\\]/, '').replace(/^\.zip$/, '')

          // Also remove any path segments that are just `.zip`
          const tempPathSegments = childFilePath.split(/[\/\\]/)
          const filteredSegments = tempPathSegments.filter(segment => segment !== '.zip')
          childFilePath = filteredSegments.join('/')

          // If filename contains path-like structure, use it as-is
          if (childFilePath.includes('/') || childFilePath.includes('\\') || childFilePath.includes(':')) {
            // File already has path structure
          } else {
            // Put uncategorized files in a default folder
            childFilePath = `files/${childFileName}`
          }

          // Split path into segments (treat both '/' and '\' as separators)
          const pathSegments = childFilePath
            .replace(/\\/g, '/') // Convert backslashes to slashes
            .replace(/:/g, '/') // Convert colons to slashes
            .split('/')
            .filter(segment => segment.length > 0)

          // If no segments, put in root
          if (pathSegments.length === 0) {
            pathSegments.push('files', childFileName)
          }

          // Navigate/create the folder structure under the ZIP
          let currentNode = zipRoot

          // Process all segments except the last one (which is the filename)
          for (let i = 0; i < pathSegments.length - 1; i++) {
            const segment = pathSegments[i]

            // Extract clean folder name
            const cleanSegment = segment.split('/').pop() || segment

            // Look for existing folder
            let childFolder = currentNode.children?.find(
              child => child.type === 'folder' && child.name === cleanSegment
            )

            // Create folder if it doesn't exist
            if (!childFolder) {
              const folderPath = pathSegments.slice(0, i + 1).join('/')
              childFolder = {
                id: `zip-folder-${file.id}-${folderPath}`,
                name: cleanSegment,
                type: 'folder',
                children: []
              }
              if (!currentNode.children) currentNode.children = []
              currentNode.children.push(childFolder)
            }

            currentNode = childFolder
          }

          // Add the file to the current folder
          const rawFileName = pathSegments[pathSegments.length - 1] || childFileName
          const finalFileName = rawFileName.split('/').pop() || rawFileName

          const fileNode: TreeNode = {
            id: childFile.id.toString(),
            name: finalFileName,
            type: 'file',
            file: {
              ...childFile,
              name: finalFileName
            }
          }

          if (!currentNode.children) currentNode.children = []
          currentNode.children.push(fileNode)
        })

        // Sort the ZIP's tree structure
        const sortZipTreeNode = (node: TreeNode) => {
          if (node.children) {
            node.children.sort((a, b) => {
              if (a.type === 'folder' && b.type === 'file') return -1
              if (a.type === 'file' && b.type === 'folder') return 1
              return a.name.localeCompare(b.name)
            })
            node.children.forEach(sortZipTreeNode)
          }
        }
        sortZipTreeNode(zipRoot)

        // Get the children from the ZIP root (skip the root node itself)
        const zipChildren: TreeNode[] = zipRoot.children || []

        // ZIP file node - treated as both file and directory
        const zipFileNode: TreeNode = {
          id: file.id.toString(),
          name: finalFileName,
          type: 'zip', // New zip type for special handling
          children: zipChildren, // Contains its children
          file: {
            ...file,
            name: finalFileName
          }
        }

        if (!currentNode.children) currentNode.children = []
        currentNode.children.push(zipFileNode)
      } else {
        // Check if this file is already a child of a ZIP file
        const isChildOfZip = files.some(zipFile =>
          zipFile.id !== file.id &&
          zipFile.name.toLowerCase().endsWith('.zip') &&
          (file.name.includes(zipFile.name.replace(/\.zip$/i, '')) ||
           (file.source && file.source.includes(zipFile.name.replace(/\.zip$/i, ''))) ||
           (file.path && file.path.includes(zipFile.name.replace(/\.zip$/i, ''))))
        )

        if (isChildOfZip) {
          return // Skip this file as it's already processed as a ZIP child
        }
        // For regular files, use the existing path-based logic
        let filePath = fileName

        // If filename contains path-like structure, use it as-is
        if (filePath.includes('/') || filePath.includes(':')) {
          // File already has path structure
        } else {
          // Put uncategorized files in a default folder based on source
          const sourceType = file.source?.toLowerCase().replace(/\s+/g, '_') || 'uncategorized'
          filePath = `${sourceType}/${file.name}`
        }

        // Split path into segments (treat both '/' and ':' as separators)
        const pathSegments = filePath
          .replace(/:/g, '/') // Convert colons to slashes
          .split('/')
          .filter(segment => segment.length > 0)

        // If no segments, put in root
        if (pathSegments.length === 0) {
          pathSegments.push('root', file.name)
        }

        // Navigate/create the folder structure
        let currentNode = root

        // Process all segments except the last one (which is the filename)
        for (let i = 0; i < pathSegments.length - 1; i++) {
          const segment = pathSegments[i]

          // Extract clean folder name (segment should already be clean, but this ensures it)
          const cleanSegment = segment.split('/').pop() || segment

          // Look for existing folder
          let childFolder = currentNode.children?.find(
            child => child.type === 'folder' && child.name === cleanSegment
          )

          // Create folder if it doesn't exist
          if (!childFolder) {
            const folderPath = pathSegments.slice(0, i + 1).join('/')
            childFolder = {
              id: `folder-${folderPath}`,
              name: cleanSegment,
              type: 'folder',
              children: []
            }
            if (!currentNode.children) currentNode.children = []
            currentNode.children.push(childFolder)
          }

          currentNode = childFolder
        }

        // Add the file to the current folder
        // Extract just the filename (basename) without any folder path
        const rawFileName = pathSegments[pathSegments.length - 1] || file.name
        const finalFileName = rawFileName.split('/').pop() || rawFileName

        // Regular file node
        const fileNode: TreeNode = {
          id: file.id.toString(),
          name: finalFileName,
          type: 'file',
          file: {
            ...file,
            name: finalFileName
          }
        }

        if (!currentNode.children) currentNode.children = []
        currentNode.children.push(fileNode)
      }
    })

    // Sort folders and files
    const sortTreeNode = (node: TreeNode) => {
      if (node.children) {
        // Sort children: folders first, then files, both alphabetically
        node.children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })

        // Recursively sort children
        node.children.forEach(sortTreeNode)
      }
    }

    sortTreeNode(root)

    // Return root's children (we don't want to show the root folder itself)
    return root.children || []
  }

  // Check if a file is a zip file
  const isZipFile = (node: TreeNode): boolean => {
    return node.type === 'zip'
  }

  // Check if file size should be displayed
  const hasValidSize = (size: string | null | undefined): boolean => {
    return !!(size && size !== 'Unknown' && size !== null && size.trim() !== '')
  }

  // Expand/Collapse all folders utility
  const getAllFolderIds = (nodes: TreeNode[]): string[] => {
    const folderIds: string[] = []
    nodes.forEach(node => {
      if (node.type === 'folder' || isZipFile(node)) {
        folderIds.push(node.id)
        if (node.children) {
          folderIds.push(...getAllFolderIds(node.children))
        }
      }
    })
    return folderIds
  }

  // Count folders recursively
  const countFolders = (nodes: TreeNode[]): number => {
    return nodes.reduce((count, node) => {
      if (node.type === 'folder' || isZipFile(node)) {
        return count + 1 + (node.children ? countFolders(node.children) : 0)
      }
      return count
    }, 0)
  }

  // Count selectable items (files + zip files)
  const countSelectableItems = (nodes: TreeNode[]): number => {
    return nodes.reduce((count, node) => {
      if (node.type === 'file' || isZipFile(node)) {
        return count + 1
      } else if (node.children) {
        return count + countSelectableItems(node.children)
      }
      return count
    }, 0)
  }

  const treeNodes = organizeFilesIntoTree(sourceFiles)
  const folderCount = countFolders(treeNodes)
  const selectableItemCount = countSelectableItems(treeNodes)

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const handleMappingChange = useCallback(async (fileId: string, selectedValues: string[]) => {
    const currentAssignments = mappingTargets[fileId] || []
    const currentSourceDataIds = sourceDataIdsRef.current[fileId] || {}

    // Find assignments to remove and add
    const assignmentsToRemove = currentAssignments.filter(value => !selectedValues.includes(value))
    const assignmentsToAdd = selectedValues.filter(value => !currentAssignments.includes(value))

    // Update UI immediately
    setMappingTargets(prev => ({
      ...prev,
      [fileId]: selectedValues
    }))

    try {
      // Handle removals first
      // Fetch fresh manuscript data to get current source_data IDs
      let freshManuscriptData = null
      if (assignmentsToRemove.length > 0) {
        try {
          console.log('🔄 Fetching fresh manuscript data for deletion...')
          const response = await api.manuscripts.getById(manuscriptId)
          console.log('📦 Raw API response:', response)

          // The response might be wrapped in ApiResponse<T> with a data field
          // or it might be the raw data directly
          freshManuscriptData = response.data || response

          console.log('✅ Fresh manuscript data:', {
            hasData: !!freshManuscriptData,
            type: typeof freshManuscriptData,
            keys: Object.keys(freshManuscriptData || {}),
            figuresCount: freshManuscriptData?.figures?.length,
            hasFigures: !!freshManuscriptData?.figures,
            firstFigure: freshManuscriptData?.figures?.[0]
          })
        } catch (error) {
          console.error('❌ Failed to fetch manuscript data:', error)
          // Fall back to using figures prop
        }
      }

      for (const assignmentValue of assignmentsToRemove) {
        try {
          const element = allAvailableElements.find(el => el.value === assignmentValue)
          if (element) {
            // Use fresh manuscript data if available, otherwise fall back to figures prop
            const figuresToUse = freshManuscriptData?.figures || figures

            // Find and delete the source_data entry
            if (element.panel_id && element.figure_id) {
              // Panel-level assignment - find source data ID from panel
              const panel = figuresToUse?.find((f: any) => f.id === element.figure_id)?.panels?.find((p: any) => p.id === element.panel_id)
              const sourceDataEntry = panel?.source_data?.find((sd: any) => sd.file_id === parseInt(fileId))
              if (sourceDataEntry) {
                console.log(`✅ Deleting panel source data: fileId=${fileId}, figureId=${element.figure_id}, panelId=${element.panel_id}, sourceDataId=${sourceDataEntry.id}`)
                await api.sourceData.deleteFromPanel(
                  manuscriptId,
                  element.figure_id.toString(),
                  element.panel_id.toString(),
                  sourceDataEntry.id.toString()
                )
              } else {
                console.warn(`❌ No source_data entry found for fileId=${fileId} in panel ${element.panel_id}`)
              }
            } else if (element.figure_id) {
              // Figure-level assignment - find source data ID from figure
              const figure = figuresToUse?.find((f: any) => f.id === element.figure_id)
              console.log(`🔍 Looking for figure source_data:`, {
                figureId: element.figure_id,
                fileId: fileId,
                usingFreshData: !!freshManuscriptData,
                figure: figure,
                allFigures: figuresToUse?.map((f: any) => ({
                  id: f.id,
                  label: f.label,
                  has_source_data: !!f.source_data,
                  source_data_length: f.source_data?.length,
                  source_data: f.source_data
                }))
              })

              // Check if source_data exists and is an array
              if (!figure) {
                console.error(`❌ Figure ${element.figure_id} not found in figures list`)
                continue
              }

              if (!figure.source_data) {
                console.error(`❌ Figure ${element.figure_id} has no source_data array. Full figure:`, figure)
                continue
              }

              const sourceDataEntry = figure.source_data.find((sd: any) => sd.file_id === parseInt(fileId))
              if (sourceDataEntry) {
                console.log(`✅ Deleting figure source data: fileId=${fileId}, figureId=${element.figure_id}, sourceDataId=${sourceDataEntry.id}`)
                await api.sourceData.deleteFromFigure(
                  manuscriptId,
                  element.figure_id.toString(),
                  sourceDataEntry.id.toString()
                )
              } else {
                console.error(`❌ No source_data entry found for fileId=${fileId} in figure ${element.figure_id}`, {
                  figureSourceData: figure.source_data,
                  lookingFor: parseInt(fileId),
                  allFileIds: figure.source_data?.map((sd: any) => sd.file_id)
                })
              }
            } else {
              // Manuscript-level assignment
              const sourceDataEntry = freshManuscriptData?.source_data?.find((sd: any) => sd.file_id === parseInt(fileId))
              if (sourceDataEntry) {
                console.log(`✅ Deleting manuscript source data: fileId=${fileId}, sourceDataId=${sourceDataEntry.id}`)
                await api.sourceData.deleteFromManuscript(
                  manuscriptId,
                  sourceDataEntry.id.toString()
                )
              } else {
                console.error(`❌ No source_data entry found for fileId=${fileId} at manuscript level`)
              }
            }
          }
        } catch (error) {
          console.error('Error removing assignment:', error)
        }
      }

      // Handle additions
      if (onAssignmentChange) {
        for (const assignmentValue of assignmentsToAdd) {
          try {
            const element = allAvailableElements.find(el => el.value === assignmentValue)
            if (element) {
              await onAssignmentChange(
                parseInt(fileId),
                element.figure_id || undefined,
                element.panel_id || undefined
              )
            }
          } catch (error) {
            console.error('Error adding assignment:', error)
            // Revert UI on error
            setMappingTargets(prev => ({
              ...prev,
              [fileId]: currentAssignments
            }))
          }
        }
      }

      // Trigger refresh after changes
      if ((assignmentsToRemove.length > 0 || assignmentsToAdd.length > 0) && onRefresh) {
        setTimeout(() => {
          onRefresh()
        }, 300)
      }
    } catch (error) {
      console.error('Error in handleMappingChange:', error)
      // Revert UI on error
      setMappingTargets(prev => ({
        ...prev,
        [fileId]: currentAssignments
      }))
    }
  }, [allAvailableElements, mappingTargets, onAssignmentChange, figures, manuscriptId, onRefresh])

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (bulkMappingNotification) {
      const timer = setTimeout(() => {
        setBulkMappingNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [bulkMappingNotification])

  // Initialize mapping targets from API data
  useEffect(() => {
    if (!sourceFiles.length) {
      setMappingTargets({})
      setSourceDataIds({})
      lastSourceFilesRef.current = []
      return
    }

    // Check if source files have actually changed by comparing with last known state
    const sourceFilesChanged = JSON.stringify(sourceFiles) !== JSON.stringify(lastSourceFilesRef.current)

    if (!sourceFilesChanged) {
      return
    }

    // Update the ref with current source files
    lastSourceFilesRef.current = sourceFiles

    const initialMappings: Record<string, string[]> = {}

    sourceFiles.forEach(file => {
      const assignedTo = file.assigned_to || (file as any).assignedTo

      if (assignedTo && assignedTo.length > 0) {
        const assignments = assignedTo.map(assignment => {
          // Handle the new structure: { figure: { id, label }, panel: { id, label } }
          if (assignment.figure && assignment.panel) {
            // Both figure and panel are set - this is a panel assignment
            return `panel-${assignment.figure.id}-${assignment.panel.id}`
          } else if (assignment.figure && assignment.panel === null) {
            // Only figure is set (panel is explicitly null) - this is a figure assignment
            return `figure-${assignment.figure.id}`
          } else if (assignment.figure === null && assignment.panel === null) {
            // Both figure and panel are explicitly null - this is a manuscript assignment
            return 'manuscript'
          }
          return null
        }).filter((value): value is string => value !== null)

        initialMappings[file.id.toString()] = assignments
      } else {
        // Initialize empty array for files without assignments
        initialMappings[file.id.toString()] = []
      }
    })

    setMappingTargets(initialMappings)
    setSourceDataIds({})

    // Also initialize the ref
    sourceDataIdsRef.current = {}
  }, [sourceFiles]) // Depend on sourceFiles array to detect actual changes


  const expandAll = () => {
    const allFolderIds = getAllFolderIds(treeNodes)
    setExpandedFolders(new Set(allFolderIds))
  }

  const collapseAll = () => {
    setExpandedFolders(new Set())
  }


  // Auto-expand folders with assignments and all ZIP files
  useEffect(() => {
    if (sourceFiles.length > 0 && treeNodes.length > 0) {
      const foldersWithAssignments = new Set<string>()

      // Find folders that contain files with assignments (recursively)
      const findFoldersWithAssignments = (nodes: TreeNode[], parentPath: string = ''): boolean => {
        let hasAnyAssignments = false

        nodes.forEach(node => {
          if (node.type === 'folder') {
            const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name

            // Recursively check if this folder or any of its children have assignments
            const hasAssignmentsInSubtree = findFoldersWithAssignments(node.children || [], currentPath)

            if (hasAssignmentsInSubtree) {
              foldersWithAssignments.add(node.id)
              hasAnyAssignments = true
            }
          } else if (node.type === 'file' && node.file) {
            // Check if this file has assignments
            const assignedTo = node.file.assigned_to || (node.file as any).assignedTo
            if (assignedTo && assignedTo.length > 0) {
              hasAnyAssignments = true
            }
          } else if (isZipFile(node)) {
            // For ZIP files, always expand them by default
            foldersWithAssignments.add(node.id)
            hasAnyAssignments = true

            // Recursively expand ALL folders inside ZIP files by default
            const expandAllFoldersInZip = (nodes: TreeNode[]) => {
              nodes.forEach(childNode => {
                if (childNode.type === 'folder') {
                  // Always expand folders inside ZIP files
                  foldersWithAssignments.add(childNode.id)
                  // Recursively expand nested folders
                  if (childNode.children) {
                    expandAllFoldersInZip(childNode.children)
                  }
                }
              })
            }

            if (node.children) {
              expandAllFoldersInZip(node.children)
            }

            // Also check if the ZIP file itself has assignments
            const assignedTo = node.file?.assigned_to || (node.file as any)?.assignedTo
            const hasZipAssignments = assignedTo && assignedTo.length > 0

            if (hasZipAssignments) {
              hasAnyAssignments = true
            }
          }
        })

        return hasAnyAssignments
      }

      findFoldersWithAssignments(treeNodes)
      setExpandedFolders(foldersWithAssignments)
    }
  }, [sourceFiles.length, treeNodes.length])


  // Helper function to get first child's linked info for left nav
  const getFirstChildLinkedInfo = (node: TreeNode): string | null => {
    if (node.type === 'file' || node.type === 'zip') {
      // For files and zips, check their own assignments
      if (node.file) {
        const assignedTo = node.file.assigned_to || (node.file as any).assignedTo
        if (assignedTo && assignedTo.length > 0) {
          const firstAssignment = assignedTo[0]
          if (firstAssignment.figure && firstAssignment.panel) {
            return `${firstAssignment.figure.label}${firstAssignment.panel.label}`
          } else if (firstAssignment.figure && firstAssignment.panel === null) {
            return firstAssignment.figure.label
          } else if (firstAssignment.figure === null && firstAssignment.panel === null) {
            return 'Manuscript'
          }
        }
      }
      return null
    }

    // For folders, get the first child's assignment
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.type === 'file' || child.type === 'zip') {
          if (child.file) {
            const assignedTo = child.file.assigned_to || (child.file as any).assignedTo
            if (assignedTo && assignedTo.length > 0) {
              const firstAssignment = assignedTo[0]
              if (firstAssignment.figure && firstAssignment.panel) {
                return `${firstAssignment.figure.label}${firstAssignment.panel.label}`
              } else if (firstAssignment.figure && firstAssignment.panel === null) {
                return firstAssignment.figure.label
              } else if (firstAssignment.figure === null && firstAssignment.panel === null) {
                return 'Manuscript'
              }
            }
          }
        } else if (child.type === 'folder') {
          // Recursively check first folder's first child
          const childLinkedInfo = getFirstChildLinkedInfo(child)
          if (childLinkedInfo) return childLinkedInfo
        }
      }
    }
    return null
  }

  // Helper function to get immediate children mappings for a folder
  const getImmediateChildrenMappings = (node: TreeNode): string[] => {
    if (node.type !== 'folder') return []

    const mappings: string[] = []

    // Helper function to extract labels from assignments using new API structure
    const extractLabelsFromAssignments = (assignedTo: any[]) => {
      return assignedTo.map(assignment => {
        // Handle the new structure: { figure: { id, label }, panel: { id, label } }
        if (assignment.figure && assignment.panel) {
          // Both figure and panel are set - this is a panel assignment
          return `${assignment.figure.label} - ${assignment.panel.label}`
        } else if (assignment.figure && assignment.panel === null) {
          // Only figure is set (panel is explicitly null) - this is a figure assignment
          return assignment.figure.label
        } else if (assignment.figure === null && assignment.panel === null) {
          // Both figure and panel are explicitly null - this is a manuscript assignment
          return 'Manuscript'
        }
        return null
      }).filter((label): label is string => label !== null)
    }

    // For zip files, combine the zip file's own assignments with nested elements' assignments
    if (isZipFile(node)) {
      // Add the zip file's own assignments
      if (node.file) {
        const assignedTo = node.file.assigned_to || (node.file as any).assignedTo
        if (assignedTo && assignedTo.length > 0) {
          mappings.push(...extractLabelsFromAssignments(assignedTo))
        }
      }

      // Add assignments from nested elements (recursively)
      const collectNestedAssignments = (children: TreeNode[]) => {
        children.forEach(child => {
          if (child.file) {
            const assignedTo = child.file.assigned_to || (child.file as any).assignedTo
            if (assignedTo && assignedTo.length > 0) {
              mappings.push(...extractLabelsFromAssignments(assignedTo))
            }
          }
          // Recursively check nested children
          if (child.children) {
            collectNestedAssignments(child.children)
          }
        })
      }

      if (node.children) {
        collectNestedAssignments(node.children)
      }
    } else {
      // For regular folders, only show immediate children assignments
      if (node.children) {
        node.children.forEach(child => {
          // Handle both regular files and zip files
          if ((child.type === 'file' || isZipFile(child)) && child.file) {
            const assignedTo = child.file.assigned_to || (child.file as any).assignedTo
            if (assignedTo && assignedTo.length > 0) {
              mappings.push(...extractLabelsFromAssignments(assignedTo))
            }
          }
        })
      }
    }

    const uniqueMappings = [...new Set(mappings)]
    return uniqueMappings
  }

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id)
    const isSelected = selectedFiles.has(node.id)
    const indent = level * 20
    const isZip = isZipFile(node)

    if (node.type === 'file') {
      const selectedValues = mappingTargets[node.id] || []
    }

    if (node.type === 'folder' || node.type === 'zip') {
      return (
        <div key={node.id}>
          <div className="flex items-center gap-2 py-2 px-2 hover:bg-muted/50 min-h-12">
            {/* Checkbox for zip files (selectable like files) */}
            {isZip && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleFileSelection(node.id)}
                className="h-4 w-4 cursor-pointer flex-shrink-0"
              />
            )}

            {/* Folder structure with indentation */}
            <div
              className="flex items-center gap-2 flex-1"
              style={{ paddingLeft: `${indent}px` }}
            >
              {/* Expand/collapse button */}
              <button
                onClick={() => toggleFolder(node.id)}
                className="flex items-center gap-1 hover:bg-muted rounded p-1 cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                {isZip ? (
                  <Archive className="h-4 w-4 text-orange-500" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-500" />
                )}
                <span className="font-medium">{node.name}</span>
              </button>

              {/* Display immediate children mappings */}
              {(() => {
                const mappings = getImmediateChildrenMappings(node)

                return mappings.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-2">
                      {mappings.map((mapping, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {mapping}
                        </Badge>
                      ))}
                  </div>
                )
              })()}

              {/* MultiSelect for zip files - right next to file name */}
              {isZip && (
                <div className="flex-1 min-w-0">
                  <MultiSelect
                    options={allAvailableElements}
                    selected={mappingTargets[node.id] || []}
                    onSelectionChange={(selected) => handleMappingChange(node.id, selected)}
                    placeholder="Map to..."
                    className="w-full min-h-8 text-xs"
                  />
                </div>
              )}

              <Badge variant="outline" className="ml-auto">
                {node.children?.length || 0}
              </Badge>
            </div>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderTreeNode(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    // File node (only for regular files, not zip files)
    if (node.type === 'file') {
      return (
        <div
          key={node.id}
          className={`flex items-start gap-2 py-2 px-2 hover:bg-muted/50 min-h-12 ${isSelected ? 'bg-muted' : ''}`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleFileSelection(node.id)}
            className="h-4 w-4 cursor-pointer mt-1 flex-shrink-0"
          />
          {/* File structure with indentation */}
          <div
            className="flex items-center gap-2 flex-1"
            style={{ paddingLeft: `${indent + 20}px` }}
          >
            <File className="h-4 w-4 text-gray-500 flex-shrink-0" />

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium flex-shrink-0">{node.file?.name}</span>

              {/* MultiSelect for file assignments - right next to file name */}
              <div className="flex-1 min-w-50">
                <MultiSelect
                  options={allAvailableElements}
                  selected={mappingTargets[node.id] || []}
                  onSelectionChange={(selected) => handleMappingChange(node.id, selected)}
                  placeholder="Map to..."
                  className="min-h-8 min-w-50 text-xs"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )
    }

    // This should not happen with the new type system
    return null
  }

  return (
    <Card>
      {/* Notification Display */}
      {bulkMappingNotification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          bulkMappingNotification.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {bulkMappingNotification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
          <span className="text-sm font-medium">{bulkMappingNotification.message}</span>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              Source Files
              {shouldShowLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeftNav(!showLeftNav)}
                className="gap-2 cursor-pointer"
                title={showLeftNav ? "Hide navigation" : "Show navigation"}
              >
                {showLeftNav ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Nav
              </Button>
              {folderCount > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={expandAll}
                    className="gap-2 cursor-pointer"
                    disabled={shouldShowLoading}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Expand All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={collapseAll}
                    className="gap-2 cursor-pointer"
                    disabled={shouldShowLoading}
                  >
                    <FolderClosed className="w-4 h-4" />
                    Collapse All
                  </Button>
                </>
              )}
            </div>
          </div>
          {!shouldShowLoading && sourceFiles.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Files: {sourceFiles.length}</span>
              <span>Folders: {folderCount}</span>
              <span>Selectable: {selectableItemCount}</span>
              <span>Selected: {selectedFiles.size}</span>

              {/* Select for bulk mapping - appears when files are selected */}
              {selectedFiles.size > 0 && (
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm font-medium text-gray-700">Map selected to:</span>
                  <div className="min-w-[250px]">
                    <Select
                      value={bulkMappingTarget}
                      onValueChange={async (value) => {
                        setBulkMappingTarget(value)
                        // Auto-trigger mapping when target is selected
                        if (value && selectedFiles.size > 0) {
                          setIsBulkMapping(true)

                          try {
                            // Find the target element details
                            const targetElement = allAvailableElements.find(el => el.value === value)

                            if (!targetElement) {
                              throw new Error('Invalid mapping target')
                            }

                            let successCount = 0
                            let errorCount = 0
                            const errors: string[] = []

                            // Map each selected file to the target
                            for (const fileId of Array.from(selectedFiles)) {
                              try {
                                const fileIdNum = parseInt(fileId)

                                // Call the appropriate API endpoint based on the target
                                if (targetElement.panel_id) {
                                  await api.sourceData.assignToPanel(
                                    manuscriptId,
                                    targetElement.figure_id!.toString(),
                                    targetElement.panel_id.toString(),
                                    fileIdNum
                                  )
                                } else if (targetElement.figure_id) {
                                  await api.sourceData.assignToFigure(
                                    manuscriptId,
                                    targetElement.figure_id.toString(),
                                    fileIdNum
                                  )
                                } else {
                                  await api.sourceData.assignToManuscript(manuscriptId, fileIdNum)
                                }

                                successCount++

                                // Update local mapping state
                                setMappingTargets(prev => {
                                  const currentMappings = prev[fileId] || []
                                  if (!currentMappings.includes(value)) {
                                    return {
                                      ...prev,
                                      [fileId]: [...currentMappings, value]
                                    }
                                  }
                                  return prev
                                })
                              } catch (error) {
                                errorCount++
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                                errors.push(`File ${fileId}: ${errorMessage}`)
                                console.error(`Failed to map file ${fileId}:`, error)
                              }
                            }

                            // Show notification
                            if (errorCount === 0) {
                              setBulkMappingNotification({
                                type: 'success',
                                message: `Successfully mapped ${successCount} file${successCount !== 1 ? 's' : ''} to ${targetElement.label}`
                              })
                            } else if (successCount > 0) {
                              setBulkMappingNotification({
                                type: 'success',
                                message: `Mapped ${successCount} file${successCount !== 1 ? 's' : ''}, ${errorCount} failed`
                              })
                            } else {
                              setBulkMappingNotification({
                                type: 'error',
                                message: `Failed to map files: ${errors[0] || 'Unknown error'}`
                              })
                            }

                            // Trigger refresh if callback provided
                            if (onRefresh && successCount > 0) {
                              setTimeout(() => {
                                onRefresh()
                              }, 500)
                            }

                            // Clear selection on success
                            if (successCount > 0) {
                              setBulkMappingTarget('')
                              setSelectedFiles(new Set())
                            }
                          } catch (error) {
                            console.error('Bulk mapping error:', error)
                            setBulkMappingNotification({
                              type: 'error',
                              message: error instanceof Error ? error.message : 'Failed to perform bulk mapping'
                            })
                          } finally {
                            setIsBulkMapping(false)
                          }
                        }
                      }}
                      disabled={isBulkMapping}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select target..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allAvailableElements.map((element) => (
                          <SelectItem key={element.value} value={element.value}>
                            {element.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {isBulkMapping && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardHeader>
      </div>

      {/* Main Content Area with Left Nav */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Navigation Panel */}
        {showLeftNav && (
          <div className="w-64 border-r bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Linked Items
              </h3>
              <div className="space-y-1">
                {treeNodes.map((node) => {
                  const linkedInfo = getFirstChildLinkedInfo(node)
                  const nodeId = node.id
                  const isFolder = node.type === 'folder'
                  const isZip = node.type === 'zip'

                  return (
                    <button
                      key={nodeId}
                      onClick={() => {
                        // Expand the folder/zip in main tree
                        if (isFolder || isZip) {
                          setExpandedFolders(prev => {
                            const newSet = new Set(prev)
                            newSet.add(nodeId)
                            return newSet
                          })
                        }
                        // Scroll to the item (simplified - you could add ref scrolling)
                      }}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-200 transition-colors text-sm group"
                    >
                      <div className="flex items-center gap-2">
                        {isZip ? (
                          <Archive className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        ) : isFolder ? (
                          <Folder className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        ) : (
                          <File className="w-3 h-3 text-gray-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate" title={node.name}>
                            {node.name}
                          </div>
                          {linkedInfo && (
                            <div className="text-xs text-blue-600 truncate" title={`Linked to: ${linkedInfo}`}>
                              → {linkedInfo}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
                {treeNodes.length === 0 && !shouldShowLoading && (
                  <div className="text-xs text-gray-500 text-center py-4">
                    No items to display
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Main Content */}
        <CardContent className="p-0 flex-1 overflow-y-auto">
          {error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg m-4">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-red-800">Error loading source data: {error}</span>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="ml-auto gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </Button>
              )}
            </div>
          ) : shouldShowLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading source data files...</p>
              </div>
            </div>
          ) : sourceFiles.length === 0 ? (
            <div className="text-center py-8">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No source data files available</p>
            </div>
          ) : (
          <div className="border rounded-md">
            {treeNodes.map(node => renderTreeNode(node))}
          </div>
          )}
        </CardContent>
      </div>

    </Card>
  )
}
