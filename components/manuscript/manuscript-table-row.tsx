"use client"

import { useState } from "react"
import { MoreHorizontal, Download, Eye, UserPlus, UserX, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TableCell, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Manuscript, Priority, ColumnVisibility, DownloadProgress } from "@/types/manuscript"
import { formatDate } from "@/lib/utils/date-utils"

interface ManuscriptTableRowProps {
  manuscript: Manuscript
  isSelected: boolean
  onToggleSelection: (manuscriptId: string) => void
  columnVisibility: ColumnVisibility
  downloadProgress: DownloadProgress
  onDownload: (manuscriptId: string) => void
  onToggleOnHold: (manuscriptId: string) => void
  onChangePriority: (manuscriptId: string, priority: Priority) => void
  onAssignToMe: (manuscriptId: string) => void
  onUnassignFromMe: (manuscriptId: string) => void
}

export function ManuscriptTableRow({
  manuscript,
  isSelected,
  onToggleSelection,
  columnVisibility,
  downloadProgress,
  onDownload,
  onToggleOnHold,
  onChangePriority,
  onAssignToMe,
  onUnassignFromMe
}: ManuscriptTableRowProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  
  const progress = downloadProgress[manuscript.id]
  const isAssignedToMe = manuscript.assignedTo === 'Dr. Sarah Chen'
  const isOnHold = manuscript.workflowState === 'on-hold'

  const handleDownload = async () => {
    if (isDownloading || progress?.status === 'downloading') return
    
    setIsDownloading(true)
    try {
      await onDownload(manuscript.id)
    } finally {
      setIsDownloading(false)
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const StatusIndicator = () => {
    if (manuscript.hasErrors) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Has validation errors</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    
    if (manuscript.hasWarnings) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Has warnings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    
    return (
      <CheckCircle className="h-4 w-4 text-success" />
    )
  }

  return (
    <TableRow className={isSelected ? "bg-muted/50" : ""}>
      {/* Selection Checkbox */}
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(manuscript.id)}
          aria-label={`Select manuscript ${manuscript.msid}`}
        />
      </TableCell>

      {/* Received Date */}
      {columnVisibility.receivedDate && (
        <TableCell className="text-sm">
          {formatDate(manuscript.receivedDate)}
        </TableCell>
      )}

      {/* Title */}
      {columnVisibility.title && (
        <TableCell className="max-w-[300px]">
          <div className="space-y-1">
            <Link 
              href={`/manuscript/${manuscript.id}`} 
              className="font-medium hover:underline line-clamp-2"
            >
              {manuscript.title}
            </Link>
            <div className="text-xs text-muted-foreground">
              ID: {manuscript.msid}
            </div>
          </div>
        </TableCell>
      )}

      {/* Authors */}
      {columnVisibility.authors && (
        <TableCell className="max-w-[200px]">
          <span className="text-sm line-clamp-2">{manuscript.authors}</span>
        </TableCell>
      )}

      {/* DOI */}
      {columnVisibility.doi && (
        <TableCell className="text-sm">
          {manuscript.doi ? (
            <a 
              href={`https://doi.org/${manuscript.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {manuscript.doi}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
      )}

      {/* Assigned To */}
      {columnVisibility.assignedTo && (
        <TableCell className="text-sm">
          {manuscript.assignedTo || (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </TableCell>
      )}

      {/* Status */}
      {columnVisibility.status && (
        <TableCell>
          <div className="flex items-center gap-2">
            <Badge variant={manuscript.badgeVariant}>
              {manuscript.displayStatus}
            </Badge>
            <StatusIndicator />
          </div>
        </TableCell>
      )}

      {/* Priority */}
      {columnVisibility.priority && (
        <TableCell>
          <Badge variant={getPriorityColor(manuscript.priority)}>
            {manuscript.priority}
          </Badge>
        </TableCell>
      )}

      {/* Actions */}
      {columnVisibility.actions && (
        <TableCell>
          <div className="flex items-center gap-1">
            {/* View Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/manuscript/${manuscript.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Download Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDownload}
                    disabled={isDownloading || progress?.status === 'downloading'}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download manuscript</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Assignment Actions */}
                {isAssignedToMe ? (
                  <DropdownMenuItem onClick={() => onUnassignFromMe(manuscript.id)}>
                    <UserX className="mr-2 h-4 w-4" />
                    Unassign from me
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onAssignToMe(manuscript.id)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign to me
                  </DropdownMenuItem>
                )}

                {/* Hold Status */}
                <DropdownMenuItem onClick={() => onToggleOnHold(manuscript.id)}>
                  <Clock className="mr-2 h-4 w-4" />
                  {isOnHold ? 'Remove from hold' : 'Put on hold'}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Priority Actions */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Change Priority
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {(['urgent', 'high', 'medium', 'low'] as Priority[]).map(priority => (
                      <DropdownMenuItem 
                        key={priority}
                        onClick={() => onChangePriority(manuscript.id, priority)}
                        disabled={manuscript.priority === priority}
                      >
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        {manuscript.priority === priority && " (current)"}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      )}
    </TableRow>
  )
}