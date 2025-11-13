import { api } from '@/lib/api-client'

// Mock fetch
global.fetch = jest.fn()

describe('Source Data DELETE API Methods', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    jest.clearAllMocks()
  })

  describe('DELETE operations', () => {
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

  describe('Error handling for DELETE operations', () => {
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

    it('should handle network errors during deletion', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(api.sourceData.deleteFromFigure('manuscript-1', 'figure-1', 'source-data-123'))
        .rejects.toThrow('Network error')
    })
  })

  describe('Integration with manuscript details', () => {
    it('should fetch manuscript details to find source data IDs', async () => {
      const manuscriptResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            source_data: [
              { id: 123, file_id: 1, figure_id: 1, panel_id: 1 }
            ]
          }
        })
      }
      mockFetch.mockResolvedValue(manuscriptResponse as any)

      const result = await api.manuscripts.getById('manuscript-1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/manuscripts/manuscript-1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
      expect(result.data.source_data).toHaveLength(1)
      expect(result.data.source_data[0].id).toBe(123)
    })
  })
})
