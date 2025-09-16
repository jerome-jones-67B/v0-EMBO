/**
 * Development bypass for authentication
 * This allows API endpoints to work during development without full auth setup
 */

export function shouldBypassAuth(): boolean {
  // Bypass auth in development mode or if explicitly disabled
  return process.env.NODE_ENV === "development" || process.env.BYPASS_AUTH === "true"
}

export function getDevUser() {
  return {
    id: "dev-user",
    email: "editorial.assistant@embo.org",
    name: "Development User",
    role: "editorial_assistant",
  }
}
