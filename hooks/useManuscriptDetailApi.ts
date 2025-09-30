import { useCallback } from 'react'
import { api } from '@/lib/api-client'
import { getImageUrl, type ImageOptions } from '@/lib/image-utils'
import type { ManuscriptDetailData } from '@/types/manuscript-detail'

interface UseManuscriptDetailApiProps {
  setManuscript: (manuscript: ManuscriptDetailData | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setDataAvailability: (availability: {
    hasSourceData: boolean
    hasLinkedData: boolean
    hasQcData: boolean
  }) => void
}

export function useManuscriptDetailApi({
  setManuscript,
  setIsLoading,
  setError,
  setDataAvailability
}: UseManuscriptDetailApiProps) {

  const fetchApiManuscriptDetail = useCallback(async (manuscriptId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use the new API client to fetch manuscript details directly from Data4Rev API
      const response = await api.manuscripts.getById(manuscriptId)
      const apiData = response // API client returns data directly, not wrapped in .data

      console.log('🔍 Manuscript detail API response:', apiData)
      console.log('🔍 Response keys:', Object.keys(apiData || {}))
      console.log('🔍 Figures data:', apiData?.figures)

      if (!apiData) {
        throw new Error('No data received from API')
      }

      // Process figures from the API response
      let processedFigures = []
      if (apiData && Array.isArray(apiData.figures)) {
        processedFigures = apiData.figures.map((figure: any, index: number) => ({
          // Match API structure exactly
          id: figure.id,
          label: figure.label,
          caption: figure.caption,
          image_file_id: figure.image_file_id,
          sort_order: figure.sort_order,
          panels: Array.isArray(figure.panels) ? figure.panels.map((panel: any, panelIndex: number) => ({
            // Match API structure exactly
            id: panel.id,
            label: panel.label,
            caption: panel.caption,
            x1: panel.x1,
            y1: panel.y1,
            x2: panel.x2,
            y2: panel.y2,
            confidence: panel.confidence,
            sort_order: panel.sort_order,
            source_data: panel.source_data,
            links: panel.links,
            check_results: panel.check_results,
            qualityChecks: Array.isArray(panel.check_results) ? panel.check_results.map((check: any) => {
              // Ensure we transform any object to proper format
              if (typeof check === 'object' && check !== null) {
                return {
                  id: check.id || `check-${panelIndex}`,
                  type: check.status === 'error' ? 'error' : check.status === 'warning' ? 'warning' : 'info',
                  message: String(check.message || check.name || check.check_name || 'Check result'),
                  category: String(check.category || 'Quality Check'),
                  severity: String(check.severity || 'medium'),
                  details: String(check.details || check.message || check.name || check.check_name || 'No details available')
                }
              }
              // If it's not an object, return a default structure
              return {
                id: `check-${panelIndex}`,
                type: 'info',
                message: String(check) || 'Check result',
                category: 'Quality Check',
                severity: 'medium',
                details: 'No details available'
              }
            }) : []
          })) : [],
          qualityChecks: Array.isArray(figure.check_results) ? figure.check_results.map((check: any) => {
            // Ensure we transform any object to proper format
            if (typeof check === 'object' && check !== null) {
              return {
                id: check.id || `figure-check-${index}`,
                type: check.status === 'error' ? 'error' : check.status === 'warning' ? 'warning' : 'info',
                message: check.message || check.name || check.check_name || 'Check result',
                category: check.category || 'Quality Check',
                severity: check.severity || 'medium',
                details: check.details || check.message || check.name || check.check_name || 'No details available'
              }
            }
            // If it's not an object, return a default structure
            return {
              id: `figure-check-${index}`,
              type: 'info',
              message: String(check) || 'Check result',
              category: 'Quality Check',
              severity: 'medium',
              details: 'No details available'
            }
          }) : []
        }))
      }

      // Transform to our interface format using Data4Rev field names
      const transformedManuscript: ManuscriptDetailData = {
        id: apiData.id?.toString() || manuscriptId,
        msid: apiData.msid || manuscriptId,
        title: apiData.title || 'Untitled Manuscript',
        authors: apiData.authors || 'Unknown Authors',
        receivedDate: apiData.received_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        doi: apiData.doi,
        accessionNumber: apiData.accession_number,
        assignedTo: apiData.assigned_to,
        status: apiData.status || 'Under Review',
        priority: 'medium', // Data4Rev doesn't provide priority, use default
        notes: apiData.notes || '',
        lastModified: apiData.last_modified || apiData.received_at || new Date().toISOString(),
        figures: processedFigures,
        qcChecks: Array.isArray(apiData.check_results) ? apiData.check_results.map((check: any) => {
          // Ensure we transform any object to proper format
          if (typeof check === 'object' && check !== null) {
            return {
              id: check.id || `manuscript-check-${Math.random()}`,
              type: check.status === 'error' ? 'error' : check.status === 'warning' ? 'warning' : 'info',
              message: check.message || check.name || check.check_name || 'Check result',
              category: check.category || 'Quality Check',
              severity: check.severity || 'medium',
              details: check.details || check.message || check.name || check.check_name || 'No details available'
            }
          }
          // If it's not an object, return a default structure
          return {
            id: `manuscript-check-${Math.random()}`,
            type: 'info',
            message: String(check) || 'Check result',
            category: 'Quality Check',
            severity: 'medium',
            details: 'No details available'
          }
        }) : []
      }


      setManuscript(transformedManuscript)

      // Update data availability based on API response
      setDataAvailability({
        hasSourceData: !!(Array.isArray(apiData.source_data) && apiData.source_data.length > 0),
        hasLinkedData: !!(Array.isArray(apiData.linked_data) && apiData.linked_data.length > 0),
        hasQcData: !!(Array.isArray(apiData.check_results) && apiData.check_results.length > 0)
      })

    } catch (error) {
      console.error('❌ Failed to fetch manuscript detail:', error)
      setError(error instanceof Error ? error.message : 'Failed to load manuscript details')
    } finally {
      setIsLoading(false)
    }
  }, [setManuscript, setIsLoading, setError, setDataAvailability])

  const downloadFile = useCallback(async (manuscriptId: string, fileType: string) => {
    try {
      // For static builds, we need to implement download differently or disable it
      // This functionality would need to be handled by the Data4Rev API directly
      console.warn('Download functionality not available in static build mode')
      alert('Download functionality is not available in static mode. Please contact support for file access.')
    } catch (error) {
      console.error('❌ Download failed:', error)
      throw error
    }
  }, [])

  const submitValidation = useCallback(async (manuscriptId: string, validationData: any) => {
    try {
      // For static builds, validation submission would need to be handled by Data4Rev API
      console.warn('Validation submission not available in static build mode')
      alert('Validation submission is not available in static mode. Please contact support.')
      return { success: false, message: 'Not available in static mode' }
    } catch (error) {
      console.error('❌ Validation submission failed:', error)
      throw error
    }
  }, [])

  return {
    fetchApiManuscriptDetail,
    downloadFile,
    submitValidation
  }
}