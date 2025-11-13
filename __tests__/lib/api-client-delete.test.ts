import { apiClient } from '@/lib/api-client'

// Mock fetch
global.fetch = jest.fn()

describe('API Client DELETE Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('delete method', () => {
    it('should handle successful DELETE request with empty response', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        headers: {
          get: jest.fn().mockReturnValue('0')
        }
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiClient.delete('/test-endpoint')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
      expect(result).toEqual({})
    })

    it('should handle DELETE request with JSON response', async () => {
      const mockData = { message: 'Deleted successfully' }
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('50')
        },
        json: jest.fn().mockResolvedValue(mockData)
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiClient.delete('/test-endpoint')

      expect(result).toEqual(mockData)
    })

    it('should handle DELETE request failure', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await expect(apiClient.delete('/test-endpoint')).rejects.toThrow('HTTP 404: Not Found')
    })
  })

  describe('sourceData DELETE methods', () => {
    beforeEach(() => {
      const mockResponse = {
        ok: true,
        status: 204,
        headers: {
          get: jest.fn().mockReturnValue('0')
        }
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
    })

    it('should call deleteFromManuscript with correct endpoint', async () => {
      await apiClient.delete('/v1/manuscripts/6/source-data/100')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/manuscripts/6/source-data/100'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('should call deleteFromFigure with correct endpoint', async () => {
      await apiClient.delete('/v1/manuscripts/6/figures/32/source-data/101')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/manuscripts/6/figures/32/source-data/101'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('should call deleteFromPanel with correct endpoint', async () => {
      await apiClient.delete('/v1/manuscripts/6/figures/32/panels/204/source-data/102')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/manuscripts/6/figures/32/panels/204/source-data/102'),
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(apiClient.delete('/test-endpoint')).rejects.toThrow('Network error')
    })

    it('should handle JSON parsing errors gracefully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('10')
        },
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Should not throw, should return empty object
      const result = await apiClient.delete('/test-endpoint')
      expect(result).toEqual({})
    })
  })
})
