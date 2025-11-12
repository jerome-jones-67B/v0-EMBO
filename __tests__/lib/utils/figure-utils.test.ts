/**
 * Tests for figure utilities
 */

import {
  isImageFile,
  formatFileSize,
  Severity,
  getSeverityBadgeConfig,
  extractCheckKey,
  extractSeverity,
  formatCheckDisplayName,
  hasValidCoordinates,
  calculateBoundingBox
} from '@/lib/utils/figure-utils'

describe('Figure Utils', () => {
  describe('isImageFile', () => {
    it('should return true for image MIME types', () => {
      expect(isImageFile('image/png')).toBe(true)
      expect(isImageFile('image/jpeg')).toBe(true)
      expect(isImageFile('image/gif')).toBe(true)
    })

    it('should return true for image file extensions', () => {
      expect(isImageFile('photo.jpg')).toBe(true)
      expect(isImageFile('figure1.png')).toBe(true)
      expect(isImageFile('IMAGE.TIFF')).toBe(true)
    })

    it('should return false for non-image files', () => {
      expect(isImageFile('document.pdf')).toBe(false)
      expect(isImageFile('data.xlsx')).toBe(false)
      expect(isImageFile('text/plain')).toBe(false)
    })

    it('should handle empty or null input', () => {
      expect(isImageFile('')).toBe(false)
      expect(isImageFile(null as any)).toBe(false)
      expect(isImageFile(undefined as any)).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(512)).toBe('512 B')
      expect(formatFileSize(1023)).toBe('1023 B')
    })

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(5120)).toBe('5.0 KB')
    })

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB')
      expect(formatFileSize(5242880)).toBe('5.0 MB')
    })

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })
  })

  describe('getSeverityBadgeConfig', () => {
    it('should return error config for severity 3', () => {
      const config = getSeverityBadgeConfig(Severity.ERROR)
      expect(config.variant).toBe('destructive')
      expect(config.label).toBe('Error')
      expect(config.iconName).toBe('XCircle')
    })

    it('should return warning config for severity 2', () => {
      const config = getSeverityBadgeConfig(Severity.WARNING)
      expect(config.variant).toBe('secondary')
      expect(config.label).toBe('Warning')
      expect(config.iconName).toBe('AlertTriangle')
    })

    it('should return info config for severity 1', () => {
      const config = getSeverityBadgeConfig(Severity.INFO)
      expect(config.variant).toBe('secondary')
      expect(config.label).toBe('Information')
      expect(config.iconName).toBe('Info')
    })

    it('should return pass config for severity 0', () => {
      const config = getSeverityBadgeConfig(Severity.PASS)
      expect(config.variant).toBe('outline')
      expect(config.label).toBe('Pass')
      expect(config.iconName).toBe('CheckCircle')
    })
  })

  describe('extractCheckKey', () => {
    it('should extract from nested check.check.name', () => {
      const check = { check: { name: 'quality_check' } }
      expect(extractCheckKey(check)).toBe('quality_check')
    })

    it('should extract from check as string', () => {
      const check = { check: 'quality_check' }
      expect(extractCheckKey(check)).toBe('quality_check')
    })

    it('should extract from check_name', () => {
      const check = { check_name: 'quality_check' }
      expect(extractCheckKey(check)).toBe('quality_check')
    })

    it('should extract from category.name', () => {
      const check = { category: { name: 'quality_check' } }
      expect(extractCheckKey(check)).toBe('quality_check')
    })

    it('should return default for invalid input', () => {
      expect(extractCheckKey({})).toBe('quality_check')
      expect(extractCheckKey(null)).toBe('quality_check')
    })
  })

  describe('extractSeverity', () => {
    it('should extract severity directly', () => {
      expect(extractSeverity({ severity: 3 })).toBe(3)
      expect(extractSeverity({ severity: 2 })).toBe(2)
    })

    it('should extract from nested category', () => {
      expect(extractSeverity({ category: { severity: 3 } })).toBe(3)
    })

    it('should map status to severity when severity is missing', () => {
      expect(extractSeverity({ status: 'fail' })).toBe(Severity.ERROR)
      expect(extractSeverity({ status: 'error' })).toBe(Severity.ERROR)
      expect(extractSeverity({ status: 'warning' })).toBe(Severity.WARNING)
      expect(extractSeverity({ status: 'warn' })).toBe(Severity.WARNING)
    })

    it('should return INFO for unknown status', () => {
      expect(extractSeverity({})).toBe(Severity.INFO)
    })
  })

  describe('formatCheckDisplayName', () => {
    it('should format underscore-separated names', () => {
      expect(formatCheckDisplayName('image_quality_check'))
        .toBe('Image Quality Check')
    })

    it('should use message lookup when available', () => {
      const messages = { 'quality_check': 'Custom Quality Check' }
      expect(formatCheckDisplayName('quality_check', messages))
        .toBe('Custom Quality Check')
    })

    it('should handle invalid keys gracefully', () => {
      expect(formatCheckDisplayName('')).toBe('Quality Check')
      expect(formatCheckDisplayName(null)).toBe('Quality Check')
      expect(formatCheckDisplayName(undefined)).toBe('Quality Check')
      expect(formatCheckDisplayName('[object Object]')).toBe('Quality Check')
    })
  })

  describe('hasValidCoordinates', () => {
    it('should return true for valid coordinates', () => {
      expect(hasValidCoordinates({ x1: 0, y1: 0, x2: 1, y2: 1 })).toBe(true)
      expect(hasValidCoordinates({ x1: 0.1, y1: 0.2, x2: 0.9, y2: 0.8 })).toBe(true)
    })

    it('should return false for null or undefined coordinates', () => {
      expect(hasValidCoordinates({ x1: null, y1: 0, x2: 1, y2: 1 })).toBe(false)
      expect(hasValidCoordinates({ x1: 0, y1: undefined, x2: 1, y2: 1 })).toBe(false)
    })

    it('should accept 0 as a valid coordinate', () => {
      expect(hasValidCoordinates({ x1: 0, y1: 0, x2: 0, y2: 0 })).toBe(true)
    })
  })

  describe('calculateBoundingBox', () => {
    it('should calculate bounding box from normalized coordinates', () => {
      const panel = { x1: 0.1, y1: 0.2, x2: 0.5, y2: 0.6 }
      const box = calculateBoundingBox(panel)

      expect(box.left).toBe(10)
      expect(box.top).toBe(20)
      expect(box.width).toBe(40)
      expect(box.height).toBe(40)
    })

    it('should handle edge cases', () => {
      const panel = { x1: 0, y1: 0, x2: 1, y2: 1 }
      const box = calculateBoundingBox(panel)

      expect(box.left).toBe(0)
      expect(box.top).toBe(0)
      expect(box.width).toBe(100)
      expect(box.height).toBe(100)
    })
  })
})
