import { filterAndSortManuscripts, getUniqueAssignees, getTabCounts } from '@/lib/utils/manuscript-utils'
import type { Manuscript, FilterState, SortState } from '@/types/manuscript'

const mockManuscripts: Manuscript[] = [
  {
    id: '1',
    msid: 'EMBO-2024-001',
    receivedDate: '2024-01-15',
    title: 'Alpha Manuscript',
    authors: 'Author One',
    status: 'Under Review',
    workflowState: 'in-review',
    priority: 'high',
    hasErrors: false,
    hasWarnings: false,
    notes: 'Test notes',
    lastModified: '2024-01-20T10:30:00Z',
    displayStatus: 'Under Review',
    badgeVariant: 'default',
    isMapped: true,
    unmappedFields: [],
    assignedTo: 'Dr. Sarah Chen'
  },
  {
    id: '2',
    msid: 'EMBO-2024-002',
    receivedDate: '2024-01-18',
    title: 'Beta Manuscript',
    authors: 'Author Two',
    status: 'Pending Review',
    workflowState: 'pending',
    priority: 'medium',
    hasErrors: false,
    hasWarnings: true,
    notes: 'Test notes 2',
    lastModified: '2024-01-19T14:45:00Z',
    displayStatus: 'Pending Review',
    badgeVariant: 'secondary',
    isMapped: true,
    unmappedFields: [],
    assignedTo: 'Dr. Michael Rodriguez'
  },
  {
    id: '3',
    msid: 'EMBO-2024-003',
    receivedDate: '2024-01-20',
    title: 'Gamma Manuscript',
    authors: 'Author Three',
    status: 'Ready for Publication',
    workflowState: 'ready',
    priority: 'low',
    hasErrors: false,
    hasWarnings: false,
    notes: 'Test notes 3',
    lastModified: '2024-01-22T09:15:00Z',
    displayStatus: 'Ready for Publication',
    badgeVariant: 'default',
    isMapped: true,
    unmappedFields: []
  }
]

describe('manuscript-utils', () => {
  describe('filterAndSortManuscripts', () => {
    const defaultFilters: FilterState = {
      search: '',
      status: 'all',
      priority: 'all',
      assignedTo: 'all'
    }

    const defaultSort: SortState = {
      field: 'receivedDate',
      direction: 'desc'
    }

    it('should return all manuscripts when no filters applied', () => {
      const result = filterAndSortManuscripts(
        mockManuscripts,
        defaultFilters,
        defaultSort,
        'all',
        false
      )

      expect(result).toHaveLength(3)
    })

    it('should filter by search term', () => {
      const filters = { ...defaultFilters, search: 'Alpha' }
      const result = filterAndSortManuscripts(
        mockManuscripts,
        filters,
        defaultSort,
        'all',
        false
      )

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Alpha Manuscript')
    })

    it('should filter by status', () => {
      const filters = { ...defaultFilters, status: 'pending review' }
      const result = filterAndSortManuscripts(
        mockManuscripts,
        filters,
        defaultSort,
        'all',
        false
      )

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('Pending Review')
    })

    it('should filter by priority', () => {
      const filters = { ...defaultFilters, priority: 'high' }
      const result = filterAndSortManuscripts(
        mockManuscripts,
        filters,
        defaultSort,
        'all',
        false
      )

      expect(result).toHaveLength(1)
      expect(result[0].priority).toBe('high')
    })

    it('should filter by assigned user', () => {
      const filters = { ...defaultFilters, assignedTo: 'Dr. Sarah Chen' }
      const result = filterAndSortManuscripts(
        mockManuscripts,
        filters,
        defaultSort,
        'all',
        false
      )

      expect(result).toHaveLength(1)
      expect(result[0].assignedTo).toBe('Dr. Sarah Chen')
    })

    it('should filter by workflow tab', () => {
      const result = filterAndSortManuscripts(
        mockManuscripts,
        defaultFilters,
        defaultSort,
        'pending',
        false
      )

      expect(result).toHaveLength(1)
      expect(result[0].workflowState).toBe('pending')
    })

    it('should filter by "show only mine"', () => {
      const result = filterAndSortManuscripts(
        mockManuscripts,
        defaultFilters,
        defaultSort,
        'all',
        true
      )

      expect(result).toHaveLength(1)
      expect(result[0].assignedTo).toBe('Dr. Sarah Chen')
    })

    it('should sort by title ascending', () => {
      const sort: SortState = { field: 'title', direction: 'asc' }
      const result = filterAndSortManuscripts(
        mockManuscripts,
        defaultFilters,
        sort,
        'all',
        false
      )

      expect(result[0].title).toBe('Alpha Manuscript')
      expect(result[1].title).toBe('Beta Manuscript')
      expect(result[2].title).toBe('Gamma Manuscript')
    })

    it('should sort by priority with correct order', () => {
      const sort: SortState = { field: 'priority', direction: 'desc' }
      const result = filterAndSortManuscripts(
        mockManuscripts,
        defaultFilters,
        sort,
        'all',
        false
      )

      expect(result[0].priority).toBe('high')
      expect(result[1].priority).toBe('medium')
      expect(result[2].priority).toBe('low')
    })
  })

  describe('getUniqueAssignees', () => {
    it('should return unique assignees', () => {
      const result = getUniqueAssignees(mockManuscripts)

      expect(result).toEqual(['Dr. Michael Rodriguez', 'Dr. Sarah Chen'])
    })

    it('should handle manuscripts with no assignees', () => {
      const manuscriptsWithoutAssignees = [
        { ...mockManuscripts[0], assignedTo: undefined },
        mockManuscripts[1]
      ]

      const result = getUniqueAssignees(manuscriptsWithoutAssignees)

      expect(result).toEqual(['Dr. Michael Rodriguez'])
    })
  })

  describe('getTabCounts', () => {
    it('should return correct counts for each workflow state', () => {
      const result = getTabCounts(mockManuscripts)

      expect(result).toEqual({
        all: 3,
        pending: 1,
        'in-review': 1,
        ready: 1,
        completed: 0
      })
    })

    it('should handle empty manuscript array', () => {
      const result = getTabCounts([])

      expect(result).toEqual({
        all: 0,
        pending: 0,
        'in-review': 0,
        ready: 0,
        completed: 0
      })
    })
  })
})