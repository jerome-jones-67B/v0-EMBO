"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { shouldBypassAuthClient } from "@/lib/auth-bypass"

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
  const { data: session, status } = useSession()
  const router = useRouter()

  // Check if we should bypass authentication (demo mode)
  const bypassAuth = shouldBypassAuthClient()
  

  // In demo mode, render content directly without authentication
  if (bypassAuth) {
    return <>{children}</>
  }

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push(fallbackPath)
      return
    }

    // Check role requirement
    if (requireRole && session.user?.role !== requireRole) {
      router.push("/auth/error?error=AccessDenied")
      return
    }
  }, [session, status, requireRole, router, fallbackPath])

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              Checking authentication...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!session) {
    return null
  }

  // Check role requirement
  if (requireRole && session.user?.role !== requireRole) {
    return null
  }

  // Render protected content
  return <>{children}</>
}
