"use client"

import { useState, useEffect } from "react"
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

interface SourceFilesTreeviewProps {
  sourceFiles: SourceDataFile[]
  isLoading?: boolean
  error?: string | null
  onRefresh?: () => void
  availableElements?: { value: string; label: string }[]
}

interface TreeNode {
  id: string
  name: string
  type: 'folder' | 'file'
  children?: TreeNode[]
  file?: SourceDataFile
}

export function SourceFilesTreeview({ 
  sourceFiles, 
  isLoading = false, 
  error = null, 
  onRefresh,
  availableElements = [
    { value: 'manuscript', label: 'Manuscript' },
    { value: 'fig1', label: 'Figure 1' },
    { value: 'fig1a', label: 'Figure 1A' },
    { value: 'fig1b', label: 'Figure 1B' },
    { value: 'fig1c', label: 'Figure 1C' },
    { value: 'fig2', label: 'Figure 2' },
    { value: 'fig2a', label: 'Figure 2A' },
    { value: 'fig2b', label: 'Figure 2B' },
    { value: 'fig2c', label: 'Figure 2C' },
    { value: 'fig2d', label: 'Figure 2D' },
    { value: 'supplement', label: 'Supplementary' }
  ]
}: SourceFilesTreeviewProps) {
  // Show loading state if we're loading or if we have no files and no error (initial state)
  const shouldShowLoading = isLoading || (sourceFiles.length === 0 && !error)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [mappingTargets, setMappingTargets] = useState<Record<string, string[]>>({})

  // Organize files into a tree structure based on file paths
  const organizeFilesIntoTree = (files: SourceDataFile[]): TreeNode[] => {
    const root: TreeNode = {
      id: 'root',
      name: 'root',
      type: 'folder',
      children: []
    }

    files.forEach(file => {
      // Get file path from originalUri first, then URL, or use a default path
      let filePath = ''
      
      // Try originalUri first (most accurate)
      if ((file as any).originalUri) {
        filePath = (file as any).originalUri
      }
      // Fall back to URL/URI
      else if (file.url) {
        try {
          const url = new URL(file.url, window.location.origin)
          filePath = url.pathname
        } catch {
          // If URL parsing fails, use the URL as-is
          filePath = file.url
        }
      }
      
      // Remove API prefixes and clean up the path
      filePath = filePath
        .replace(/^\/api\/v1\/manuscripts\/[^\/]+\/files\/[^\/]+\/download/, '') // Remove API download path
        .replace(/^\/api\/files\//, '') // Remove simple API path
        .replace(/^\/files\//, '') // Remove files prefix
        .replace(/^\/+/, '') // Remove leading slashes
      
      // If no meaningful path, try to extract from the filename or use a default
      if (!filePath && file.name) {
        // If filename contains path-like structure, use it
        if (file.name.includes('/') || file.name.includes(':')) {
          filePath = file.name
        } else {
          // Put uncategorized files in a default folder based on file type
          const fileType = file.type?.toLowerCase().replace(/\s+/g, '_') || 'uncategorized'
          filePath = `${fileType}/${file.name}`
        }
      }
      
      // Split path into segments (treat both '/' and ':' as separators, especially for zip files)
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
      const fileName = rawFileName.split('/').pop() || rawFileName
      
      const fileNode: TreeNode = {
          id: file.id,
        name: fileName,
        type: 'file',
        file: {
          ...file,
          name: fileName // Update the file object name too for consistency
        }
      }
      
      if (!currentNode.children) currentNode.children = []
      currentNode.children.push(fileNode)
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

  // Check if a folder is a zip file
  const isZipFolder = (node: TreeNode): boolean => {
    return node.type === 'folder' && node.name.toLowerCase().endsWith('.zip')
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

  // Count selectable items (files + zip folders)
  const countSelectableItems = (nodes: TreeNode[]): number => {
    return nodes.reduce((count, node) => {
      if (node.type === 'file' || isZipFolder(node)) {
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

  const handleMappingChange = (fileId: string, selectedValues: string[]) => {
    setMappingTargets(prev => ({
      ...prev,
      [fileId]: selectedValues
    }))
  }

  // Initialize mapping targets from API data
  useEffect(() => {
    const initialMappings: Record<string, string[]> = {}
    sourceFiles.forEach(file => {
      if (file.mappedElements && file.mappedElements.length > 0) {
        initialMappings[file.id] = [...file.mappedElements]
      }
    })
    setMappingTargets(initialMappings)
  }, [sourceFiles])

  const expandAll = () => {
    const allFolderIds = getAllFolderIds(treeNodes)
    setExpandedFolders(new Set(allFolderIds))
  }

  const collapseAll = () => {
    setExpandedFolders(new Set())
  }

  // Get mapping indicators for a directory based on its immediate children only
  const getDirectoryMappingIndicators = (node: TreeNode): string[] => {
    if (!node.children) return []
    
    const mappings = new Set<string>()
    
    // Only collect mappings from immediate children, not nested ones
    node.children.forEach(child => {
      if (child.type === 'file' || isZipFolder(child)) {
        const fileMappings = mappingTargets[child.id] || []
        fileMappings.forEach(mapping => mappings.add(mapping))
      }
    })
    
    return Array.from(mappings)
  }

  const getFileMappingLabels = (fileId: string): string[] => {
    const mappings = mappingTargets[fileId] || []
    return mappings.map(value => 
      availableElements.find(element => element.value === value)?.label || value
    )
  }

  // Auto-expand all folders when files change
  useEffect(() => {
    if (sourceFiles.length > 0 && treeNodes.length > 0) {
      const allFolderIds = getAllFolderIds(treeNodes)
      setExpandedFolders(new Set(allFolderIds))
    }
  }, [sourceFiles.length, treeNodes.length])

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id)
    const isSelected = selectedFiles.has(node.id)
    const indent = level * 20
    const isZip = isZipFolder(node)

    if (node.type === 'folder') {
      const directoryMappings = getDirectoryMappingIndicators(node)
      
      return (
        <div key={node.id}>
          <div className="flex items-start gap-2 py-2 px-2 hover:bg-muted/50 min-h-12">
            {/* Mapping dropdown/indicators - always at left, no indentation */}
            {isZip ? (
              <div className="w-72 min-w-72">
                <MultiSelect
                  options={availableElements}
                  selected={mappingTargets[node.id] || []}
                  onSelectionChange={(selected) => handleMappingChange(node.id, selected)}
                  placeholder="Map to..."
                  className="w-full min-h-8 text-xs"
                />
              </div>
            ) : (
              /* Mapping indicators for regular directories */
              <div className="w-72 min-w-72 flex flex-wrap gap-1 py-1">
                {directoryMappings.length > 0 ? (
                  directoryMappings.map((mapping, idx) => {
                    const label = availableElements.find(el => el.value === mapping)?.label || mapping
                    return (
                      <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                        {label}
                      </Badge>
                    )
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">No mappings</span>
                )}
              </div>
            )}
            
            {/* Checkbox for zip folders (selectable like files) */}
            {isZip && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleFileSelection(node.id)}
                className="h-4 w-4 cursor-pointer mt-1 flex-shrink-0"
              />
            )}
            
            {/* Folder structure with indentation */}
            <div 
              className="flex items-start gap-1 flex-1"
              style={{ paddingLeft: `${indent}px` }}
            >
            {/* Expand/collapse button */}
            <button
              onClick={() => toggleFolder(node.id)}
              className="flex items-center gap-1 hover:bg-muted rounded p-1 cursor-pointer mt-1"
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
              
              <Badge variant="outline" className="ml-auto mt-1">
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
        {/* Mapping dropdown - always at left, no indentation */}
        <div className="w-72 min-w-72">
          <MultiSelect
            options={availableElements}
            selected={mappingTargets[node.id] || []}
            onSelectionChange={(selected) => handleMappingChange(node.id, selected)}
            placeholder="Map to..."
            className="w-full min-h-8 text-xs"
          />
        </div>
        
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleFileSelection(node.id)}
          className="h-4 w-4 cursor-pointer mt-1 flex-shrink-0"
        />
        
        {/* File structure with indentation */}
        <div 
          className="flex items-start gap-2 flex-1"
          style={{ paddingLeft: `${indent + 20}px` }}
        >
          <File className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{node.file?.name}</span>
              {hasValidSize(node.file?.size) && (
                <Badge variant="secondary" className="text-xs">
                  {node.file?.size}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {node.file?.description}
            </div>
            
            {/* Display current API mappings */}
            {node.file?.mappedElements && node.file.mappedElements.length > 0 && (
              <div className="w-full mt-2">
                <div className="text-xs text-muted-foreground mb-1">API mappings:</div>
                <div className="flex flex-wrap gap-1">
                  {node.file.mappedElements.map((mapping, idx) => {
                    const label = availableElements.find(el => el.value === mapping)?.label || mapping
                    return (
                      <Badge key={idx} variant="outline" className="text-xs px-1 py-0 mb-1">
                        {label}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-start gap-2 mt-1">
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
