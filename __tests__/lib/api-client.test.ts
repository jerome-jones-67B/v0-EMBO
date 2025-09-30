import { apiClient } from '@/lib/api-client'

// Mock fetch
global.fetch = jest.fn()

describe.skip('ApiClient', () => {
  let mockFetch: jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    jest.clearAllMocks()
  })

  describe('GET requests', () => {
    it('should make GET request with correct URL', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { test: 'value' } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await apiClient.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.any(Object))
      expect(result).toEqual({ test: 'value' })
    })

    it('should make GET request with query parameters', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { test: 'value' } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await apiClient.get('/test', { page: 1, limit: 10 })

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test?page=1&limit=10'), expect.any(Object))
      expect(result).toEqual({ test: 'value' })
    })

    it('should handle GET request errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      await expect(apiClient.get('/test')).rejects.toThrow('404: Not Found')
    })
  })

  describe('POST requests', () => {
    it('should make POST request with data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 1 } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const data = { name: 'Test' }
      const result = await apiClient.post('/test', data)

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(data)
      }))
      expect(result).toEqual({ id: 1 })
    })
  })

  describe('PUT requests', () => {
    it('should make PUT request with data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 1, updated: true } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const data = { name: 'Updated Test' }
      const result = await apiClient.put('/test/1', data)

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test/1'), expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(data)
      }))
      expect(result).toEqual({ id: 1, updated: true })
    })
  })

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { deleted: true } })
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      const result = await apiClient.delete('/test/1')

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test/1'), expect.objectContaining({
        method: 'DELETE'
      }))
      expect(result).toEqual({ deleted: true })
    })
  })

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(apiClient.get('/test')).rejects.toThrow('Network error')
    })

    it('should handle JSON parsing errors', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      }
      mockFetch.mockResolvedValue(mockResponse as any)

      await expect(apiClient.get('/test')).rejects.toThrow('Invalid JSON')
    })
  })
})
