export interface CaseDoc {
  id: string;
  title: string;
  court?: string;
  date?: string;
  citation?: string;
  url?: string;
  summary?: string;
  full_text?: string;
  full_text_html?: string;
  judges?: string | string[];
  relevanceScore?: number;
}

export interface CaseDetailsResponse {
  case: CaseDoc;
  similarity_score: number;
  similar_points: string[];
  query_terms?: string[];
  success: boolean;
  error?: string;
  analysis_status?: 'complete' | 'partial';
  cache_status?: 'hit' | 'miss';
  _cachedAt?: number;
}
