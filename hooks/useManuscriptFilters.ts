// Custom hook for managing manuscript filtering and sorting

import { useState, useMemo } from 'react'
import { SortField, SortDirection } from '@/types/dashboard'
import { computeAIChecksSummary } from '@/lib/dashboard-utils'

export function useManuscriptFilters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("receivedDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getFilteredAndSortedManuscripts = (
    manuscripts: any[],
    useApiData: boolean,
    activeTab: string
  ) => {
    return useMemo(() => {
      const currentManuscripts = useApiData ? manuscripts : manuscripts
      
      // Enhance manuscripts with computed aiChecks if they don't have them
      const enhancedManuscripts = currentManuscripts.map(manuscript => {
        if (!manuscript.aiChecks) {
          const computedAiChecks = computeAIChecksSummary(manuscript);
          return {
            ...manuscript,
            aiChecks: computedAiChecks
          };
        }
        return manuscript;
      });
      
      const filtered = enhancedManuscripts.filter((manuscript) => {
        // Use workflowState for tab filtering
        const workflowState = manuscript.workflowState || 'no-pipeline-results'
        
        if (workflowState !== activeTab) {
          return false
        }

        // Use displayStatus for status filtering
        const displayStatus = manuscript.displayStatus || manuscript.status
        if (statusFilter !== "all" && displayStatus !== statusFilter) {
          return false
        }

        // Priority filtering
        if (priorityFilter !== "all" && manuscript.priority !== priorityFilter) {
          return false
        }

        // Assignee filtering
        if (assigneeFilter !== "all" && manuscript.assignedTo !== assigneeFilter) {
          return false
        }

        // Search filtering
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          return (
            manuscript.msid?.toLowerCase().includes(searchLower) ||
            manuscript.title?.toLowerCase().includes(searchLower) ||
            manuscript.authors?.toLowerCase().includes(searchLower) ||
            manuscript.doi?.toLowerCase().includes(searchLower)
          )
        }

        return true
      })

      // Sort the filtered results
      const sorted = filtered.sort((a, b) => {
        let aValue: any, bValue: any

        switch (sortField) {
          case "msid":
            aValue = a.msid || ""
            bValue = b.msid || ""
            break
          case "receivedDate":
            aValue = new Date(a.receivedDate || a.received || "")
            bValue = new Date(b.receivedDate || b.received || "")
            break
          case "title":
            aValue = a.title || ""
            bValue = b.title || ""
            break
          case "authors":
            aValue = a.authors || ""
            bValue = b.authors || ""
            break
          case "status":
            aValue = a.status || ""
            bValue = b.status || ""
            break
          case "priority":
            const priorityOrder = { high: 3, medium: 2, low: 1, normal: 0 }
            aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
            bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
            break
          case "lastModified":
            aValue = new Date(a.lastModified || "")
            bValue = new Date(b.lastModified || "")
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1

        // Secondary sort by status for priority
        if (sortField === "priority") {
          if (a.status === "On hold" && b.status !== "On hold") return -1
          if (b.status === "On hold" && a.status !== "On hold") return 1
        }

        return 0
      })

      return sorted
    }, [searchTerm, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection, activeTab, manuscripts, useApiData])
  }

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    handleSort,
    getFilteredAndSortedManuscripts
  }
}
