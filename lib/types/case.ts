export interface CaseDoc {
  id: string;
  title: string;
  full_text?: string;
  full_text_html?: string;
  content?: string; // Alias for full_text
  case_details?: any; // For backward compatibility
  judges?: string | string[];
  court?: string;
  date?: string;
  citation?: string;
  url?: string;
  summary?: string;
  relevanceScore?: number;
  // Allow any other string key with any value
  [key: string]: any;
}

export interface CaseDetailsResponse {
  case: CaseDoc;
  case_details?: CaseDoc; // For backward compatibility
  similar_points?: string[];
  similarity_score?: number;
  analysis_status?: 'complete' | 'partial' | 'error';
  cache_status?: 'hit' | 'miss';
  query_terms?: string[];
  success: boolean;
  error?: string;
  timestamp?: string;
  request_id?: string;
  _cachedAt?: number;
}
