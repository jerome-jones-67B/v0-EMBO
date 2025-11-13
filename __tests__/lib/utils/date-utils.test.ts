import { formatDate, getRelativeTime } from '@/lib/utils/date-utils'

describe('date-utils', () => {
  const testDate = new Date('2024-01-15T10:30:00Z')
  const testDateString = '2024-01-15T10:30:00Z'

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate(testDate)
      expect(result).toBe('Jan 15, 2024')
    })

    it('should handle date string input', () => {
      const result = formatDate(testDateString)
      expect(result).toBe('Jan 15, 2024')
    })

    it('should handle invalid date', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('Invalid Date')
    })
  })

  describe('getRelativeTime', () => {
    it('should return "Just now" for very recent dates', () => {
      const recentDate = new Date(Date.now() - 30 * 1000) // 30 seconds ago
      const result = getRelativeTime(recentDate)
      expect(result).toBe('Just now')
    })

    it('should return hours ago for recent dates', () => {
      const recentDate = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      const result = getRelativeTime(recentDate)
      expect(result).toContain('hours ago')
    })

    it('should return days ago for older dates', () => {
      const oldDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      const result = getRelativeTime(oldDate)
      expect(result).toContain('days ago')
    })

    it('should return weeks ago for very old dates', () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      const result = getRelativeTime(oldDate)
      expect(result).toContain('weeks ago')
    })

    it('should handle invalid date', () => {
      const result = getRelativeTime('invalid-date')
      expect(result).toBe('Invalid Date')
    })
  })
})
