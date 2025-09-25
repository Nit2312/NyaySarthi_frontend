import { API_CONFIG } from './config';

import type { CaseDoc, CaseDetailsResponse } from './types/case';

// Extend the Error interface to include status property
interface ErrorWithStatus extends Error {
  status?: number;
}

const API_BASE_URL = API_CONFIG.BASE_URL;

// In-memory cache for case details
interface CachedCaseDetails {
  data: any;
  timestamp: number;
}

const caseDetailsCache = new Map<string, CachedCaseDetails>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

class ApiService {
  /**
   * Check the health status of the API
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly MAX_RETRIES = 2;
  private static readonly REQUEST_TIMEOUT = 30000; // 30 seconds for the actual request

  /**
   * Get case details with caching and retry logic
   */
  static async getCaseDetails(
    docId: string, 
    description?: string,
    signal?: AbortSignal,
    timeoutMs: number = this.DEFAULT_TIMEOUT,
    retryCount: number = 0,
    maxRetries: number = this.MAX_RETRIES,
    useCache: boolean = true
  ): Promise<CaseDetailsResponse> {
    const cacheKey = this.getCacheKey(docId, description);
    const requestId = `case-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const startTime = performance.now();
    
    // Check cache first if enabled
    if (useCache) {
      const cached = caseDetailsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        console.log(`[${requestId}] Returning cached case details for ${docId}`);
        return { 
          ...cached.data, 
          cache_status: 'hit' as const,
          _cachedAt: cached.timestamp
        };
      }
    }
    
    // Prepare the request to use Next.js API route
    const endpoint = `/api${API_CONFIG.ENDPOINTS.CASES_DETAILS}`;
    console.log(`[${requestId}] Making request to: ${endpoint}`);
    
    // Use URLSearchParams for form data
    const formData = new URLSearchParams();
    formData.append('doc_id', docId);
    if (description) {
      formData.append('description', description);
    }
    
    // Log request details (without sensitive data)
    console.log(`[${requestId}] Request details:`, {
      docId: docId ? `${docId.substring(0, 4)}...` : 'none',
      hasDescription: !!description,
      useCache,
      endpoint
    });
    
    let response: Response;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const controller = new AbortController();
    
    try {
      // Set up a promise that will reject after the timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error(`Request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      // Set up signal handling
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId!);
          controller.abort();
        });
      }
      
      // Make the request through Next.js API route
      console.log(`[${requestId}] Fetching case details for document`);
      try {
        const requestOptions: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Request-ID': requestId,
            'Accept': 'application/json'
          },
          body: formData.toString(),
          signal: controller.signal,
          // Remove credentials for same-origin requests
          credentials: 'same-origin'
        };
        
        // Log minimal request info
        console.log(`[${requestId}] Sending request to ${endpoint}`);
        
        // Race between the fetch and the timeout
        response = await Promise.race([
          fetch(endpoint, requestOptions),
          timeoutPromise
        ]) as Response;
      } catch (error) {
        // Clear the timeout to prevent memory leaks
        if (timeoutId) clearTimeout(timeoutId);
        
        let errorMessage = 'Unknown error';
        let isTimeout = false;
        
        if (error instanceof Error) {
          errorMessage = error.message;
          isTimeout = errorMessage.includes('time') || error.name === 'AbortError';
        } else if (typeof error === 'string') {
          errorMessage = error;
          isTimeout = error.toLowerCase().includes('time');
        }
        
        console.error(`[${requestId}] Request error:`, error);
        
        // More detailed error information
        const errorDetails = {
          message: isTimeout ? 'Request timed out' : 'Failed to connect to the server',
          details: errorMessage,
          endpoint,
          docId: docId ? `${docId.substring(0, 4)}...` : 'none',
          timestamp: new Date().toISOString(),
          type: isTimeout ? 'timeout' : 'network_error'
        };
        
        console.error(`[${requestId}] Error details:`, errorDetails);
        
        // Re-throw with better error message
        const errorToThrow = new Error(JSON.stringify(errorDetails, null, 2));
        errorToThrow.name = isTimeout ? 'TimeoutError' : 'NetworkError';
        throw errorToThrow;
      }
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      const responseTime = Math.round(performance.now() - startTime);
      console.log(`[${requestId}] Response received in ${responseTime}ms`);
      
      if (!response.ok) {
        let errorData: { message: string; detail?: string; code?: string; status?: number } = { 
          message: 'Unknown error occurred',
          status: response.status
        };
        
        try {
          const errorText = await response.text();
          errorData = errorText ? JSON.parse(errorText) : { 
            message: `HTTP ${response.status}`, 
            status: response.status 
          };
        } catch (e) {
          console.warn(`[${requestId}] Failed to parse error response:`, e);
        }

        const error = new Error(
          errorData.detail || errorData.message || `HTTP ${response.status}: Failed to fetch case details`
        ) as ErrorWithStatus;
        error.status = response.status;

        // If it's a server error and we have retries left, retry with exponential backoff
        if (response.status >= 500 && retryCount < maxRetries) {
          const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 3000);
          console.log(`[${requestId}] Retrying after ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          return this.getCaseDetails(
            docId, 
            description, 
            signal, 
            timeoutMs, 
            retryCount + 1, 
            maxRetries, 
            useCache
          );
        }

        throw error;
      }

      const data = await response.json() as CaseDetailsResponse;

      if (!data.success) {
        const error = new Error(data.error || 'Failed to process case details') as ErrorWithStatus;
        error.status = 500;
        throw error;
      }

      // Add analysis status if not present
      if (!data.analysis_status) {
        data.analysis_status = data.similar_points?.length ? 'complete' : 'partial';
      }

      // Add cache timestamp
      data._cachedAt = Date.now();

      // Cache the result if caching is enabled
      if (useCache) {
        caseDetailsCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }

      return {
        ...data,
        cache_status: 'miss' as const
      };

    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);

      // Log the error for debugging
      console.error(`[${requestId}] Error in getCaseDetails:`, error);

      // Handle abort errors
      if (error?.name === 'AbortError') {
        if (retryCount < maxRetries) {
          const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 3000);
          console.log(`[${requestId}] Request timed out, retrying after ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          return this.getCaseDetails(
            docId, 
            description, 
            signal, 
            timeoutMs, 
            retryCount + 1, 
            maxRetries, 
            useCache
          );
        }
        throw new Error('Request took too long to complete. Please try again.');
      }
      
      // Handle specific HTTP status codes
      const status = (error as ErrorWithStatus).status;
      if (status) {
        if (status === 504) {
          throw new Error('The server took too long to respond. Please try again.');
        }
        
        if (status === 404) {
          throw new Error('Case not found. The document ID may be invalid.');
        }
      }
      
      throw error;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  /**
   * Generate a cache key for case details
   */
  private static getCacheKey(docId: string, description?: string): string {
    return description ? `${docId}:${description}` : docId;
  }

  /**
   * Send a chat message to the backend
   */
  static async sendChatMessage(
    message: string,
    conversationId: string,
    options?: { prefer?: string },
    signal?: AbortSignal
  ): Promise<{
    response: string;
    conversation_id?: string;
    source?: string;
    cases?: any[];
    ik_error?: string;
  }> {
    const requestId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const url = `${API_BASE_URL}/chat`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          input: message,
          conversation_id: conversationId,
          ...(options?.prefer ? { prefer: options.prefer } : {}),
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`[${requestId}] Error sending chat message:`, error);
      throw error;
    }
  }
}

export { ApiService };
