import { renderHook, act } from '@testing-library/react'
import { useManuscriptState } from '@/hooks/useManuscriptState'
import { useState, useCallback, useRef } from 'react'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  api: {
    sourceData: {
      assignToManuscript: jest.fn(),
      assignToFigure: jest.fn(),
      assignToPanel: jest.fn(),
      deleteFromManuscript: jest.fn(),
      deleteFromFigure: jest.fn(),
      deleteFromPanel: jest.fn(),
    },
  },
}))

// Test hook that simulates the state management logic
function useTestMappingState() {
  const [mappingTargets, setMappingTargets] = useState<Record<string, string[]>>({})
  const [sourceDataIds, setSourceDataIds] = useState<Record<string, Record<string, number>>>({})
  const sourceDataIdsRef = useRef<Record<string, Record<string, number>>>({})
  const lastSourceFilesRef = useRef<any[]>([])

  const handleMappingChange = useCallback(async (
    fileId: string,
    selectedValues: string[],
    mockApi: any
  ) => {
    const currentAssignments = mappingTargets[fileId] || []
    const currentSourceDataIds = sourceDataIdsRef.current[fileId] || {}

    const assignmentsToRemove = currentAssignments.filter(value => !selectedValues.includes(value))
    const assignmentsToAdd = selectedValues.filter(value => !currentAssignments.includes(value))

    // Update UI immediately
    setMappingTargets(prev => ({
      ...prev,
      [fileId]: selectedValues
    }))

    let localSourceDataIds = { ...currentSourceDataIds }

    try {
      // Remove assignments
      for (const assignmentValue of assignmentsToRemove) {
        const sourceDataId = localSourceDataIds[assignmentValue]
        if (sourceDataId) {
          await mockApi.deleteFromManuscript('6', sourceDataId.toString())
        }
      }

      // Add new assignments
      for (const assignmentValue of assignmentsToAdd) {
        const response = await mockApi.assignToManuscript('6', parseInt(fileId))
        const sourceDataId = response.id
        if (sourceDataId) {
          localSourceDataIds[assignmentValue] = sourceDataId

          sourceDataIdsRef.current = {
            ...sourceDataIdsRef.current,
            [fileId]: {
              ...sourceDataIdsRef.current[fileId],
              [assignmentValue]: sourceDataId
            }
          }

          setSourceDataIds(prev => ({
            ...prev,
            [fileId]: {
              ...prev[fileId],
              [assignmentValue]: sourceDataId
            }
          }))
        }
      }

      // Update state
      assignmentsToRemove.forEach(assignmentValue => {
        delete localSourceDataIds[assignmentValue]
      })

      sourceDataIdsRef.current = {
        ...sourceDataIdsRef.current,
        [fileId]: localSourceDataIds
      }

      setSourceDataIds(prev => ({
        ...prev,
        [fileId]: localSourceDataIds
      }))

    } catch (error) {
      // Revert UI on error
      setMappingTargets(prev => ({
        ...prev,
        [fileId]: currentAssignments
      }))
      throw error
    }
  }, [mappingTargets, sourceDataIds])

  return {
    mappingTargets,
    sourceDataIds,
    sourceDataIdsRef,
    handleMappingChange
  }
}

