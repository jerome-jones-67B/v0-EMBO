import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
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
  const { data: session } = useSession()

  const fetchApiManuscriptDetail = useCallback(async (manuscriptId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use the same successful API call pattern as the old manuscript view
      const response = await fetch(`/api/v1/manuscripts/${manuscriptId}?apiMode=true`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`API request failed: ${response.status} - ${errorData.error || response.statusText}`)
      }

      const apiData = await response.json()

      // Check if this is an error response from API mode
      if (apiData.error && apiData.isApiMode) {
        throw new Error(`Data4Rev API Error: ${apiData.error} - ${apiData.details}`)
      }

      // Process figures from the API response
      let processedFigures = []
      if (Array.isArray(apiData.figures)) {
        processedFigures = apiData.figures.map((figure: any, index: number) => ({
          id: figure.id || `figure-${index}`,
          title: figure.label || figure.title || `Figure ${index + 1}`,
          legend: figure.caption || figure.legend || 'No legend available',
          panels: Array.isArray(figure.panels) ? figure.panels.map((panel: any, panelIndex: number) => ({
            id: panel.id || `panel-${panelIndex}`,
            description: panel.label || panel.description || `Panel ${String.fromCharCode(65 + panelIndex)}`,
            legend: panel.caption || panel.legend || 'No panel legend',
            imagePath: getImageUrl(manuscriptId, figure.id || `figure-${index}`, { type: 'full' }),
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
    if (!session) {
      console.error('❌ No session available for download')
      return
    }

    try {
      const response = await fetch(`/api/v1/manuscripts/${manuscriptId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include',
        body: JSON.stringify({ fileType })
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      // Handle download response
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${manuscriptId}_${fileType}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('❌ Download failed:', error)
      throw error
    }
  }, [session])

  const submitValidation = useCallback(async (manuscriptId: string, validationData: any) => {
    if (!session) {
      console.error('❌ No session available for validation')
      return
    }

    try {
      const response = await fetch(`/api/v1/manuscripts/${manuscriptId}/validation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include',
        body: JSON.stringify(validationData)
      })

      if (!response.ok) {
        throw new Error(`Validation submission failed: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('❌ Validation submission failed:', error)
      throw error
    }
  }, [session])

  return {
    fetchApiManuscriptDetail,
    downloadFile,
    submitValidation
  }
}