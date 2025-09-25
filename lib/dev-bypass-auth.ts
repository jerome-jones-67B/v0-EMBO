/**
 * Development bypass for authentication
 * This allows API endpoints to work during development without full auth setup
 * 
 * @deprecated Use lib/auth-bypass.ts instead for centralized auth bypass logic
 */

import { shouldBypassAuth as centralizedBypass, getDevUser as centralizedGetDevUser } from './auth-bypass'

export function shouldBypassAuth(): boolean {
  return centralizedBypass()
}

export function getDevUser() {
  return centralizedGetDevUser()
}
