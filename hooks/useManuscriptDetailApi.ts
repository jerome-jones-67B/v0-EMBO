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
    if (!session) {
      console.error('❌ No session available for API call')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch manuscript basic info
      const manuscriptResponse = await fetch(`/api/v1/manuscripts/${manuscriptId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include'
      })

      if (!manuscriptResponse.ok) {
        throw new Error(`Failed to fetch manuscript: ${manuscriptResponse.status}`)
      }

      const manuscriptData = await manuscriptResponse.json()

      // Fetch figures with enhanced details
      const figuresResponse = await fetch(`/api/v1/manuscripts/${manuscriptId}/figures`, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie,
        },
        credentials: 'include'
      })

      let figuresData = []
      if (figuresResponse.ok) {
        figuresData = await figuresResponse.json()
      }

      // Process figures with image URLs and quality checks
      const processedFigures = figuresData.map((figure: any, index: number) => ({
        id: figure.id || `figure-${index}`,
        title: figure.title || `Figure ${index + 1}`,
        legend: figure.legend || figure.caption || 'No legend available',
        panels: figure.panels?.map((panel: any, panelIndex: number) => ({
          id: panel.id || `panel-${panelIndex}`,
          description: panel.description || `Panel ${String.fromCharCode(65 + panelIndex)}`,
          legend: panel.legend || panel.caption || 'No panel legend',
          imagePath: getImageUrl(manuscriptId, figure.id || `figure-${index}`, { type: 'full' }),
          qualityChecks: panel.checks || []
        })) || [],
        qualityChecks: figure.checks || []
      }))

      // Transform to our interface format
      const transformedManuscript: ManuscriptDetailData = {
        id: manuscriptData.id,
        msid: manuscriptData.msid,
        title: manuscriptData.title,
        authors: manuscriptData.authors,
        receivedDate: manuscriptData.received_at?.split('T')[0] || '2024-01-01',
        doi: manuscriptData.doi,
        accessionNumber: manuscriptData.accession_number,
        assignedTo: manuscriptData.assigned_to || 'Dr. Sarah Chen',
        status: manuscriptData.status || 'Under Review',
        priority: manuscriptData.priority || 'medium',
        notes: manuscriptData.notes || 'API manuscript - no additional notes',
        lastModified: manuscriptData.last_modified || new Date().toISOString(),
        figures: processedFigures,
        qcChecks: manuscriptData.qc_checks || []
      }

      setManuscript(transformedManuscript)

      // Update data availability based on API response
      setDataAvailability({
        hasSourceData: !!(manuscriptData.source_data && manuscriptData.source_data.length > 0),
        hasLinkedData: !!(manuscriptData.linked_data && manuscriptData.linked_data.length > 0),
        hasQcData: !!(manuscriptData.qc_checks && manuscriptData.qc_checks.length > 0)
      })

    } catch (error) {
      console.error('❌ Failed to fetch manuscript detail:', error)
      setError(error instanceof Error ? error.message : 'Failed to load manuscript details')
    } finally {
      setIsLoading(false)
    }
  }, [session, setManuscript, setIsLoading, setError, setDataAvailability])

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