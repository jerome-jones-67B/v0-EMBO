import { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string
  role: string
}

/**
 * Validate API request authentication using NextAuth.js JWT
 */
export async function validateApiAuth(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    console.log("🔍 Validating API auth...")
    console.log("📋 Headers:", Object.fromEntries(request.headers.entries()))
    console.log("🔑 NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET)
    
    // Get token from NextAuth.js JWT
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token"
    })

    console.log("🎫 Token found:", !!token)
    console.log("🎫 Token data:", token ? { email: token.email, role: token.role } : null)

    if (!token) {
      console.log("❌ No token found - creating default user for development")
      // For development/demo purposes, return a default user
      if (process.env.NODE_ENV === "development") {
        return {
          id: "demo-user",
          email: "editorial.assistant@embo.org",
          name: "Demo Editorial Assistant",
          role: "editorial_assistant",
        }
      }
      return null
    }

    return {
      id: token.userId as string || token.sub as string,
      email: token.email as string,
      name: token.name as string,
      role: token.role as string || "editorial_assistant",
    }
  } catch (error) {
    console.error("API Auth validation error:", error)
    // For development, allow access with demo user
    if (process.env.NODE_ENV === "development") {
      console.log("🔧 Development mode - allowing access with demo user")
      return {
        id: "demo-user",
        email: "editorial.assistant@embo.org", 
        name: "Demo Editorial Assistant",
        role: "editorial_assistant",
      }
    }
    return null
  }
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(
  user: AuthenticatedUser,
  requiredRole?: string
): boolean {
  if (!requiredRole) return true
  
  // Admin role has access to everything
  if (user.role === "admin") return true
  
  return user.role === requiredRole
}

/**
 * Create unauthorized response
 */
export function createUnauthorizedResponse(message = "Unauthorized") {
  return Response.json(
    { error: message },
    { status: 401 }
  )
}

/**
 * Create forbidden response
 */
export function createForbiddenResponse(message = "Insufficient permissions") {
  return Response.json(
    { error: message },
    { status: 403 }
  )
}
