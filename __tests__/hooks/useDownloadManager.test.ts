import { renderHook, act } from '@testing-library/react'
import { useDownloadManager } from '@/hooks/useDownloadManager'

// Mock config
jest.mock('@/lib/config', () => ({
  config: {
    api: {
      baseUrl: '/api'
    }
  }
}))

describe('useDownloadManager', () => {
  let mockFetch: jest.Mock
  let mockEventSource: any

  beforeEach(() => {
    mockFetch = jest.fn()
    global.fetch = mockFetch

    // Mock EventSource
    mockEventSource = {
      onopen: null,
      onmessage: null,
      onerror: null,
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }
    
    ;(global.EventSource as any) = jest.fn(() => mockEventSource)

    // Mock DOM methods
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    }
    document.createElement = jest.fn().mockReturnValue(mockLink)
    document.body.appendChild = jest.fn()
    document.body.removeChild = jest.fn()

    // Mock window methods
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url')
    global.URL.revokeObjectURL = jest.fn()

    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useDownloadManager())

    expect(result.current.downloadingManuscripts.size).toBe(0)
    expect(Object.keys(result.current.downloadProgress)).toHaveLength(0)
    expect(Object.keys(result.current.showDownloadToast)).toHaveLength(0)
  })

  it('should start download and set up progress tracking', async () => {
    const { result } = renderHook(() => useDownloadManager())

    const mockBlob = new Blob(['test content'])
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
      headers: new Map([['Content-Disposition', 'attachment; filename="test.zip"']])
    })

    await act(async () => {
      await result.current.handleDownloadFiles('EMBO-2024-001', 'Test Manuscript', 'essential', false)
    })

    expect(result.current.downloadingManuscripts.has('EMBO-2024-001')).toBe(true)
    expect(result.current.showDownloadToast['EMBO-2024-001']).toBe(true)
    expect(global.EventSource).toHaveBeenCalledWith(
      '/api/v1/manuscripts/EMBO-2024-001/download/progress',
      { withCredentials: true }
    )
  })

  it('should handle download progress events', async () => {
    const { result } = renderHook(() => useDownloadManager())

    const mockBlob = new Blob(['test content'])
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
      headers: new Map([['Content-Disposition', 'attachment; filename="test.zip"']])
    })

    await act(async () => {
      await result.current.handleDownloadFiles('EMBO-2024-001', 'Test Manuscript', 'essential', false)
    })

    // Simulate progress event
    const progressData = {
      type: 'progress',
      status: 'downloading',
      progress: 50,
      totalFiles: 10,
      downloadedFiles: 5,
      currentFile: 'test.pdf'
    }

    act(() => {
      mockEventSource.onmessage({ data: JSON.stringify(progressData) })
    })

    expect(result.current.downloadProgress['EMBO-2024-001']).toEqual({
      status: 'downloading',
      progress: 50,
      totalFiles: 10,
      downloadedFiles: 5,
      currentFile: 'test.pdf'
    })
  })

  it('should handle download completion', async () => {
    const { result } = renderHook(() => useDownloadManager())

    const mockBlob = new Blob(['test content'])
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
      headers: new Map([['Content-Disposition', 'attachment; filename="test.zip"']])
    })

    await act(async () => {
      await result.current.handleDownloadFiles('EMBO-2024-001', 'Test Manuscript', 'essential', false)
    })

    // Simulate completion event
    const completeData = {
      type: 'complete',
      status: 'completed',
      progress: 100,
      totalFiles: 10,
      successfulFiles: 10,
      filename: 'test.zip'
    }

    act(() => {
      mockEventSource.onmessage({ data: JSON.stringify(completeData) })
    })

    expect(result.current.downloadProgress['EMBO-2024-001']).toEqual({
      status: 'completed',
      progress: 100,
      totalFiles: 10,
      downloadedFiles: 10,
      currentFile: 'test.zip'
    })
  })

  it('should abort download', () => {
    const { result } = renderHook(() => useDownloadManager())

    // First start a download to have something to abort
    act(() => {
      result.current.handleDownloadFiles('EMBO-2024-001', 'Test Manuscript', 'essential', false)
    })

    act(() => {
      result.current.abortDownload('EMBO-2024-001')
    })

    expect(result.current.downloadingManuscripts.has('EMBO-2024-001')).toBe(false)
    expect(result.current.showDownloadToast['EMBO-2024-001']).toBe(false)
    expect(mockEventSource.close).toHaveBeenCalled()
  })

  it('should hide download toast', () => {
    const { result } = renderHook(() => useDownloadManager())

    // Set up a toast first
    act(() => {
      result.current.handleDownloadFiles('EMBO-2024-001', 'Test Manuscript', 'essential', false)
    })

    act(() => {
      result.current.hideDownloadToast('EMBO-2024-001')
    })

    expect(result.current.showDownloadToast['EMBO-2024-001']).toBe(false)
  })

  it('should handle download errors', async () => {
    const { result } = renderHook(() => useDownloadManager())

    mockFetch.mockRejectedValue(new Error('Network error'))

    await act(async () => {
      await result.current.handleDownloadFiles('EMBO-2024-001', 'Test Manuscript', 'essential', false)
    })

    expect(result.current.downloadProgress['EMBO-2024-001'].status).toBe('Download failed')
  })
})
