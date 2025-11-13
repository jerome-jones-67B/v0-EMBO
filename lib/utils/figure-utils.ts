/**
 * Figure Utilities
 *
 * This module provides utility functions for working with figure data,
 * including severity indicators, file type checking, and badge generation.
 *
 * @module figure-utils
 */

/**
 * Determines if a given content type or filename represents an image file
 *
 * @param contentTypeOrFilename - The content type (MIME type) or filename to check
 * @returns True if the content type or filename indicates an image file
 *
 * @example
 * ```typescript
 * isImageFile('image/png') // returns true
 * isImageFile('figure1.jpg') // returns true
 * isImageFile('document.pdf') // returns false
 * ```
 */
export function isImageFile(contentTypeOrFilename: string): boolean {
  if (!contentTypeOrFilename) return false

  const lower = contentTypeOrFilename.toLowerCase()

  // Check for MIME type
  if (lower.startsWith('image/')) return true

  // Check for common image file extensions
  const imageExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'svg',
    'tiff', 'tif', 'webp', 'bmp', 'ico'
  ]

  return imageExtensions.some(ext => lower.includes(ext)) ||
         lower.includes('figure') ||
         lower.includes('image')
}

/**
 * Formats a file size from bytes to a human-readable string
 *
 * @param size - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 *
 * @example
 * ```typescript
 * formatFileSize(1024) // returns "1.0 KB"
 * formatFileSize(1048576) // returns "1.0 MB"
 * formatFileSize(512) // returns "512 B"
 * ```
 */
export function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Severity levels for validation checks
 */
export enum Severity {
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  PASS = 0
}

/**
 * Gets a React component representing a severity badge
 *
 * @param severity - The severity level (0 = pass, 1 = info, 2 = warning, 3 = error)
 * @returns Object containing the badge variant and an icon component
 *
 * @example
 * ```typescript
 * const badge = getSeverityBadgeConfig(3)
 * // badge.variant === 'destructive'
 * // badge.icon === <XCircle />
 * // badge.label === 'Error'
 * ```
 */
export function getSeverityBadgeConfig(severity: number): {
  variant: 'destructive' | 'secondary' | 'outline'
  label: string
  iconName: 'XCircle' | 'AlertTriangle' | 'Info' | 'CheckCircle'
  colorClass: string
} {
  switch (severity) {
    case Severity.ERROR:
      return {
        variant: 'destructive',
        label: 'Error',
        iconName: 'XCircle',
        colorClass: 'text-red-500'
      }
    case Severity.WARNING:
      return {
        variant: 'secondary',
        label: 'Warning',
        iconName: 'AlertTriangle',
        colorClass: 'text-yellow-500'
      }
    case Severity.INFO:
      return {
        variant: 'secondary',
        label: 'Information',
        iconName: 'Info',
        colorClass: 'text-blue-500'
      }
    default:
      return {
        variant: 'outline',
        label: 'Pass',
        iconName: 'CheckCircle',
        colorClass: 'text-green-500'
      }
  }
}

/**
 * Generates a severity indicator component configuration for displaying in tables
 *
 * @param severity - The severity level
 * @param panelLabel - The label to display inside the indicator
 * @returns Object containing styling information for the severity indicator
 *
 * @example
 * ```typescript
 * const indicator = getSeverityIndicatorConfig(3, 'A')
 * // Returns config for a red square with 'A' inside
 * ```
 */
export function getSeverityIndicatorConfig(
  severity: number,
  panelLabel: string
): {
  shape: 'square' | 'triangle' | 'circle'
  bgColor: string
  label: string
} {
  if (severity === Severity.ERROR) {
    return {
      shape: 'square',
      bgColor: 'bg-red-500',
      label: panelLabel
    }
  } else if (severity === Severity.WARNING) {
    return {
      shape: 'triangle',
      bgColor: 'bg-yellow-500',
      label: panelLabel
    }
  } else if (severity === Severity.INFO) {
    return {
      shape: 'circle',
      bgColor: 'bg-blue-500',
      label: panelLabel
    }
  }

  return {
    shape: 'circle',
    bgColor: 'bg-green-500',
    label: panelLabel
  }
}

