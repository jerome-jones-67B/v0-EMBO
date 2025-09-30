// Custom hook for managing manuscript data

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { dataService } from '@/lib/data-service'
import { getStatusMapping } from '@/lib/status-mapping'
import { computeAIChecksSummary } from '@/lib/dashboard-utils'
import { initialMockManuscripts } from '@/lib/mock-dashboard-manuscripts'

export function useManuscriptData() {
  const [apiManuscripts, setApiManuscripts] = useState<any[]>([])
  const [mockManuscripts, setMockManuscripts] = useState(initialMockManuscripts)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false)
  const [useApiData, setUseApiData] = useState(() => {
    const useMock = dataService.getUseMockData()
    return !useMock
  })

  const fetchApiData = async () => {
    setIsLoadingApi(true)
    
    try {
      const response = await api.manuscripts.getAll({
        page: 0,
        pagesize: 100,
        sort: 'received_at',
        ascending: true
      })
      
      const data = response
      const manuscripts = data?.manuscripts || []
      
      if (!Array.isArray(manuscripts)) {
        throw new Error('Invalid API response: manuscripts data is not an array')
      }
      
      // Transform API data to match our mock data structure
      const transformedManuscripts = manuscripts.map((manuscript: any) => {
        const statusMapping = getStatusMapping(manuscript.status)
        const aiChecks = computeAIChecksSummary(manuscript)
        
        return {
          id: manuscript.id,
          msid: manuscript.msid,
          receivedDate: manuscript.received_at?.split('T')[0] || '2024-01-01',
          title: manuscript.title,
          authors: manuscript.authors,
          doi: manuscript.doi,
          accessionNumber: manuscript.accession_number,
          assignedTo: "Dr. Sarah Chen",
          status: statusMapping.displayStatus,
          workflowState: statusMapping.workflowState,
          priority: statusMapping.priority,
          hasErrors: manuscript.note && manuscript.note.includes('error'),
          hasWarnings: manuscript.note && manuscript.note.includes('updating'),
          notes: manuscript.note || "API manuscript - no additional notes",
          lastModified: manuscript.received_at || new Date().toISOString(),
          figures: [],
          qcChecks: [],
          displayStatus: statusMapping.displayStatus,
          badgeVariant: statusMapping.badgeVariant,
          isMapped: statusMapping.isMapped,
          unmappedFields: ['assignedTo'],
          aiChecks
        }
      })
      
      // Remove duplicates based on msid
      const uniqueManuscripts = transformedManuscripts.filter((manuscript: any, index: number, self: any[]) => 
        index === self.findIndex((m: any) => m.msid === manuscript.msid)
      )
      
      setApiManuscripts(uniqueManuscripts)
      setUseApiData(true)
      dataService.setUseMockData(false)
      
    } catch (error) {
      console.error('Failed to fetch API data:', error)
      setUseApiData(false)
      dataService.setUseMockData(true)
    } finally {
      setIsLoadingApi(false)
      setIsInitialLoadComplete(true)
    }
  }

  // Initial data loading effect
  useEffect(() => {
    const initializeData = async () => {
      if (useApiData) {
        await fetchApiData()
      } else {
        setIsInitialLoadComplete(true)
      }
    }

    initializeData()
  }, [useApiData])

  // Switch between API and mock data
  const handleDataSourceSwitch = async (useApi: boolean) => {
    setUseApiData(useApi)
    setIsInitialLoadComplete(false)
    dataService.setUseMockData(!useApi)
    
    if (useApi && apiManuscripts.length === 0) {
      await fetchApiData()
    } else {
      setIsInitialLoadComplete(true)
    }
  }

  return {
    apiManuscripts,
    setApiManuscripts,
    mockManuscripts,
    setMockManuscripts,
    isLoadingApi,
    isInitialLoadComplete,
    useApiData,
    setUseApiData,
    fetchApiData,
    handleDataSourceSwitch
  }
}
