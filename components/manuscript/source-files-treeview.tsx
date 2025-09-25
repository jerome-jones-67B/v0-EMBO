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
import type { SourceDataFile } from "@/types/manuscript-detail"

interface SourceFilesTreeviewProps {
  sourceFiles: SourceDataFile[]
  isLoading?: boolean
  error?: string | null
  onRefresh?: () => void
}

interface TreeNode {
  id: string
  name: string
  type: 'folder' | 'file'
  children?: TreeNode[]
  file?: SourceDataFile
}

export function SourceFilesTreeview({ sourceFiles, isLoading = false, error = null, onRefresh }: SourceFilesTreeviewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [mappingTarget, setMappingTarget] = useState<Record<string, string>>({})

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
        if (file.name.includes('/')) {
          filePath = file.name
        } else {
          // Put uncategorized files in a default folder based on file type
          const fileType = file.type?.toLowerCase().replace(/\s+/g, '_') || 'uncategorized'
          filePath = `${fileType}/${file.name}`
        }
      }
      
      // Split path into segments
      const pathSegments = filePath.split('/').filter(segment => segment.length > 0)
      
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

  const handleMappingChange = (fileId: string, target: string) => {
    setMappingTarget(prev => ({
      ...prev,
      [fileId]: target
    }))
  }

  const expandAll = () => {
    const allFolderIds = getAllFolderIds(treeNodes)
    setExpandedFolders(new Set(allFolderIds))
  }

  const collapseAll = () => {
    setExpandedFolders(new Set())
  }

  // Get mapping indicators for a directory based on its children
  const getDirectoryMappingIndicators = (node: TreeNode): string[] => {
    if (!node.children) return []
    
    const mappings = new Set<string>()
    
    const collectMappings = (children: TreeNode[]) => {
      children.forEach(child => {
        if (child.type === 'file' || isZipFolder(child)) {
          const mapping = mappingTarget[child.id]
          if (mapping) {
            mappings.add(mapping)
          }
        } else if (child.children) {
          collectMappings(child.children)
        }
      })
    }
    
    collectMappings(node.children)
    return Array.from(mappings)
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
          <div className="flex items-center gap-2 py-2 px-2 hover:bg-muted/50">
            {/* Mapping dropdown/indicators - always at left, no indentation */}
            {isZip ? (
              <Select
                value={mappingTarget[node.id] || ""}
                onValueChange={(value) => handleMappingChange(node.id, value)}
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Map to..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="figure-1">Figure 1</SelectItem>
                  <SelectItem value="figure-2">Figure 2</SelectItem>
                  <SelectItem value="supplement">Supplement</SelectItem>
                  <SelectItem value="manuscript">Manuscript</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              /* Mapping indicators for regular directories */
              <div className="w-32 flex flex-wrap gap-1">
                {directoryMappings.length > 0 ? (
                  directoryMappings.map((mapping, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                      {mapping.replace(/-/g, ' ')}
                    </Badge>
                  ))
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
                className="h-4 w-4"
              />
            )}
            
            {/* Folder structure with indentation */}
            <div 
              className="flex items-center gap-1 flex-1"
              style={{ paddingLeft: `${indent}px` }}
            >
              {/* Expand/collapse button */}
              <button
                onClick={() => toggleFolder(node.id)}
                className="flex items-center gap-1 hover:bg-muted rounded p-1"
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
        className={`flex items-center gap-2 py-2 px-2 hover:bg-muted/50 ${isSelected ? 'bg-muted' : ''}`}
      >
        {/* Mapping dropdown - always at left, no indentation */}
        <Select
          value={mappingTarget[node.id] || ""}
          onValueChange={(value) => handleMappingChange(node.id, value)}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Map to..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="figure-1">Figure 1</SelectItem>
            <SelectItem value="figure-2">Figure 2</SelectItem>
            <SelectItem value="supplement">Supplement</SelectItem>
            <SelectItem value="manuscript">Manuscript</SelectItem>
          </SelectContent>
        </Select>
        
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleFileSelection(node.id)}
          className="h-4 w-4"
        />
        
        {/* File structure with indentation */}
        <div 
          className="flex items-center gap-2 flex-1"
          style={{ paddingLeft: `${indent + 20}px` }}
        >
          <File className="h-4 w-4 text-gray-500" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{node.file?.name}</span>
              {hasValidSize(node.file?.size) && (
                <Badge variant="secondary" className="text-xs">
                  {node.file?.size}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {node.file?.description}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Source Files
            {isLoading && (
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
                  title="Expand all folders"
                >
                  <FolderOpen className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={collapseAll}
                  title="Collapse all folders"
                >
                  <FolderClosed className="w-4 h-4" />
                </Button>
              </>
            )}
            {onRefresh && !isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                title="Refresh source data"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Files: {sourceFiles.length}</span>
          <span>Folders: {folderCount}</span>
          <span>Selectable: {selectableItemCount}</span>
          <span>Selected: {selectedFiles.size}</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg m-4">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-red-800">Error loading source data: {error}</span>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="ml-auto"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}
          </div>
        ) : isLoading ? (
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
        
        {selectedFiles.size > 0 && (
          <div className="p-4 border-t bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedFiles.size} items selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Bulk Download
                </Button>
                <Button variant="outline" size="sm">
                  Bulk Map
                </Button>
                <Button variant="destructive" size="sm">
                  Remove Selected
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
