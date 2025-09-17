// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    CHAT: '/chat',
    CASES_SEARCH: '/cases/search',
    CASES_DETAILS: '/case-details',
    HEALTH: '/health',
  },
  TIMEOUT: 30000, // 30 seconds
}

// Environment check
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
