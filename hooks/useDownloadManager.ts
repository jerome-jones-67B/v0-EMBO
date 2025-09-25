import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { endpoints, config } from '@/lib/config'
import { logger } from '@/lib/logger'

// Constants for download timing
const DOWNLOAD_CLEANUP_DELAY = 2000 // 2 seconds
const TOAST_AUTO_HIDE_DELAY = 5000 // 5 seconds

interface DownloadProgress {
  status: string
  progress: number
  currentFile?: string
  totalFiles?: number
  downloadedFiles?: number
  currentFileSize?: string
  downloadSpeed?: string
}

export function useDownloadManager() {
  const { data: session } = useSession()
  const [downloadingManuscripts, setDownloadingManuscripts] = useState<Set<string>>(new Set())
  const [downloadProgress, setDownloadProgress] = useState<Record<string, DownloadProgress>>({})
  const [showDownloadToast, setShowDownloadToast] = useState<Record<string, boolean>>({})
  const [downloadConnections, setDownloadConnections] = useState<Record<string, EventSource | null>>({})
  const [downloadAbortControllers, setDownloadAbortControllers] = useState<Record<string, AbortController | null>>({})

  const buildApiUrl = (endpoint: string) => {
    const baseUrl = config.api.baseUrl
    return `${baseUrl}${endpoint}`
  }

  const handleDownloadFiles = useCallback(async (
    msid: string, 
    title: string, 
    fileType: string = 'essential',
    useApiData: boolean = false
  ) => {
    // Determine the manuscript ID for the API call
    const manuscriptId = useApiData ? msid : msid
    
    // Create AbortController for this download
    const abortController = new AbortController()
    setDownloadAbortControllers(prev => ({...prev, [msid]: abortController}))
    
    // Add manuscript to downloading set and show progress
    setDownloadingManuscripts(prev => new Set(prev).add(msid))
    setShowDownloadToast(prev => ({...prev, [msid]: true}))
    
    // Set up Server-Sent Events connection for real-time progress
    const progressUrl = buildApiUrl(`/v1/manuscripts/${manuscriptId}/download/progress`)
    const eventSource = new EventSource(progressUrl, { withCredentials: true })
    
    setDownloadConnections(prev => ({...prev, [msid]: eventSource}))
    
    eventSource.onopen = () => {
      logger.info(`SSE connection opened for ${msid}`)
    }
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'progress') {
          setDownloadProgress(prev => ({
            ...prev,
            [msid]: {
              status: data.status,
              progress: data.progress,
              totalFiles: data.totalFiles,
              downloadedFiles: data.downloadedFiles,
              currentFile: data.currentFile,
              currentFileSize: data.currentFileSize
            }
          }))
        } else if (data.type === 'complete') {
          setDownloadProgress(prev => ({
            ...prev,
            [msid]: {
              status: data.status,
              progress: data.progress,
              totalFiles: data.totalFiles,
              downloadedFiles: data.successfulFiles,
              currentFile: data.filename,
              currentFileSize: data.fileSize
            }
          }))
        } else if (data.type === 'error') {
          setDownloadProgress(prev => ({
            ...prev,
            [msid]: {
              status: 'Download failed',
              progress: 0,
              currentFile: data.error
            }
          }))
          
          setTimeout(() => {
            alert(`Download Failed\n\nError: ${data.error}\n\nManuscript: ${title}\nMSID: ${msid}\n\nPlease try again or contact support if the problem persists.`)
          }, 500)
        } else if (data.type === 'cancelled') {
          setDownloadProgress(prev => ({
            ...prev,
            [msid]: {
              status: 'Download cancelled',
              progress: data.progress || 0,
              currentFile: data.message || 'Download was cancelled'
            }
          }))
          
          logger.info(`Download cancelled for ${msid}: ${data.message}`)
        }
      } catch (parseError) {
        logger.error('Failed to parse SSE message:', parseError)
      }
    }

    eventSource.onerror = (error) => {
      logger.error('SSE connection error:', error)
      setDownloadProgress(prev => ({
        ...prev,
        [msid]: {
          status: 'Connection error',
          progress: 0,
          currentFile: 'Failed to connect to download progress'
        }
      }))
    }

    try {
      // Build the download URL with specified file type
      const downloadUrl = buildApiUrl(`/v1/manuscripts/${manuscriptId}/download?format=zip&type=${fileType}`)
      
      // Make the API call (this will trigger the SSE progress updates)
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Cookie': document.cookie,
        },
        credentials: 'include',
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error(`Download request failed: ${response.status} ${response.statusText}`)
      }

      // Get the blob data
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] || `${msid}_${fileType}_files.zip`
      
      // Create a temporary download link and click it
      const downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.download = filename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      
      // Clean up
      document.body.removeChild(downloadLink)
      window.URL.revokeObjectURL(url)
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.debug(`Download aborted for ${msid}`)
        return
      }
      
      logger.error('Download failed:', error)
      setDownloadProgress(prev => ({
        ...prev,
        [msid]: {
          status: 'Download failed',
          progress: 0,
          currentFile: `Error: ${error.message}`
        }
      }))
      
      setTimeout(() => {
        alert(`Download Failed\n\nError: ${error.message}\n\nManuscript: ${title}\nMSID: ${msid}\n\nPlease try again or contact support if the problem persists.`)
      }, 500)
    } finally {
      // Clean up after a delay
      setTimeout(() => {
        const connection = downloadConnections[msid]
        if (connection) {
          connection.close()
          setDownloadConnections(prev => ({...prev, [msid]: null}))
        }
        
        setDownloadingManuscripts(prev => {
          const newSet = new Set(prev)
          newSet.delete(msid)
          return newSet
        })
        
        setDownloadAbortControllers(prev => ({...prev, [msid]: null}))
        
        // Hide toast after configured delay
        setTimeout(() => {
          setShowDownloadToast(prev => ({...prev, [msid]: false}))
        }, TOAST_AUTO_HIDE_DELAY)
      }, DOWNLOAD_CLEANUP_DELAY)
    }
  }, [session, downloadConnections])

  const abortDownload = useCallback((msid: string) => {
    // Abort the download request if it's in progress
    const abortController = downloadAbortControllers[msid]
    if (abortController && !abortController.signal.aborted) {
      logger.info(`Aborting download for ${msid}`)
      abortController.abort()
    }
    
    // Close SSE connection when manually closing
    const connection = downloadConnections[msid]
    if (connection) {
      connection.close()
      setDownloadConnections(prev => ({...prev, [msid]: null}))
    }
    
    // Remove from downloading set and hide toast
    setDownloadingManuscripts(prev => {
      const newSet = new Set(prev)
      newSet.delete(msid)
      return newSet
    })
    setShowDownloadToast(prev => ({...prev, [msid]: false}))
    setDownloadProgress(prev => {
      const newState = {...prev}
      delete newState[msid]
      return newState
    })
  }, [downloadAbortControllers, downloadConnections])

  const hideDownloadToast = useCallback((msid: string) => {
    setShowDownloadToast(prev => ({...prev, [msid]: false}))
  }, [])

  return {
    downloadingManuscripts,
    downloadProgress,
    showDownloadToast,
    handleDownloadFiles,
    abortDownload,
    hideDownloadToast,
  }
}
