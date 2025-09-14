import { API_CONFIG } from './config'

const API_BASE_URL = API_CONFIG.BASE_URL

export interface CaseDoc {
  id: string
  title: string
  court?: string
  date?: string
  citation?: string
  url?: string
  summary?: string
}

export interface ChatResponse {
  response: string
  conversation_id?: string
  source?: 'constitution_rag' | 'indian_kanoon'
  cases?: CaseDoc[]
  ik_error?: string | null
  query_used?: string
}

export interface ChatRequest {
  input: string
  conversation_id?: string
}

export class ApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, defaultOptions)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  static async sendChatMessage(message: string, conversationId?: string): Promise<ChatResponse> {
    // Create form data for the backend endpoint
    const formData = new FormData()
    formData.append('input', message)
    if (conversationId) {
      formData.append('conversation_id', conversationId)
    }

    const url = `${API_BASE_URL}/chat`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Chat API request failed:', error)
      throw error
    }
  }

  static async searchCases(
    query: string, 
    limit: number = 5,
    timeoutMs: number = 30000 // 30 seconds default timeout
  ): Promise<{ 
    response: string; 
    cases: CaseDoc[]; 
    source: 'indian_kanoon'; 
    ik_error?: string | null; 
    query_used?: string;
    success: boolean;
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const formData = new URLSearchParams()
    formData.append('input', query)
    formData.append('limit', String(limit))

    const url = `${API_BASE_URL}${API_CONFIG.ENDPOINTS.CASES_SEARCH}`
    
    try {
      console.log(`[API] Sending search request to: ${url}`, { query, limit });
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      })
      
      if (!response.ok) {
        let errorText = 'No error details available'
        try {
          const errorData = await response.json()
          errorText = errorData.message || JSON.stringify(errorData)
        } catch (e) {
          console.warn('Failed to parse error response:', e)
        }
        
        const errorInfo = {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error: errorText
        }
        
        console.error('Search API error:', errorInfo)
        throw new Error(`Search failed with status ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('API Response received:', { url, status: response.status })
      
      if (!data) {
        throw new Error('Received empty response from server')
      }
      
      return {
        ...data,
        success: true,
        cases: Array.isArray(data.cases) ? data.cases : []
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : { error }
      
      console.error('Search API request failed:', {
        error: errorMessage,
        details: errorDetails,
        url,
        query
      })
      
      return {
        response: 'Failed to fetch cases. The server might be taking longer than expected. Please try again in a moment.',
        cases: [],
        source: 'indian_kanoon',
        success: false,
        ik_error: errorMessage
      }
    }
  }

  static async checkHealth(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/')
  }

  static async getCaseDetails(
    docId: string, 
    description?: string,
    signal?: AbortSignal,
    timeoutMs: number = 90000 // 90 seconds for case details
  ): Promise<{
    case: CaseDoc & { full_text?: string; full_text_html?: string }
    similarity_score: number
    similar_points: string[]
    query_terms?: string[]
    success: boolean
    error?: string
  }> {
    if (!docId) {
      throw new Error('Document ID is required')
    }
    const formData = new URLSearchParams()
    formData.append('doc_id', docId.trim())
    if (description && description.trim()) {
      formData.append('description', description.trim())
    }

    const endpoint = API_CONFIG.ENDPOINTS.CASES_DETAILS
    const url = `${API_BASE_URL}${endpoint}`
    
    console.log('Fetching case details:', {
      docId: docId,
      hasDescription: !!description,
      timeoutMs,
      url: `${API_BASE_URL}${endpoint}`
    })
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log('Case details request timeout reached, aborting...')
      controller.abort(new Error(`Request timed out after ${timeoutMs}ms. The case details are taking longer than expected to load.`))
    }, timeoutMs)
    
    try {
      const response = await fetch(url, { 
        method: 'POST', 
        body: formData,
        signal: signal || controller.signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        let errorText = 'No error details available'
        try {
          errorText = await response.text()
        } catch (e) {
          console.warn('Failed to read error response body:', e)
        }
        
        const errorInfo = {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          docId,
          error: errorText
        }
        
        console.error('Case details API error:', errorInfo)
        
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error('Case not found')
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(`Failed to fetch case details: ${response.statusText}`)
        }
      }

      const data = await response.json()
      console.log('Case details API response received:', { 
        url, 
        status: response.status,
        docId,
        hasCaseData: !!data?.case
      })
      
      if (!data || !data.case) {
        throw new Error('Invalid response format from server: Missing case data')
      }
      
      return data
      
    } catch (error) {
      let errorMessage = 'Failed to load case details.'
      let errorDetails: Record<string, any> = {}
      
      if (error instanceof Error) {
        errorMessage = error.message
        errorDetails = {
          name: error.name,
          stack: error.stack,
          isNetworkError: error.message.includes('Failed to fetch') || 
                         error.message.includes('NetworkError') ||
                         error.message.includes('Network request failed')
        }
        
        // Handle specific error cases
        if (error.name === 'AbortError') {
          errorMessage = 'Request was cancelled or timed out.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.'
        }
      } else {
        errorDetails = { error }
      }
      
      console.error('Case details fetch failed:', {
        error: errorMessage,
        ...errorDetails,
        url,
        endpoint: API_CONFIG.ENDPOINTS.CASES_DETAILS,
        docId,
        timestamp: new Date().toISOString()
      })
      
      // Only include the original message if it's a timeout
      const userFacingMessage = errorMessage.includes('timeout') || 
                              errorMessage.includes('AbortError')
        ? errorMessage 
        : 'Failed to load case details. Please try again later.'
      
      const errorToThrow = new Error(userFacingMessage)
      errorToThrow.name = error instanceof Error ? error.name : 'ApiError'
      throw errorToThrow
    }
  }
}
