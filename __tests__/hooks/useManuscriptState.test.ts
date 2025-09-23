import { renderHook, act } from '@testing-library/react'
import { useManuscriptState } from '@/hooks/useManuscriptState'
import type { Manuscript } from '@/types/manuscript'

const mockManuscript: Manuscript = {
  id: '1',
  msid: 'EMBO-2024-001',
  receivedDate: '2024-01-15',
  title: 'Test Manuscript',
  authors: 'Test Author',
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
  unmappedFields: []
}

describe('useManuscriptState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useManuscriptState())

    expect(result.current.state.manuscripts).toEqual([])
    expect(result.current.state.activeTab).toBe('all')
    expect(result.current.state.filters.search).toBe('')
    expect(result.current.state.filters.status).toBe('all')
    expect(result.current.state.sort.field).toBe('receivedDate')
    expect(result.current.state.sort.direction).toBe('desc')
    expect(result.current.state.useApiData).toBe(false)
    expect(result.current.state.isLoadingApi).toBe(false)
    expect(result.current.state.showOnlyMine).toBe(false)
  })

  it('should update filter values', () => {
    const { result } = renderHook(() => useManuscriptState())

    act(() => {
      result.current.updateFilter('search', 'test search')
    })

    expect(result.current.state.filters.search).toBe('test search')

    act(() => {
      result.current.updateFilter('status', 'pending')
    })

    expect(result.current.state.filters.status).toBe('pending')
  })

  it('should update sort configuration', () => {
    const { result } = renderHook(() => useManuscriptState())

    act(() => {
      result.current.updateSort('title', 'asc')
    })

    expect(result.current.state.sort.field).toBe('title')
    expect(result.current.state.sort.direction).toBe('asc')

    // Test toggling direction for same field
    act(() => {
      result.current.updateSort('title')
    })

    expect(result.current.state.sort.direction).toBe('desc')
  })

  it('should manage manuscript selection', () => {
    const { result } = renderHook(() => useManuscriptState())

    // Select a manuscript
    act(() => {
      result.current.toggleManuscriptSelection('1')
    })

    expect(result.current.state.selectedManuscripts.has('1')).toBe(true)

    // Deselect the manuscript
    act(() => {
      result.current.toggleManuscriptSelection('1')
    })

    expect(result.current.state.selectedManuscripts.has('1')).toBe(false)
  })

  it('should select all manuscripts', () => {
    const { result } = renderHook(() => useManuscriptState())
    const manuscripts = [mockManuscript, { ...mockManuscript, id: '2' }]

    act(() => {
      result.current.selectAllManuscripts(manuscripts)
    })

    expect(result.current.state.selectedManuscripts.size).toBe(2)
    expect(result.current.state.selectedManuscripts.has('1')).toBe(true)
    expect(result.current.state.selectedManuscripts.has('2')).toBe(true)
  })

  it('should clear selection', () => {
    const { result } = renderHook(() => useManuscriptState())

    // First select some manuscripts
    act(() => {
      result.current.toggleManuscriptSelection('1')
      result.current.toggleManuscriptSelection('2')
    })

    expect(result.current.state.selectedManuscripts.size).toBe(2)

    // Then clear selection
    act(() => {
      result.current.clearSelection()
    })

    expect(result.current.state.selectedManuscripts.size).toBe(0)
  })

  it('should toggle column visibility', () => {
    const { result } = renderHook(() => useManuscriptState())

    // Initially doi should be visible
    expect(result.current.state.columnVisibility.doi).toBe(true)

    act(() => {
      result.current.toggleColumnVisibility('doi')
    })

    expect(result.current.state.columnVisibility.doi).toBe(false)

    act(() => {
      result.current.toggleColumnVisibility('doi')
    })

    expect(result.current.state.columnVisibility.doi).toBe(true)
  })

  it('should clear filters', () => {
    const { result } = renderHook(() => useManuscriptState())

    // Set some filters
    act(() => {
      result.current.updateFilter('search', 'test')
      result.current.updateFilter('status', 'pending')
    })

    expect(result.current.state.filters.search).toBe('test')
    expect(result.current.state.filters.status).toBe('pending')

    // Clear filters
    act(() => {
      result.current.clearFilters()
    })

    expect(result.current.state.filters.search).toBe('')
    expect(result.current.state.filters.status).toBe('all')
  })
})