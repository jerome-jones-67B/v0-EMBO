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
  setFullManuscriptData?: (data: any) => void
}

export function useManuscriptDetailApi({
  setManuscript,
  setIsLoading,
  setError,
  setDataAvailability,
  setFullManuscriptData
}: UseManuscriptDetailApiProps) {

  const fetchApiManuscriptDetail = useCallback(async (manuscriptId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use the new API client to fetch manuscript details directly from Data4Rev API
      const response = await api.manuscripts.getById(manuscriptId)
      const apiData = response // API client returns data directly, not wrapped in .data

      if (!apiData) {
        throw new Error('No data received from API')
      }

      // Process figures from the API response
      const data = (apiData as any).data || apiData
      let processedFigures = []
      if (data && Array.isArray(data.figures)) {
        processedFigures = data.figures.map((figure: any, index: number) => ({
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

      // Transform to our interface format using Data4Rev field names (reuse data variable)
      const transformedManuscript: ManuscriptDetailData = {
        id: data.id?.toString() || manuscriptId,
        msid: data.msid || manuscriptId,
        title: data.title || 'Untitled Manuscript',
        authors: data.authors || 'Unknown Authors',
        receivedDate: data.received_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        doi: data.doi,
        accessionNumber: data.accession_number,
        assignedTo: data.assigned_to,
        status: data.status || 'Under Review',
        priority: 'medium', // Data4Rev doesn't provide priority, use default
        notes: data.notes || '',
        lastModified: data.last_modified || data.received_at || new Date().toISOString(),
        figures: processedFigures,
        qcChecks: Array.isArray(data.check_results) ? data.check_results.map((check: any) => {
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

      // Store the full manuscript data for source data initialization
      if (setFullManuscriptData) {
        setFullManuscriptData(apiData)
      }

      // Update data availability based on API response
      setDataAvailability({
        hasSourceData: !!(Array.isArray(data.source_data) && data.source_data.length > 0),
        hasLinkedData: !!(Array.isArray(data.linked_data) && data.linked_data.length > 0),
        hasQcData: !!(Array.isArray(data.check_results) && data.check_results.length > 0)
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
      console.log('📥 Downloading manuscript file from Data4Rev API:', manuscriptId)

      // Fetch the manuscript files list
      const filesResponse = await api.files.getByManuscriptId(manuscriptId)
      const files = Array.isArray(filesResponse) ? filesResponse : (filesResponse as any)?.data || []

      if (!files || files.length === 0) {
        throw new Error('No manuscript files found to download')
      }

      // Find the main manuscript file (PDF or document)
      // Priority: PDF files, then any document files
      const manuscriptFile = files.find((f: any) =>
        f.content_type?.includes('pdf') ||
        f.filename?.toLowerCase().endsWith('.pdf')
      ) || files.find((f: any) =>
        f.content_type?.includes('document') ||
        f.content_type?.includes('word') ||
        f.filename?.toLowerCase().match(/\.(doc|docx|txt)$/)
      ) || files[0] // Fallback to first file

      console.log('📥 Downloading file:', manuscriptFile.filename, 'ID:', manuscriptFile.id)

      // Download the file using the API
      const blob = await api.files.download(manuscriptId, manuscriptFile.id.toString())

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = manuscriptFile.filename || `manuscript_${manuscriptId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('✅ Download completed for manuscript:', manuscriptId)
    } catch (error) {
      console.error('❌ Download failed:', error)
      alert('Download failed. Please try again.')
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
