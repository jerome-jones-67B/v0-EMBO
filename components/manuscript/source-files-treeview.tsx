"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, File, Folder, MoreHorizontal, Download, Link2, Eye } from "lucide-react"
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
}

interface TreeNode {
  id: string
  name: string
  type: 'folder' | 'file'
  children?: TreeNode[]
  file?: SourceDataFile
}

export function SourceFilesTreeview({ sourceFiles }: SourceFilesTreeviewProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [mappingTarget, setMappingTarget] = useState<Record<string, string>>({})

  // Organize files into a tree structure
  const organizeFilesIntoTree = (files: SourceDataFile[]): TreeNode[] => {
    const tree: TreeNode[] = []
    const folderMap = new Map<string, TreeNode>()

    // Group files by type
    const filesByType = files.reduce((acc, file) => {
      const type = file.type || 'Other'
      if (!acc[type]) acc[type] = []
      acc[type].push(file)
      return acc
    }, {} as Record<string, SourceDataFile[]>)

    // Create folder nodes for each type
    Object.entries(filesByType).forEach(([type, typeFiles]) => {
      const folderId = `folder-${type.toLowerCase().replace(/\s+/g, '-')}`
      const folderNode: TreeNode = {
        id: folderId,
        name: type,
        type: 'folder',
        children: typeFiles.map(file => ({
          id: file.id,
          name: file.name,
          type: 'file' as const,
          file
        }))
      }
      tree.push(folderNode)
      folderMap.set(folderId, folderNode)
    })

    return tree
  }

  const treeNodes = organizeFilesIntoTree(sourceFiles)

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

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id)
    const isSelected = selectedFiles.has(node.id)
    const indent = level * 20

    if (node.type === 'folder') {
      return (
        <div key={node.id}>
          <div 
            className="flex items-center gap-2 py-2 px-2 hover:bg-muted/50 cursor-pointer"
            style={{ paddingLeft: `${8 + indent}px` }}
            onClick={() => toggleFolder(node.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Folder className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{node.name}</span>
            <Badge variant="outline" className="ml-auto">
              {node.children?.length || 0}
            </Badge>
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
        style={{ paddingLeft: `${8 + indent + 20}px` }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleFileSelection(node.id)}
          className="h-4 w-4"
        />
        <File className="h-4 w-4 text-gray-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{node.file?.name}</span>
            <Badge variant="secondary" className="text-xs">
              {node.file?.size}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {node.file?.description}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
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
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Source Files</CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total files: {sourceFiles.length}</span>
          <span>Selected: {selectedFiles.size}</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border rounded-md">
          {treeNodes.map(node => renderTreeNode(node))}
        </div>
        
        {selectedFiles.size > 0 && (
          <div className="p-4 border-t bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedFiles.size} files selected
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
