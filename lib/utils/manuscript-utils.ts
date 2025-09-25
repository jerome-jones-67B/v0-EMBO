import type { Manuscript, FilterState, SortState } from '@/types/manuscript'

export function filterAndSortManuscripts(
  manuscripts: Manuscript[],
  filters: FilterState,
  sort: SortState,
  activeTab: string,
  showOnlyMine: boolean
): Manuscript[] {
  let filtered = manuscripts

  // Tab filtering
  if (activeTab !== 'all') {
    filtered = filtered.filter(manuscript => {
      switch (activeTab) {
        case 'pending':
          return manuscript.workflowState === 'pending'
        case 'in-review':
          return manuscript.workflowState === 'in-review'
        case 'ready':
          return manuscript.workflowState === 'ready'
        case 'completed':
          return manuscript.workflowState === 'completed'
        default:
          return true
      }
    })
  }

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(manuscript =>
      manuscript.title.toLowerCase().includes(searchLower) ||
      manuscript.authors.toLowerCase().includes(searchLower) ||
      manuscript.msid.toLowerCase().includes(searchLower) ||
      (manuscript.doi && manuscript.doi.toLowerCase().includes(searchLower))
    )
  }

  // Status filter
  if (filters.status !== 'all') {
    filtered = filtered.filter(manuscript => 
      manuscript.status.toLowerCase() === filters.status.toLowerCase()
    )
  }

  // Priority filter
  if (filters.priority !== 'all') {
    filtered = filtered.filter(manuscript => 
      manuscript.priority === filters.priority
    )
  }

  // Assignee filter
  if (filters.assignedTo !== 'all') {
    if (filters.assignedTo === 'unassigned') {
      filtered = filtered.filter(manuscript => !manuscript.assignedTo)
    } else if (filters.assignedTo === 'me') {
      filtered = filtered.filter(manuscript => manuscript.assignedTo === 'Dr. Sarah Chen')
    } else {
      filtered = filtered.filter(manuscript => manuscript.assignedTo === filters.assignedTo)
    }
  }

  // Show only mine filter
  if (showOnlyMine) {
    filtered = filtered.filter(manuscript => manuscript.assignedTo === 'Dr. Sarah Chen')
  }

  // Sorting
  filtered.sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sort.field) {
      case 'receivedDate':
        aValue = new Date(a.receivedDate)
        bValue = new Date(b.receivedDate)
        break
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'authors':
        aValue = a.authors.toLowerCase()
        bValue = b.authors.toLowerCase()
        break
      case 'status':
        aValue = a.status.toLowerCase()
        bValue = b.status.toLowerCase()
        break
      case 'assignedTo':
        aValue = (a.assignedTo || '').toLowerCase()
        bValue = (b.assignedTo || '').toLowerCase()
        break
      case 'priority':
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
        aValue = priorityOrder[a.priority]
        bValue = priorityOrder[b.priority]
        break
      case 'lastModified':
        aValue = new Date(a.lastModified)
        bValue = new Date(b.lastModified)
        break
      default:
        aValue = a.receivedDate
        bValue = b.receivedDate
    }

    if (aValue < bValue) {
      return sort.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sort.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  return filtered
}

export function getUniqueAssignees(manuscripts: Manuscript[]): string[] {
  const assignees = new Set<string>()
  manuscripts.forEach(manuscript => {
    if (manuscript.assignedTo) {
      assignees.add(manuscript.assignedTo)
    }
  })
  return Array.from(assignees).sort()
}

export function getTabCounts(manuscripts: Manuscript[]) {
  return {
    all: manuscripts.length,
    pending: manuscripts.filter(m => m.workflowState === 'pending').length,
    'in-review': manuscripts.filter(m => m.workflowState === 'in-review').length,
    ready: manuscripts.filter(m => m.workflowState === 'ready').length,
    completed: manuscripts.filter(m => m.workflowState === 'completed').length
  }
}