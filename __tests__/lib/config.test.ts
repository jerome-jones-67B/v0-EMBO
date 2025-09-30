import { config, buildApiUrl } from '@/lib/config'

describe('config', () => {
  describe('config object', () => {
    it('should have required API configuration', () => {
      expect(config.api).toBeDefined()
      expect(config.api.baseUrl).toBeDefined()
      expect(config.api.timeout).toBeDefined()
      expect(config.api.retries).toBeDefined()
    })

    it('should have feature flags', () => {
      expect(config.features).toBeDefined()
      expect(typeof config.features.useMockData).toBe('boolean')
      expect(typeof config.features.enableRealTimeUpdates).toBe('boolean')
      expect(typeof config.features.enableAnalytics).toBe('boolean')
    })

    it('should have pagination defaults', () => {
      expect(config.pagination).toBeDefined()
      expect(config.pagination.defaultLimit).toBe(20)
      expect(config.pagination.maxLimit).toBe(100)
    })

    it('should have upload configuration', () => {
      expect(config.upload).toBeDefined()
      expect(config.upload.maxFileSize).toBeDefined()
      expect(config.upload.allowedTypes).toBeDefined()
      expect(Array.isArray(config.upload.allowedTypes)).toBe(true)
    })
  })

  describe('buildApiUrl', () => {
    it('should build correct API URL', () => {
      const endpoint = '/v1/manuscripts'
      const result = buildApiUrl(endpoint)
      
      expect(result).toBe(`${config.api.baseUrl}${endpoint}`)
    })

    it('should handle empty endpoint', () => {
      const result = buildApiUrl('')
      expect(result).toBe(config.api.baseUrl)
    })

    it('should handle endpoint with leading slash', () => {
      const endpoint = '/v1/test'
      const result = buildApiUrl(endpoint)
      
      expect(result).toBe(`${config.api.baseUrl}${endpoint}`)
    })

    it('should handle endpoint without leading slash', () => {
      const endpoint = 'v1/test'
      const result = buildApiUrl(endpoint)
      
      expect(result).toBe(`${config.api.baseUrl}/${endpoint}`)
    })
  })
})
