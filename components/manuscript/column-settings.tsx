"use client"

import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { ColumnVisibility } from "@/types/manuscript"

interface ColumnSettingsProps {
  columnVisibility: ColumnVisibility
  onToggleColumn: (column: keyof ColumnVisibility) => void
}

export function ColumnSettings({
  columnVisibility,
  onToggleColumn
}: ColumnSettingsProps) {
  const columns = [
    { key: 'receivedDate' as const, label: 'Received Date' },
    { key: 'title' as const, label: 'Title' },
    { key: 'authors' as const, label: 'Authors' },
    { key: 'doi' as const, label: 'DOI' },
    { key: 'assignedTo' as const, label: 'Assigned To' },
    { key: 'status' as const, label: 'Status' },
    { key: 'priority' as const, label: 'Priority' },
    { key: 'actions' as const, label: 'Actions' },
  ]

  const visibleCount = Object.values(columnVisibility).filter(Boolean).length
  const totalCount = columns.length

  const handleSelectAll = () => {
    const allVisible = visibleCount === totalCount
    columns.forEach(column => {
      if (columnVisibility[column.key] !== !allVisible) {
        onToggleColumn(column.key)
      }
    })
  }

  const handleSelectNone = () => {
    columns.forEach(column => {
      if (columnVisibility[column.key]) {
        onToggleColumn(column.key)
      }
    })
  }

  const handleSelectDefault = () => {
    const defaultVisibility: ColumnVisibility = {
      receivedDate: true,
      title: true,
      authors: true,
      doi: false,
      assignedTo: true,
      status: true,
      priority: true,
      actions: true
    }

    columns.forEach(column => {
      if (columnVisibility[column.key] !== defaultVisibility[column.key]) {
        onToggleColumn(column.key)
      }
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Columns ({visibleCount}/{totalCount})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium leading-none">Column Visibility</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Choose which columns to display
            </p>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex-1"
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
              className="flex-1"
            >
              None
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectDefault}
              className="flex-1"
            >
              Default
            </Button>
          </div>

          <Separator />

          {/* Column Checkboxes */}
          <div className="space-y-3">
            {columns.map((column) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={column.key}
                  checked={columnVisibility[column.key]}
                  onCheckedChange={() => onToggleColumn(column.key)}
                />
                <Label 
                  htmlFor={column.key}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground">
            {visibleCount} of {totalCount} columns visible
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}