"use client"

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SortState, SortField, ColumnVisibility, Manuscript } from "@/types/manuscript"

interface ManuscriptTableHeaderProps {
  sort: SortState
  onSort: (field: SortField, direction?: 'asc' | 'desc') => void
  columnVisibility: ColumnVisibility
  selectedManuscripts: Set<string>
  filteredManuscripts: Manuscript[]
  onSelectAll: (manuscripts: Manuscript[]) => void
  onClearSelection: () => void
}

export function ManuscriptTableHeader({
  sort,
  onSort,
  columnVisibility,
  selectedManuscripts,
  filteredManuscripts,
  onSelectAll,
  onClearSelection
}: ManuscriptTableHeaderProps) {
  const isAllSelected = filteredManuscripts.length > 0 && 
    filteredManuscripts.every(m => selectedManuscripts.has(m.id))
  const isPartiallySelected = selectedManuscripts.size > 0 && !isAllSelected

  const handleSelectAll = () => {
    if (isAllSelected) {
      onClearSelection()
    } else {
      onSelectAll(filteredManuscripts)
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sort.field === field
    const direction = isActive ? sort.direction : 'asc'
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort(field)}
        className="h-auto p-0 font-medium text-left justify-start"
      >
        <span>{children}</span>
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="ml-1 h-3 w-3" />
          ) : (
            <ArrowDown className="ml-1 h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
        )}
      </Button>
    )
  }

  return (
    <TableHeader>
      <TableRow>
        {/* Selection Checkbox */}
        <TableHead className="w-12">
          <Checkbox
            checked={isAllSelected || isPartiallySelected}
            onCheckedChange={handleSelectAll}
            aria-label="Select all manuscripts"
            className={isPartiallySelected ? "data-[state=checked]:bg-primary data-[state=checked]:opacity-50" : ""}
          />
        </TableHead>

        {/* Received Date */}
        {columnVisibility.receivedDate && (
          <TableHead>
            <SortButton field="receivedDate">Received</SortButton>
          </TableHead>
        )}

        {/* Title */}
        {columnVisibility.title && (
          <TableHead>
            <SortButton field="title">Title</SortButton>
          </TableHead>
        )}

        {/* Authors */}
        {columnVisibility.authors && (
          <TableHead>
            <SortButton field="authors">Authors</SortButton>
          </TableHead>
        )}

        {/* DOI */}
        {columnVisibility.doi && (
          <TableHead>DOI</TableHead>
        )}

        {/* Assigned To */}
        {columnVisibility.assignedTo && (
          <TableHead>
            <SortButton field="assignedTo">Assigned To</SortButton>
          </TableHead>
        )}

        {/* Status */}
        {columnVisibility.status && (
          <TableHead>
            <SortButton field="status">Status</SortButton>
          </TableHead>
        )}

        {/* Priority */}
        {columnVisibility.priority && (
          <TableHead>
            <SortButton field="priority">Priority</SortButton>
          </TableHead>
        )}

        {/* Actions */}
        {columnVisibility.actions && (
          <TableHead className="w-32">Actions</TableHead>
        )}
      </TableRow>
    </TableHeader>
  )
}