import { useCallback } from 'react'
import type { Manuscript, Priority } from '@/types/manuscript'

interface UseManuscriptOperationsProps {
  manuscripts: Manuscript[]
  setManuscripts: (manuscripts: Manuscript[] | ((prev: Manuscript[]) => Manuscript[])) => void
  apiManuscripts: Manuscript[]
  setApiManuscripts: (manuscripts: Manuscript[] | ((prev: Manuscript[]) => Manuscript[])) => void
  useApiData: boolean
}

export function useManuscriptOperations({
  manuscripts,
  setManuscripts,
  apiManuscripts,
  setApiManuscripts,
  useApiData
}: UseManuscriptOperationsProps) {
  
  const updateManuscript = useCallback((manuscriptId: string, updates: Partial<Manuscript>) => {
    const updateFn = (manuscripts: Manuscript[]) =>
      manuscripts.map(manuscript =>
        manuscript.id === manuscriptId
          ? { ...manuscript, ...updates, lastModified: new Date().toISOString() }
          : manuscript
      )

    if (useApiData) {
      setApiManuscripts(updateFn)
    } else {
      setManuscripts(updateFn)
    }
  }, [setManuscripts, setApiManuscripts, useApiData])

  const toggleOnHoldStatus = useCallback((manuscriptId: string) => {
    const currentManuscripts = useApiData ? apiManuscripts : manuscripts
    const manuscript = currentManuscripts.find(m => m.id === manuscriptId)
    
    if (!manuscript) return

    const isOnHold = manuscript.workflowState === 'on-hold'
    const newWorkflowState = isOnHold ? 'pending' : 'on-hold'
    const newStatus = isOnHold ? 'Under Review' : 'On Hold'
    const newBadgeVariant = isOnHold ? 'default' : 'secondary'

    updateManuscript(manuscriptId, {
      workflowState: newWorkflowState,
      status: newStatus,
      displayStatus: newStatus,
      badgeVariant: newBadgeVariant
    })

    alert(`Manuscript ${isOnHold ? 'removed from hold' : 'put on hold'}`)
  }, [manuscripts, apiManuscripts, useApiData, updateManuscript])

  const changePriority = useCallback((manuscriptId: string, newPriority: Priority) => {
    updateManuscript(manuscriptId, { priority: newPriority })
    alert(`Priority changed to ${newPriority}`)
  }, [updateManuscript])

  const assignToMe = useCallback((manuscriptId: string) => {
    updateManuscript(manuscriptId, { assignedTo: 'Dr. Sarah Chen' })
    alert('Manuscript assigned to you')
  }, [updateManuscript])

  const unassignFromMe = useCallback((manuscriptId: string) => {
    updateManuscript(manuscriptId, { assignedTo: undefined })
    alert('Manuscript unassigned')
  }, [updateManuscript])

  const bulkUpdateStatus = useCallback((manuscriptIds: string[], newStatus: string) => {
    manuscriptIds.forEach(id => {
      updateManuscript(id, { 
        status: newStatus,
        displayStatus: newStatus 
      })
    })
    alert(`${manuscriptIds.length} manuscripts updated to ${newStatus}`)
  }, [updateManuscript])

  const bulkAssign = useCallback((manuscriptIds: string[], assignee: string) => {
    manuscriptIds.forEach(id => {
      updateManuscript(id, { assignedTo: assignee })
    })
    alert(`${manuscriptIds.length} manuscripts assigned to ${assignee}`)
  }, [updateManuscript])

  return {
    updateManuscript,
    toggleOnHoldStatus,
    changePriority,
    assignToMe,
    unassignFromMe,
    bulkUpdateStatus,
    bulkAssign
  }
}