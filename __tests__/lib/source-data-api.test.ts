import { api } from '@/lib/api-client'

// Mock fetch
global.fetch = jest.fn()

describe('Source Data API Methods', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    jest.clearAllMocks()
  })

  describe('Source Data Assignment', () => {
    it('should assign file to manuscript', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 123, file_id: 456 } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await api.sourceData.assignToManuscript('manuscript-1', 456)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/manuscripts/manuscript-1/source-data'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ file_id: 456 })
        })
      )
      expect(result.data).toEqual({ id: 123, file_id: 456 })
    })

    it('should assign file to figure', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 124, file_id: 456 } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await api.sourceData.assignToFigure('manuscript-1', 'figure-1', 456)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/manuscripts/manuscript-1/figures/figure-1/source-data'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ file_id: 456 })
        })
      )
      expect(result.data).toEqual({ id: 124, file_id: 456 })
    })

    it('should assign file to panel', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 125, file_id: 456 } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await api.sourceData.assignToPanel('manuscript-1', 'figure-1', 'panel-1', 456)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/manuscripts/manuscript-1/figures/figure-1/panels/panel-1/source-data'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ file_id: 456 })
        })
      )
      expect(result.data).toEqual({ id: 125, file_id: 456 })
    })
  })

  describe('Source Data Deletion', () => {
    it('should delete source data from manuscript', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { deleted: true } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await api.sourceData.deleteFromManuscript('manuscript-1', 'source-data-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/manuscripts/manuscript-1/source-data/source-data-123'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
      expect(result.data).toEqual({ deleted: true })
    })

    it('should delete source data from figure', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { deleted: true } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await api.sourceData.deleteFromFigure('manuscript-1', 'figure-1', 'source-data-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/manuscripts/manuscript-1/figures/figure-1/source-data/source-data-123'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
      expect(result.data).toEqual({ deleted: true })
    })

    it('should delete source data from panel', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { deleted: true } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await api.sourceData.deleteFromPanel('manuscript-1', 'figure-1', 'panel-1', 'source-data-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/manuscripts/manuscript-1/figures/figure-1/panels/panel-1/source-data/source-data-123'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
      expect(result.data).toEqual({ deleted: true })
    })
  })

  describe('Error Handling', () => {
    it('should handle assignment errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      await expect(api.sourceData.assignToManuscript('manuscript-1', 456))
        .rejects.toThrow('400: Bad Request')
    })

    it('should handle deletion errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      await expect(api.sourceData.deleteFromManuscript('manuscript-1', 'source-data-123'))
        .rejects.toThrow('404: Not Found')
    })
  })
})
