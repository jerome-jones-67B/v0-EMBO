/**
 * SeverityIcon Component
 *
 * Displays a consistent severity indicator icon across the application.
 * - Severity 1 (INFO): Blue circle with white "i"
 * - Severity 2 (WARNING): Yellow triangle with "!"
 * - Severity 3+ (ERROR): Red "X" icon
 */

import React from 'react'
import { X, Info, AlertTriangle } from 'lucide-react'

interface SeverityIconProps {
  severity: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SeverityIcon({ severity, className = '', size = 'md' }: SeverityIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const sizeClass = sizeClasses[size]

  if (severity >= 3) {
    // Error - Red X
    return (
      <X
        className={`${sizeClass} text-red-500 ${className}`}
        strokeWidth={3}
      />
    )
  } else if (severity === 2) {
    // Warning - Yellow triangle with exclamation
    return (
      <AlertTriangle
        className={`${sizeClass} text-yellow-500 ${className}`}
      />
    )
  } else if (severity === 1) {
    // Info - Blue circle with i
    return (
      <Info
        className={`${sizeClass} text-blue-500 ${className}`}
      />
    )
  }

  // Severity 0 or unknown - no icon needed
  return null
}

/**
 * SeverityIconForPanel Component
 *
 * Special version for individual figure view panels that includes the panel label
 * inside the severity indicator.
 */
interface SeverityIconForPanelProps {
  severity: number
  panelLabel: string
  className?: string
}

export function SeverityIconForPanel({ severity, panelLabel, className = '' }: SeverityIconForPanelProps) {
  if (severity === 3) {
    // Error - red square with panel label
    return (
      <div className={`inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-semibold ${className}`}>
        {panelLabel}
      </div>
    )
  } else if (severity === 2) {
    // Warning - yellow triangle with panel label
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className="relative w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[21px] border-b-yellow-500">
          <span className="absolute top-[6px] left-1/2 -translate-x-1/2 text-white text-xs font-semibold">
            {panelLabel}
          </span>
        </div>
      </div>
    )
  } else if (severity === 1) {
    // Info - blue circle with panel label
    return (
      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold ${className}`}>
        {panelLabel}
      </div>
    )
  }

  // Default - just return panel label
  return <span className={className}>{panelLabel}</span>
}
