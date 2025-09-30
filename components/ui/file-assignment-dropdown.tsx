"use client"

import React, { useState } from 'react'
import { Button } from './button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Badge } from './badge'
import { Loader2, Check, Plus, X } from 'lucide-react'
import { FigureDetails, ManuscriptFileDetails } from '@/lib/types'

interface AssignmentOption {
  value: string
  label: string
  figure_id?: number | null
  panel_id?: number | null
}

interface FileAssignmentDropdownProps {
  file: ManuscriptFileDetails
  figures: FigureDetails[]
  manuscriptId: string
  onAssignmentChange: (fileId: number, figureId?: number, panelId?: number) => Promise<void>
}

export function FileAssignmentDropdown({ 
  file, 
  figures, 
  manuscriptId, 
  onAssignmentChange 
}: FileAssignmentDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  // Build assignment options
  const assignmentOptions: AssignmentOption[] = [
    { value: 'manuscript', label: 'Manuscript', figure_id: null, panel_id: null }
  ]

  // Add figure and panel options
  figures.forEach(figure => {
    assignmentOptions.push({
      value: `figure-${figure.id}`,
      label: `Figure ${figure.label}`,
      figure_id: figure.id,
      panel_id: null
    })
    
    figure.panels?.forEach(panel => {
      assignmentOptions.push({
        value: `panel-${figure.id}-${panel.id}`,
        label: `Figure ${figure.label}, Panel ${panel.label}`,
        figure_id: figure.id,
        panel_id: panel.id
      })
    })
  })

  const handleAssignmentChange = async (value: string) => {
    setIsUpdating(true)
    try {
      const option = assignmentOptions.find(opt => opt.value === value)
      if (!option) return

      if (value === 'manuscript') {
        await onAssignmentChange(file.id)
      } else if (option.figure_id && option.panel_id) {
        await onAssignmentChange(file.id, option.figure_id, option.panel_id)
      } else if (option.figure_id) {
        await onAssignmentChange(file.id, option.figure_id)
      }
      
    } catch (error) {
      console.error('Error updating file assignment:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Function to get figure label by ID
  const getFigureLabel = (figureId: number | null) => {
    if (!figureId) return null
    const figure = figures.find(f => f.id === figureId)
    return figure?.label || `Figure ${figureId}`
  }

  // Function to get panel label by ID
  const getPanelLabel = (figureId: number | null, panelId: number | null) => {
    if (!figureId || !panelId) return null
    const figure = figures.find(f => f.id === figureId)
    const panel = figure?.panels?.find(p => p.id === panelId)
    return panel?.label || `Panel ${panelId}`
  }

  // Get current assignments with proper labels
  const getCurrentAssignments = () => {
    if (!file.assigned_to || file.assigned_to.length === 0) {
      return [
        <Badge key="unassigned" variant="outline" className="text-xs">
          Unassigned
        </Badge>
      ]
    }

    return file.assigned_to.map((assignment, index) => {
      let label = ''
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline"

      if (assignment.figure && assignment.panel) {
        // Panel assignment
        label = `${assignment.figure.label} - ${assignment.panel.label}`
        variant = "secondary"
      } else if (assignment.figure) {
        // Figure assignment
        label = assignment.figure.label
        variant = "secondary"
      } else {
        // Manuscript assignment
        label = 'Manuscript'
        variant = "default"
      }

      return (
        <Badge key={`${assignment.figure?.id || 'manuscript'}-${assignment.panel?.id || 'none'}-${index}`} variant={variant} className="text-xs">
          {label}
        </Badge>
      )
    })
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap gap-1 min-w-[200px]">
        {getCurrentAssignments()}
      </div>
      
      <Select
        value=""
        onValueChange={handleAssignmentChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[220px] h-8">
          <div className="flex items-center gap-1">
            <Plus className="w-3 h-3" />
            <span className="text-xs">Add Assignment</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {assignmentOptions.map(option => {
            // Check if this assignment already exists
            const isAlreadyAssigned = file.assigned_to?.some(existing => 
              existing.figure?.id === option.figure_id && existing.panel?.id === option.panel_id
            )

            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                disabled={isAlreadyAssigned}
              >
                <div className="flex items-center gap-2">
                  {isAlreadyAssigned && (
                    <Check className="w-3 h-3 text-green-600" />
                  )}
                  <span className={isAlreadyAssigned ? "text-gray-500" : ""}>
                    {option.label}
                  </span>
                  {isAlreadyAssigned && (
                    <span className="text-xs text-gray-400">(assigned)</span>
                  )}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {isUpdating && (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}