/**
 * Extracts a clean check key from a check result object
 * Handles various API response formats
 *
 * @param check - The check result object
 * @returns A string representing the check key/name
 *
 * @example
 * ```typescript
 * extractCheckKey({ check: { name: 'quality_check' } }) // returns 'quality_check'
 * extractCheckKey({ check: 'quality_check' }) // returns 'quality_check'
 * extractCheckKey({ check_name: 'quality_check' }) // returns 'quality_check'
 * ```
 */
export function extractCheckKey(check: any): string {
  // Handle nested check object structure: check.check.name
  if (check.check && typeof check.check === 'object' && check.check.name) {
    return check.check.name
  }

  // Fallback to check as string
  if (check.check && typeof check.check === 'string') {
    return check.check
  }

  // Try check_name
  if (check.check_name) {
    return typeof check.check_name === 'string'
      ? check.check_name
      : String(check.check_name)
  }

  // Handle nested category object: category.name
  if (check.category && typeof check.category === 'object' && check.category.name) {
    return check.category.name
  }

  // Fallback to category as string
  if (check.category && typeof check.category === 'string') {
    return check.category
  }

  return 'quality_check'
}

/**
 * Extracts severity from a check result, with fallback logic
 *
 * @param check - The check result object
 * @returns The severity level (1-3)
 */
export function extractSeverity(check: any): number {
  let severity = check.severity

  // Try to get from nested category
  if (!severity && check.category && typeof check.category === 'object') {
    severity = check.category.severity
  }

  // Map negative or missing severity to a default based on status
  if (!severity || severity < 0) {
    if (check.status === 'fail' || check.status === 'error') return Severity.ERROR
    if (check.status === 'warning' || check.status === 'warn') return Severity.WARNING
    return Severity.INFO
  }

  return severity
}

/**
 * Formats a check key into a human-readable display name
 *
 * @param checkKey - The check key to format
 * @param messages - Optional lookup object for check names
 * @returns A formatted display name
 *
 * @example
 * ```typescript
 * formatCheckDisplayName('image_quality_check')
 * // returns 'Image Quality Check'
 * ```
 */
export function formatCheckDisplayName(
  checkKey: any,
  messages?: Record<string, string>
): string {
  const key = typeof checkKey === 'string' ? checkKey : String(checkKey || '')

  // Handle invalid values
  if (!key || key === '' || key === 'undefined' ||
      key === 'null' || key === '[object Object]') {
    return 'Quality Check'
  }

  // Look up in messages or format the key nicely
  try {
    if (messages && messages[key]) {
      return messages[key]
    }

    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  } catch (error) {
    console.error('Error formatting check key:', key, error)
    return 'Quality Check'
  }
}

/**
 * Checks if panel bounding box coordinates are valid
 *
 * @param panel - Panel object with coordinates
 * @returns True if the panel has valid coordinates
 */
export function hasValidCoordinates(panel: {
  x1?: number | null
  y1?: number | null
  x2?: number | null
  y2?: number | null
}): boolean {
  return panel.x1 != null &&
         panel.y1 != null &&
         panel.x2 != null &&
         panel.y2 != null
}

/**
 * Calculates bounding box dimensions from normalized coordinates (0-1)
 *
 * @param panel - Panel with normalized coordinates
 * @returns Bounding box dimensions in percentages
 */
export function calculateBoundingBox(panel: {
  x1: number
  y1: number
  x2: number
  y2: number
}): {
  left: number
  top: number
  width: number
  height: number
} {
  return {
    left: panel.x1 * 100,
    top: panel.y1 * 100,
    width: (panel.x2 - panel.x1) * 100,
    height: (panel.y2 - panel.y1) * 100
  }
}
