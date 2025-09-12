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
    timeoutMs: number = 60000 // Increased timeout to 60 seconds
  ): Promise<{ 
    response: string; 
    cases: CaseDoc[]; 
    source: 'indian_kanoon'; 
    ik_error?: string | null; 
    query_used?: string;
    success: boolean;
  }> {
    const formData = new URLSearchParams()
    formData.append('input', query)
    formData.append('limit', String(limit))

    const url = `${API_BASE_URL}${API_CONFIG.ENDPOINTS.CASES_SEARCH}`
    console.log('Making request to:', url, 'with query:', query)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log('Request timeout reached, aborting...')
      controller.abort(new Error(`Request timed out after ${timeoutMs}ms`))
    }, timeoutMs)
    
    try {
      console.log('Sending search request...')
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
      })
      
      clearTimeout(timeoutId)
      
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
      clearTimeout(timeoutId)
      
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
    const formData = new URLSearchParams()
    formData.append('doc_id', docId)
    if (description) formData.append('description', description)

    const url = `${API_BASE_URL}${API_CONFIG.ENDPOINTS.CASES_DETAILS}`
    console.log('Fetching case details for docId:', docId)
    
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
      
      clearTimeout(timeoutId)

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
      clearTimeout(timeoutId)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : { error }
      
      console.error('Case details fetch failed:', {
        error: errorMessage,
        details: errorDetails,
        url,
        docId
      })
      
      throw new Error(
        errorMessage.includes('timeout') 
          ? errorMessage 
          : 'Failed to load case details. Please try again later.'
      )
    }
  }
}