describe('Source File Mapping State Management', () => {
  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useTestMappingState())

      expect(result.current.mappingTargets).toEqual({})
      expect(result.current.sourceDataIds).toEqual({})
      expect(result.current.sourceDataIdsRef.current).toEqual({})
    })
  })

  describe('Adding Assignments', () => {
    it('should add new assignment and update state', async () => {
      const mockApi = {
        assignToManuscript: jest.fn().mockResolvedValue({ id: 100 }),
        deleteFromManuscript: jest.fn().mockResolvedValue({})
      }

      const { result } = renderHook(() => useTestMappingState())

      await act(async () => {
        await result.current.handleMappingChange('1', ['manuscript'], mockApi)
      })

      expect(result.current.mappingTargets).toEqual({ '1': ['manuscript'] })
      expect(result.current.sourceDataIds).toEqual({ '1': { 'manuscript': 100 } })
      expect(mockApi.assignToManuscript).toHaveBeenCalledWith('6', 1)
    })

    it('should handle multiple assignments', async () => {
      const mockApi = {
        assignToManuscript: jest.fn().mockResolvedValue({ id: 101 }),
        assignToFigure: jest.fn().mockResolvedValue({ id: 102 }),
        deleteFromManuscript: jest.fn().mockResolvedValue({})
      }

      const { result } = renderHook(() => useTestMappingState())

      await act(async () => {
        await result.current.handleMappingChange('1', ['manuscript', 'figure-32'], mockApi)
      })

      expect(result.current.mappingTargets).toEqual({ '1': ['manuscript', 'figure-32'] })
      expect(mockApi.assignToManuscript).toHaveBeenCalledWith('6', 1)
    })
  })

  describe('Removing Assignments', () => {
    it('should remove existing assignment', async () => {
      const mockApi = {
        assignToManuscript: jest.fn().mockResolvedValue({ id: 100 }),
        deleteFromManuscript: jest.fn().mockResolvedValue({})
      }

      const { result } = renderHook(() => useTestMappingState())

      // First add an assignment
      await act(async () => {
        await result.current.handleMappingChange('1', ['manuscript'], mockApi)
      })

      // Then remove it
      await act(async () => {
        await result.current.handleMappingChange('1', [], mockApi)
      })

      expect(result.current.mappingTargets).toEqual({ '1': [] })
      expect(result.current.sourceDataIds).toEqual({ '1': {} })
      expect(mockApi.deleteFromManuscript).toHaveBeenCalledWith('6', '100')
    })

    it('should handle partial removal', async () => {
      const mockApi = {
        assignToManuscript: jest.fn().mockResolvedValue({ id: 100 }),
        assignToFigure: jest.fn().mockResolvedValue({ id: 101 }),
        deleteFromManuscript: jest.fn().mockResolvedValue({}),
        deleteFromFigure: jest.fn().mockResolvedValue({})
      }

      const { result } = renderHook(() => useTestMappingState())

      // Add multiple assignments
      await act(async () => {
        await result.current.handleMappingChange('1', ['manuscript', 'figure-32'], mockApi)
      })

      // Remove one assignment
      await act(async () => {
        await result.current.handleMappingChange('1', ['figure-32'], mockApi)
      })

      expect(result.current.mappingTargets).toEqual({ '1': ['figure-32'] })
      expect(mockApi.deleteFromManuscript).toHaveBeenCalledWith('6', '100')
    })
  })

  describe('Error Handling', () => {
    it('should revert state on API error', async () => {
      const mockApi = {
        assignToManuscript: jest.fn().mockRejectedValue(new Error('API Error')),
        deleteFromManuscript: jest.fn().mockResolvedValue({})
      }

      const { result } = renderHook(() => useTestMappingState())

      await act(async () => {
        try {
          await result.current.handleMappingChange('1', ['manuscript'], mockApi)
        } catch (error) {
          // Expected to throw
        }
      })

      // State should be reverted to original
      expect(result.current.mappingTargets).toEqual({})
      expect(result.current.sourceDataIds).toEqual({})
    })

    it('should maintain state consistency during concurrent operations', async () => {
      const mockApi = {
        assignToManuscript: jest.fn().mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve({ id: Math.random() * 1000 }), 10))
        ),
        deleteFromManuscript: jest.fn().mockResolvedValue({})
      }

      const { result } = renderHook(() => useTestMappingState())

      // Start multiple operations
      const promises = [
        result.current.handleMappingChange('1', ['manuscript'], mockApi),
        result.current.handleMappingChange('2', ['manuscript'], mockApi),
        result.current.handleMappingChange('3', ['manuscript'], mockApi)
      ]

      await act(async () => {
        await Promise.all(promises)
      })

      expect(result.current.mappingTargets).toEqual({
        '1': ['manuscript'],
        '2': ['manuscript'],
        '3': ['manuscript']
      })
    })
  })

  describe('State Persistence', () => {
    it('should persist source data IDs across operations', async () => {
      const mockApi = {
        assignToManuscript: jest.fn().mockResolvedValue({ id: 200 }),
        deleteFromManuscript: jest.fn().mockResolvedValue({})
      }

      const { result } = renderHook(() => useTestMappingState())

      // Add assignment
      await act(async () => {
        await result.current.handleMappingChange('1', ['manuscript'], mockApi)
      })

      const sourceDataId = result.current.sourceDataIdsRef.current['1']['manuscript']
      expect(sourceDataId).toBe(200)

      // Remove assignment
      await act(async () => {
        await result.current.handleMappingChange('1', [], mockApi)
      })

      // Source data ID should be removed from ref
      expect(result.current.sourceDataIdsRef.current['1']['manuscript']).toBeUndefined()
    })
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
