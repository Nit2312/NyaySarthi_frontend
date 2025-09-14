import { API_CONFIG } from './config';

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
  private static readonly DEFAULT_TIMEOUT = 30000;
  private static readonly MAX_RETRIES = 2;

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
    
    // Prepare the request
    const url = new URL(`${API_BASE_URL}/case/${encodeURIComponent(docId)}`);
    if (description) {
      url.searchParams.append('description', description);
    }
    
    let response: Response;
    let timeoutId: NodeJS.Timeout | null = null;
    const controller = new AbortController();
    
    try {
      // Set up timeout and signal handling
      if (signal) {
        signal.addEventListener('abort', () => controller.abort());
      }
      
      // Set up timeout
      timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);
      
      // Make the request
      console.log(`[${requestId}] Fetching case details for ${docId}`);
      response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Request-ID': requestId
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      timeoutId = null;
      
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
}

// Define the CaseDetailsResponse interface
interface CaseDetailsResponse {
  case: any;
  similarity_score: number;
  similar_points: string[];
  query_terms?: string[];
  success: boolean;
  error?: string;
  analysis_status?: 'complete' | 'partial';
  cache_status?: 'hit' | 'miss';
  _cachedAt?: number;
}

export default ApiService;
