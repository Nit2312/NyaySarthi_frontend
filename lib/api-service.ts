import { API_CONFIG } from './config'

const API_BASE_URL = API_CONFIG.BASE_URL

export interface ChatResponse {
  response: string
}

export interface ChatRequest {
  input: string
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

  static async sendChatMessage(message: string): Promise<ChatResponse> {
    // Create form data for the backend endpoint
    const formData = new FormData()
    formData.append('input', message)

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

  static async checkHealth(): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/')
  }
}
