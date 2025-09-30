"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ChevronDown, ChevronRight, File, Folder, MoreHorizontal, Download, Link2, Eye, RotateCcw, AlertTriangle, FolderOpen, FolderClosed, Archive, FileArchive } from "lucide-react"
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
import type { SourceDataFile } from "@/types/manuscript-detail"
import type { FigureDetails, ManuscriptFileDetails } from "@/lib/types"
import type { Figure } from "@/types/manuscript-detail"

interface SourceFilesTreeviewProps {
  sourceFiles: ManuscriptFileDetails[]
  figures?: Figure[]
  isLoading?: boolean
  error?: string | null
  onRefresh?: () => void
  onAssignmentChange?: (fileId: number, figureId?: number, panelId?: number) => Promise<void>
}

interface TreeNode {
  id: string
  name: string
  type: 'folder' | 'file'
  children?: TreeNode[]
  file?: ManuscriptFileDetails
}

export function SourceFilesTreeview({ 
  sourceFiles, 
  figures = [],
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

  // Organize files into a tree structure based on file paths
  const organizeFilesIntoTree = (files: ManuscriptFileDetails[]): TreeNode[] => {
    const root: TreeNode = {
      id: 'root',
      name: 'root',
      type: 'folder',
      children: []
    }

    files.forEach(file => {
      const fileName = file.name || ''
      const isZipFile = fileName.toLowerCase().endsWith('.zip')
      
      if (isZipFile) {
        // For zip files, create them as standalone files at the root level
        const zipFileNode: TreeNode = {
          id: file.id.toString(),
          name: fileName,
          type: 'file',
          children: [], // Can have children but treated as file
          file: {
            ...file,
            name: fileName
          }
        }
        
        if (!root.children) root.children = []
        root.children.push(zipFileNode)
      } else {
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
    return node.type === 'file' && node.name.toLowerCase().endsWith('.zip')
  }

  // Check if file size should be displayed
  const hasValidSize = (size: string | null | undefined): boolean => {
    return !!(size && size !== 'Unknown' && size !== null && size.trim() !== '')
  }

  // Expand/Collapse all folders utility
  const getAllFolderIds = (nodes: TreeNode[]): string[] => {
    const folderIds: string[] = []
    nodes.forEach(node => {
      if (node.type === 'folder') {
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
      if (node.type === 'folder') {
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
    // Update local state immediately for UI responsiveness
    setMappingTargets(prev => ({
      ...prev,
      [fileId]: selectedValues
    }))

    // If onAssignmentChange is provided, make API calls for new assignments
    if (onAssignmentChange) {
      const currentAssignments = mappingTargets[fileId] || []
      const newAssignments = selectedValues.filter(value => !currentAssignments.includes(value))
      
      // Make API calls for each new assignment
      for (const assignmentValue of newAssignments) {
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
          console.error('Error updating assignment:', error)
          // Revert the UI change on error
          setMappingTargets(prev => ({
            ...prev,
            [fileId]: currentAssignments
          }))
        }
      }
    }
  }, [onAssignmentChange, allAvailableElements, mappingTargets])

  // Initialize mapping targets from API data
  useEffect(() => {
    if (!sourceFiles.length) {
      setMappingTargets({})
      return
    }

    const initialMappings: Record<string, string[]> = {}
    
    sourceFiles.forEach(file => {
      const assignedTo = file.assigned_to || (file as any).assignedTo
      
      if (assignedTo && assignedTo.length > 0) {
        const assignments = assignedTo.map(assignment => {
          // Handle the standard structure: { figure_id, panel_id }
          if (assignment.figure_id !== undefined) {
            if (assignment.figure_id && assignment.panel_id) {
              // Both figure_id and panel_id are set - this is a panel assignment
              return `panel-${assignment.figure_id}-${assignment.panel_id}`
            } else if (assignment.figure_id && (assignment.panel_id === null || assignment.panel_id === undefined)) {
              // Only figure_id is set - this is a figure assignment
              return `figure-${assignment.figure_id}`
            }
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
  }, [sourceFiles.length]) // Only depend on sourceFiles.length to prevent infinite loops

  const expandAll = () => {
    const allFolderIds = getAllFolderIds(treeNodes)
    setExpandedFolders(new Set(allFolderIds))
  }

  const collapseAll = () => {
    setExpandedFolders(new Set())
  }


  // Auto-expand only folders containing files with assignments
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
          }
        })
        
        return hasAnyAssignments
      }
      
      findFoldersWithAssignments(treeNodes)
      setExpandedFolders(foldersWithAssignments)
    }
  }, [sourceFiles.length, treeNodes.length])

  // Helper function to get immediate children mappings for a folder
  const getImmediateChildrenMappings = (node: TreeNode): string[] => {
    if (node.type !== 'folder') return []
    
    const mappings: string[] = []
    
    // Helper function to extract labels from assignments
    const extractLabelsFromAssignments = (assignedTo: any[]) => {
      return assignedTo.map(assignment => {
        if (assignment.figure_id && assignment.panel_id) {
          const figure = figures.find(f => f.id === assignment.figure_id)
          
          if (figure) {
            const panel = figure.panels?.find(p => p.id === assignment.panel_id)
            
            if (panel) {
              return `${figure.label || `Figure ${figure.id}`}${panel.label || `Panel ${panel.id}`}`
            } else {
              // Panel not found - ignore this assignment
              
              return null
            }
          } else {
            // Figure not found - ignore this assignment
            
            return null
          }
        } else if (assignment.figure_id) {
          // Find the matching figure (figure only, no panel)
          
          const figure = figures.find(f => f.id === assignment.figure_id)
          
          if (figure) {
            return figure.label || `Figure ${figure.id}`
          } else {
            // Figure not found - ignore this assignment
            console.log(`Figure ${assignment.figure_id} not found`)
            return null
          }
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

    if (node.type === 'file' || isZip) {
      const selectedValues = mappingTargets[node.id] || []
    }

    if (node.type === 'folder' || isZip) {
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

    // File node
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
          {isZip ? (
            <Archive className="h-4 w-4 text-orange-500 flex-shrink-0" />
          ) : (
            <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
          )}
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-medium flex-shrink-0">{node.file?.name}</span>
            
            {/* MultiSelect for file assignments - right next to file name */}
            <div className="flex-1 min-w-0">
              <MultiSelect
                options={allAvailableElements}
                selected={mappingTargets[node.id] || []}
                onSelectionChange={(selected) => handleMappingChange(node.id, selected)}
                placeholder="Map to..."
                className="w-full min-h-8 text-xs"
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

  return (
    <Card>
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
            </div>
          )}
        </CardHeader>
      </div>
      {/* Scrollable Content */}
      <CardContent className="p-0 h-[calc(100vh-200px)] overflow-y-auto">
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
        
      {selectedFiles.size > 0 && (
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedFiles.size} items selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="cursor-pointer">
                Bulk Download
              </Button>
              <Button variant="outline" size="sm" className="cursor-pointer">
                Bulk Map
              </Button>
              <Button variant="destructive" size="sm" className="cursor-pointer">
                Remove Selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
