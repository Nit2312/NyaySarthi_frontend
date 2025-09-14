import { API_CONFIG } from './config';
import type { CaseDoc, CaseDetailsResponse } from './types/case';

// In-memory cache for case details
interface CacheEntry<T> {
  data: T | null;
  timestamp: number;
  promise?: Promise<T>;
}

const caseDetailsCache = new Map<string, CacheEntry<CaseDetailsResponse>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

// Helper function to check if cache entry is still valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL;
};

export class CaseService {
  private static readonly API_BASE = API_CONFIG.BASE_URL;

  /**
   * Prefetch case details when hovering over search results
   */
  static async prefetchCaseDetails(docId: string, description?: string): Promise<void> {
    const cacheKey = this.getCacheKey(docId, description);
    if (!docId || (caseDetailsCache.has(cacheKey) && isCacheValid(caseDetailsCache.get(cacheKey)!.timestamp))) {
      return;
    }
    
    try {
      // We don't need the result, just want to populate the cache
      await this.getCaseDetails(docId, description, undefined, 5000, 0, 1, true);
    } catch (error) {
      console.warn(`Failed to prefetch case ${docId}:`, error);
      // Don't re-throw since this is a prefetch and we don't want to break the UI
    }
  }

  /**
   * Get case details with caching and retry logic
   */
  static async getCaseDetails(
    docId: string, 
    description?: string,
    signal?: AbortSignal,
    timeoutMs: number = 30000,
    retryCount: number = 0,
    maxRetries: number = 3, // Increased default retries
    useCache: boolean = true
  ): Promise<CaseDetailsResponse> {
    if (!docId) {
      throw new Error('Document ID is required');
    }
    
    const cacheKey = this.getCacheKey(docId, description);
    
    // Return cached data if available and valid
    if (useCache && caseDetailsCache.has(cacheKey)) {
      const cached = caseDetailsCache.get(cacheKey)!;
      if (isCacheValid(cached.timestamp) && cached.data !== null) {
        console.log(`[Cache] Returning cached case details for ${docId}`);
        return cached.data; 
      } else if (cached.data === null) {
        throw new Error('Cached data is null');
      }
      // If we have a cached promise, return it
      if (cached.promise) {
        console.log(`[Cache] Returning pending request for ${docId}`);
        return cached.promise;
      }
    }
    
    // Create the request promise
    const requestPromise = (async (): Promise<CaseDetailsResponse> => {
      const url = new URL(`${this.API_BASE}/case-details`);
      const formData = new URLSearchParams();
      formData.append('doc_id', docId.trim());
      
      // Only include description if it's not empty
      const trimmedDesc = description?.trim();
      if (trimmedDesc) {
        formData.append('description', trimmedDesc);
      }
      
      // Add minimal flag to reduce response size
      formData.append('minimal', 'true');
      
      const endpoint = '/case-details';
      const requestId = Math.random().toString(36).substring(2, 9);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(`[${requestId}] Request timeout reached (${timeoutMs}ms), aborting...`);
        controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      try {
        const startTime = performance.now();
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: formData.toString(),
          signal: signal
        });
        
        const responseTime = Math.round(performance.now() - startTime);
        console.log(`[CaseService] Response received in ${responseTime}ms`, {
          status: response.status,
          'content-length': response.headers.get('content-length')
        });
        
        if (!response.ok) {
          let errorData: { message: string; detail?: string; code?: string } = { message: 'Unknown error occurred' };
          
          try {
            const errorText = await response.text();
            errorData = errorText ? JSON.parse(errorText) : { message: `HTTP ${response.status}` };
          } catch (e) {
            console.warn(`[${requestId}] Failed to parse error response:`, e);
          }
          
          const error = new Error(errorData.detail || errorData.message || `HTTP ${response.status}: Failed to fetch case details`);
          (error as any).status = response.status;
          
          // If it's a server error and we have retries left, retry with exponential backoff
          if (response.status >= 500 && retryCount < maxRetries) {
            const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 3000); // Max 3s backoff
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
        
        const data = await response.json();
        
        if (!data.success) {
          // Enhanced error logging for debugging
          console.error(`[${requestId}] Failed to process case details. Data:`, data);
          const error = new Error(data.error || 'Failed to process case details');
          (error as any).status = 500;
          throw error;
        }
        
        // Add analysis status if not present
        if (!data.analysis_status) {
          data.analysis_status = data.similar_points?.length ? 'complete' : 'partial';
        }

        // Add cache timestamp
        data._cachedAt = Date.now();

        // Defensive: validate required fields before returning
        if (!data.case_details) {
          console.error(`[${requestId}] Missing 'case_details' in response data:`, data);
          throw new Error('Invalid response: Missing case details');
        }

        return data as CaseDetailsResponse;
        
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // Log the error for debugging
        console.error(`[${requestId}] Error in getCaseDetails:`, error);
        
        // Handle retry logic for abort errors
        if (error?.name === 'AbortError') {
          if (retryCount < maxRetries) {
            const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 3000); // Max 3s backoff
            console.log(`[${requestId}] Request aborted, retrying after ${backoffTime}ms...`);
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
        if (error?.status) {
          if (error.status === 404) {
            throw new Error('Case not found. The document ID may be invalid.');
          }
          if (error.status === 504) {
            throw new Error('The server took too long to respond. Please try again.');
          }
        }
        
        // Re-throw other errors
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    })();
    
    // Cache the promise and set up the cache entry
    if (useCache) {
      const cacheEntry: CacheEntry<CaseDetailsResponse> = {
        data: null,
        timestamp: Date.now(),
        promise: requestPromise
      };
      
      caseDetailsCache.set(cacheKey, cacheEntry);
      
      // Update the cache when the promise resolves
      requestPromise.then(data => {
        const cached = caseDetailsCache.get(cacheKey);
        if (cached) {
          cached.data = data;
          cached.timestamp = Date.now();
        }
      }).catch(() => {
        // On error, remove the cache entry to allow retries
        caseDetailsCache.delete(cacheKey);
      });
      
      // Set a TTL for the cache entry
      setTimeout(() => {
        const cached = caseDetailsCache.get(cacheKey);
        // Only delete if the entry hasn't been updated
        if (cached && Date.now() - cached.timestamp >= CACHE_TTL) {
          caseDetailsCache.delete(cacheKey);
        }
      }, CACHE_TTL);
    }
    
    return requestPromise;
  }
  
  /**
   * Generate a cache key for case details
   */
  private static getCacheKey(docId: string, description?: string): string {
    return `${docId}:${description || ''}`;
  }
}

export default CaseService;
