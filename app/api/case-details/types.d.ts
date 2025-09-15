import type { NextRequest } from 'next/server';

declare module 'next/server' {
  interface NextRequest {
    formData: () => Promise<FormData>;
  }
}

export interface CaseDetailsRequest extends NextRequest {
  formData: () => Promise<FormData>;
}

export interface CaseDetailsResponse {
  case: {
    id: string;
    title: string;
    court: string | null;
    date: string | null;
    citation: string | null;
    url: string | null;
    full_text: string;
    full_text_html: string | null;
    summary: string | null;
    relevanceScore: number;
    judges: string[] | null;
  };
  similarity_score: number;
  similar_points: string[];
  query_terms: string[];
  analysis_status: 'complete' | 'partial' | 'pending' | 'error';
  cache_status: 'hit' | 'miss' | 'stale' | 'error';
  success: boolean;
  timestamp: string;
  error?: string;
  details?: string;
  requestId?: string;
}
