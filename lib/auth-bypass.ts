/**
 * Centralized authentication bypass logic
 * This ensures consistent behavior across client and server components
 */

export function shouldBypassAuth(): boolean {
  const isDevelopment = process.env.NODE_ENV === "development"
  const bypassAuthFlag = process.env.BYPASS_AUTH === "true"
  const publicBypassFlag = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
  const mockDataFlag = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
  
  const shouldBypass = isDevelopment || bypassAuthFlag || publicBypassFlag || mockDataFlag
  
  
  return shouldBypass
}

export function getDevUser() {
  return {
    id: "dev-user",
    email: "editorial.assistant@embo.org",
    name: "Development User",
    role: "editorial_assistant",
  }
}

/**
 * Client-side auth bypass check (for components)
 * This is specifically for React components that run in the browser
 */
export function shouldBypassAuthClient(): boolean {
  // Only check client-accessible environment variables
  const isDevelopment = process.env.NODE_ENV === "development"
  const publicBypassFlag = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true"
  const mockDataFlag = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"
  
  const shouldBypass = isDevelopment || publicBypassFlag || mockDataFlag
  
  
  return shouldBypass
}
