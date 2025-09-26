import React from 'react'

interface SafeRenderProps {
  data: any
  fallback?: React.ReactNode
  children?: (data: any) => React.ReactNode
}

export function SafeRender({ data, fallback = 'Invalid data', children }: SafeRenderProps) {
  // Check if data is safely renderable
  if (data === null || data === undefined) {
    return <>{fallback}</>
  }
  
  if (typeof data === 'object' && !React.isValidElement(data)) {
    console.warn('🛡️ SafeRender: Attempted to render object directly:', data)
    return <>{fallback}</>
  }
  
  if (children) {
    try {
      return <>{children(data)}</>
    } catch (error) {
      console.error('🛡️ SafeRender: Error in children function:', error)
      return <>{fallback}</>
    }
  }
  
  return <>{data}</>
}

export function SafeString({ value, fallback = '' }: { value: any; fallback?: string }) {
  if (typeof value === 'string') return <>{value}</>
  if (typeof value === 'number') return <>{value.toString()}</>
  if (value === null || value === undefined) return <>{fallback}</>
  
  console.warn('🛡️ SafeString: Converting object to string:', value)
  return <>{String(value) || fallback}</>
}
