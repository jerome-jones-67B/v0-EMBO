// Simple logger utility for better console output management
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`ℹ️  ${message}`, ...args)
    }
  },

  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args)
  },

  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`⚠️  ${message}`, ...args)
    }
  },

  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`🐛 ${message}`, ...args)
    }
  },

  success: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, ...args)
    }
  }
}
