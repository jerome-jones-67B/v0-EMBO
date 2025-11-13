"use client"

import { ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
  requireRole?: string
  fallbackPath?: string
}

export function AuthGuard({
  children,
  requireRole,
  fallbackPath = "/auth/signin"
}: AuthGuardProps) {
  // For static builds, we don't need authentication guards
  // All authentication is handled via API tokens
  return <>{children}</>
}
