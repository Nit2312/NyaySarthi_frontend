"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import ApiService from "@/lib/api-service"
import type { CaseDoc } from "@/lib/types/case"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ExternalLink, Scale, FileText, Gavel, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

// Extend CaseDoc type to include additional properties
interface ExtendedCaseDoc extends Omit<CaseDoc, 'title'> {
  full_text?: string;
  full_text_html?: string;
  judges?: string | string[];
  court?: string;
  date?: string;
  citation?: string;
  url?: string;
  summary?: string;
  title: string; // Make title required to match parent interface
}

interface CaseDetailsResponse {
  case: ExtendedCaseDoc;
  full_text?: string;
  full_text_html?: string;
  similarity_score: number;
  similar_points: string[];
  query_terms?: string[];
  analysis_status?: 'complete' | 'partial';
  cache_status?: 'hit' | 'miss';
  request_id?: string;
  timestamp?: string;
}

// Renders plain text case documents in a more structured, readable format
function StructuredPlainDocument({
  text,
  caseTitle,
  citation,
  className,
}: {
  text: string;
  caseTitle?: string;
  citation?: string;
  className?: string;
}) {
  // Drop obvious boilerplate lines that come from portals
  const cleaned = (text || "")
    // Remove common portal boilerplate/noise blocks
    .replace(/\bShare Link\b[\s\S]*?\bPremium features\b/i, " ")
    .replace(/\bMobile View\b/ig, " ")
    .replace(/\bFree features\b[\s\S]*?(?:Premium features|Case removal)/ig, " ")
    .replace(/\bPremium features\b[\s\S]*?(?:Case removal|Warning on translation)/ig, " ")
    .replace(/\bWarning on translation\b/ig, " ")
    .replace(/\bGet this document in PDF\b[\s\S]*?(?:Print it on a file\/printer|Download Court Copy)/ig, " ")
    .replace(/\bPrint it on a file\/printer\b/ig, " ")
    .replace(/\bDownload Court Copy\b/ig, " ")
    .replace(/\bTop AI Tags\b[\s\S]*?(?:User Queries|Madras High Court|Supreme Court|High Court)/ig, " ")
    .replace(/\bUser Queries\b[\s\S]*?(?:Madras High Court|Supreme Court|High Court)/ig, " ")
    .replace(/\bTry out our Premium Member Services[\s\S]*?one month\.?/ig, " ")
    .replace(/\bTake notes as you read a judgment[\s\S]*?trial for one month\.?/i, " ")
    .replace(/\bhttp:\/\/www\.judis\.nic\.in\b/ig, " ")
    .replace(/\s+\n/g, "\n")
    .trim()

  const lines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  // Heuristic extraction
  const headerLine = lines.find((l) => /^(IN THE|SUPREME COURT|HIGH COURT|DISTRICT COURT|BOMBAY HIGH COURT|KERALA HIGH COURT|GUJARAT HIGH COURT)/i.test(l))
  const benchLine = lines.find((l) => /bench\b|coram\b|before\b/i.test(l))
  const dateMatch = cleaned.match(/\b(\d{1,2}\s+\w+\s*,?\s*\d{4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b/)
  const caseNoMatch = cleaned.match(/\b(WP|W\.P\.|Writ Petition|S\.C\.|C\.A\.|Cr\.?\s?A\.|Civil|Criminal|S\.L\.P\.)[^\n]{0,50}\bNo\.?\s*[A-Za-z0-9()\-\/\. ]{1,30}/i)

  let parties: { petitioner?: string; respondent?: string } = {}
  const title = caseTitle || lines[0] || "Case Document"
  const vsSplit = title.split(/\s+v(?:s\.?|ersus)\.?\s+/i)
  if (vsSplit.length === 2) {
    parties = { petitioner: vsSplit[0], respondent: vsSplit[1] }
  }

  // Build paragraphs and promote likely section headings
  let paragraphs = cleaned.split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean)
  // If we ended up with one giant block, fall back to sentence-group paragraphs
  if (paragraphs.length <= 2) {
    const sentences = cleaned
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
    const grouped: string[] = []
    let buf: string[] = []
    let charCount = 0
    for (const s of sentences) {
      buf.push(s)
      charCount += s.length + 1
      if (buf.length >= 3 || charCount > 500) {
        grouped.push(buf.join(" "))
        buf = []
        charCount = 0
      }
    }
    if (buf.length) grouped.push(buf.join(" "))
    if (grouped.length) paragraphs = grouped
  }
  const isHeading = (s: string) => {
    if (s.length > 120) return false
    if (/^(JUDGMENT|ORDER|FACTS|BACKGROUND|ISSUES?|HELD|RATIO|ANALYSIS|ARGUMENTS|CONCLUSION|PRAYER)\b/i.test(s)) return true
    // All caps lines without too much punctuation
    const noPunct = s.replace(/[^A-Z \-]/g, "")
    if (noPunct.length >= s.length * 0.8 && s.length < 80) return true
    return false
  }

  return (
    <div className={className}>
      {/* Header/meta */}
      <div className="mb-4">
        <h4 className="text-white text-xl font-semibold mb-1">{title}</h4>
        <div className="text-white/70 text-sm space-x-2">
          {citation && <span>Citation: {citation}</span>}
          {headerLine && <span>• {headerLine}</span>}
          {benchLine && <span>• {benchLine}</span>}
          {dateMatch && <span>• Date: {dateMatch[0]}</span>}
          {caseNoMatch && <span>• {caseNoMatch[0]}</span>}
        </div>
        {(parties.petitioner || parties.respondent) && (
          <div className="mt-2 text-white/80 text-sm">
            {parties.petitioner && <span className="mr-2">Petitioner: {parties.petitioner}</span>}
            {parties.respondent && <span>Respondent: {parties.respondent}</span>}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="prose prose-invert max-w-3xl mx-auto prose-p:text-justify prose-p:leading-8 prose-p:indent-6 prose-headings:text-white prose-a:text-blue-300 prose-a:underline prose-mark:bg-yellow-500/20 prose-mark:text-yellow-200" style={{ hyphens: 'auto' }}>
        {paragraphs.map((para, idx) =>
          isHeading(para) ? (
            <h5 key={idx} className="text-white font-semibold mt-6 mb-2 tracking-wide">
              {para}
            </h5>
          ) : (
            <p key={idx} className="mb-5 whitespace-pre-wrap break-words">
              {para}
            </p>
          ),
        )}
        {paragraphs.length === 0 && (
          <p className="text-gray-400">Content not available.</p>
        )}
      </div>
    </div>
  )
}

// Skeleton component for loading state
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

// Error component for displaying error states
function ErrorMessage({ 
  error, 
  onRetry, 
  retryDisabled = false 
}: { 
  error: string; 
  onRetry: () => void; 
  retryDisabled?: boolean;
}) {
  return (
    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <p className="text-red-300 font-medium">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            disabled={retryDisabled}
            className={`mt-2 border-red-400/30 text-red-300 hover:bg-red-500/10 hover:text-red-200 ${
              retryDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {retryDisabled ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [data, setData] = useState<CaseDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [readerSize, setReaderSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [progress, setProgress] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  
  // Memoized values
  const description = searchParams?.get('description') || undefined;
  const title = useMemo(() => data?.case?.title || "Case Detail", [data]);
  
  // Fetch case details with progress tracking and retry logic
  const fetchCaseDetails = useCallback(async (isRetry = false) => {
    if (!id) {
      console.error('No case ID provided');
      setError('No case ID provided');
      setLoading(false);
      return;
    }
    
    // Don't reset loading state on retry to prevent UI flicker
    if (!isRetry) {
      setLoading(true);
      setProgress(0);
    }
    
    setError(null);
    
    const controller = new AbortController();
    
    // Smooth progress animation up to 90% with variable speed
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Slow down as we approach 90%
        const remaining = 90 - prev;
        const baseIncrement = remaining > 50 ? 5 : 2;
        const increment = Math.min(
          baseIncrement + Math.random() * 5, // 5-10% at start, 2-7% near end
          remaining
        );
        return prev + increment;
      });
    }, 800); // Slightly slower interval for smoother progress
    
    try {
      // Use a slightly shorter timeout than the backend (45s vs 60s)
      const resp = await ApiService.getCaseDetails(
        String(id), 
        description || undefined, 
        controller.signal,
        60000 // 60s timeout
      );
      
      // Quickly complete the progress bar when done
      setProgress(100);
      
      // Small delay for smooth UI transition
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setData({
        case: {
          ...(resp.case as any),
          title: (resp.case.title || 'Case Document') as string,
        },
        full_text: (resp as any).full_text,
        full_text_html: (resp as any).full_text_html,
        similarity_score: resp.similarity_score || 0,
        similar_points: Array.isArray(resp.similar_points) ? resp.similar_points : [],
        query_terms: resp.query_terms,
        analysis_status: resp.analysis_status as any,
        cache_status: resp.cache_status as any,
      });
      
      setError(null);
      
    } catch (err: any) {
      console.error('Error fetching case details:', err);
      
      // Only update error state if this isn't a retry that was aborted by a new request
      if (!controller.signal.aborted) {
        // Check if this is a timeout error
        if (err?.name === 'AbortError' || err?.message?.includes('timeout') || err?.message?.includes('timed out')) {
          setError('The request took too long to complete. Please try again.');
        } else {
          setError(err?.message || 'Failed to fetch case details. Please try again.');
        }
        
        setData(null);
      }
      
      // Rethrow to be caught by the retry mechanism if needed
      throw err;
      
    } finally {
      clearInterval(progressInterval);
      
      if (!isRetry) {
        setLoading(false);
      }
      
      setIsRetrying(false);
    }
  }, [id, description]);
  
  // Handle retry logic with exponential backoff
  const handleRetry = useCallback(async () => {
    if (isRetrying) return;
    
    const newRetryCount = retryCount + 1;
    const maxRetries = 3;
    
    if (newRetryCount > maxRetries) {
      setError('Maximum retry attempts reached. Please try again later.');
      return;
    }
    
    setRetryCount(newRetryCount);
    setError(null);
    setIsRetrying(true);
    
    // Calculate backoff time (1s, 2s, 4s, etc. with max of 8s)
    const backoffTime = Math.min(1000 * Math.pow(2, newRetryCount - 1), 8000);
    
    try {
      // Show a brief loading state before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retry with the same parameters
      await fetchCaseDetails(true);
    } catch (err) {
      // Error is already handled in fetchCaseDetails
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, retryCount, fetchCaseDetails]);
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchCaseDetails();
    return () => {};
  }, [fetchCaseDetails]);

  
 
  
  
 
  // Generate summary from case data
  const computedSummary = useMemo((): string | null => {
    if (!data) return 'Loading case details...';
    
    // First check if we have a summary from the server
    if (data.case?.summary?.trim()) {
      return data.case.summary.trim();
    }
    
    // Check for similar points that could be used as a summary
    const similarPoints = data.similar_points || [];
    if (similarPoints.length > 0) {
      return similarPoints
        .filter((point: unknown): point is string => 
          typeof point === 'string' && point.trim().length > 0
        )
        .map((point: string, i: number) => `${i + 1}. ${point}`)
        .join('\n\n');
    }
    
    // Fallback to extracting from full text if available
    const fullText = data.case?.full_text;
    if (fullText) {
      // Clean and split into paragraphs
      const paragraphs = fullText
        .split(/\n\s*\n+/)
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 30); // Keep slightly shorter paragraphs for summary
      
      if (paragraphs.length > 0) {
        // Take first 2-3 paragraphs that look like content (not headers, etc.)
        const contentParagraphs = paragraphs
          .filter((p: string) => !/^(?:[A-Z\s]+|\d+\s*$|\([^)]*\)|\[[^\]]*\]|\{[^}]*\})$/.test(p)) // Skip headers, numbers, brackets, etc.
          .slice(0, 3);
        
        if (contentParagraphs.length > 0) {
          return contentParagraphs.join('\n\n');
        }
        
        // If we still don't have content, return the first paragraph
        return paragraphs[0];
      }
    }
    
    return 'No summary available. Please see the full document for details.';
  }, [data]);
  
  // (Removed old MainContent component; using single main render below)

  // Main render
  return (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black ${user ? "pt-6" : "pt-20"} p-4 sm:p-6`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {loading ? (
          <div className="space-y-4 p-6 bg-gray-900/50 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></div>
                <h3 className="text-lg font-medium text-gray-200">
                  {progress < 50 
                    ? "Fetching case details..." 
                    : progress < 90 
                      ? "Analyzing legal content..." 
                      : "Finalizing..."}
                </h3>
              </div>
              <div className="text-sm font-mono text-blue-400">{Math.min(progress, 99)}%</div>
            </div>
            
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Document ID: {id}</span>
              {progress > 10 && (
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                  {progress < 50 ? "Connected" : "Processing"}
                </span>
              )}
            </div>
            
            {progress > 70 && progress < 95 && (
              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-800/50 rounded text-sm text-blue-200">
                <div className="flex items-start">
                  <svg className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>This may take a moment as we analyze the legal document and extract key information.</span>
                </div>
              </div>
            )}
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorMessage 
              error={error} 
              onRetry={handleRetry} 
              retryDisabled={isRetrying}
            />
          </div>
        ) : data && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="flex items-center gap-1 text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to results</span>
              </Button>
              
              {data.case.citation && (
                <div className="text-sm text-gray-400">
                  {data.case.citation}
                </div>
              )}
            </div>
            
            <Card className="glass-card border-white/10 overflow-hidden">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white text-2xl font-semibold">
                  {title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Similarity and link */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">Relevance Score</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-32">
                          <div className="relative">
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${data.similarity_score > 70 ? 'bg-green-500' : data.similarity_score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, data.similarity_score))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-300">
                          {data.similarity_score.toFixed(1)}%
                        </span>
                        {data.analysis_status === 'partial' && (
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-500/10">
                            Analyzing...
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 flex-1 sm:flex-none"
                        onClick={() => {
                          if (data.case?.url) {
                            window.open(data.case.url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Original
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20 hover:text-green-200 flex-1 sm:flex-none"
                        asChild 
                      >
                        <Link href={`/precedents/compare?case1=${id}`}>
                          <Scale className="w-4 h-4 mr-2" />
                          Compare Cases
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Case details */}
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-white text-lg font-medium mb-4 flex items-center gap-2">
                    <span className="bg-purple-500/20 text-purple-300 p-1.5 rounded-md">
                      <FileText className="w-4 h-4" />
                    </span>
                    Case Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Court</p>
                      <p className="text-white">{data.case.court || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Citation</p>
                      <p className="text-white">{data.case.citation || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="text-white">
                        {data.case.date ? new Date(data.case.date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Judges</p>
                      <p className="text-white">
                        {Array.isArray(data.case.judges) 
                          ? data.case.judges.join(', ')
                          : data.case.judges || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                {computedSummary && (
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-lg font-medium flex items-center gap-2">
                        <span className="bg-blue-500/20 text-blue-300 p-1.5 rounded-md">
                          <Gavel className="w-4 h-4" />
                        </span>
                        AI-Generated Summary
                      </h3>
                      <Badge variant="secondary" className="bg-white/5 text-gray-300">
                        Beta
                      </Badge>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {computedSummary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Similar points */}
                {data.similar_points?.length > 0 && (
                  <div className="p-6 border-b border-white/10">
                    <h3 className="text-white text-lg font-medium mb-3 flex items-center gap-2">
                      <span className="bg-green-500/20 text-green-300 p-1.5 rounded-md">
                        <Scale className="w-4 h-4" />
                      </span>
                      Key Similar Points
                    </h3>
                    <ul className="space-y-3">
                      {data.similar_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {point}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Full document */}
                {(data.case.full_text || data.case.full_text_html) && (
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h3 className="text-white text-lg font-medium flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-300" />
                        Full Case Document
                      </h3>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Text size:</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`px-2 h-7 text-xs ${readerSize === 'sm' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                          onClick={() => setReaderSize('sm')}
                        >
                          Small
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`px-2 h-7 text-xs ${readerSize === 'md' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                          onClick={() => setReaderSize('md')}
                        >
                          Medium
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`px-2 h-7 text-xs ${readerSize === 'lg' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                          onClick={() => setReaderSize('lg')}
                        >
                          Large
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4 border border-white/5 overflow-auto max-h-[70vh]">
                      {data.case.full_text_html ? (
                        <div 
                          className="prose prose-invert max-w-none" 
                          dangerouslySetInnerHTML={{ __html: data.case.full_text_html as string }} 
                        />
                      ) : (
                        <StructuredPlainDocument
                          key="plain-text-content"
                          text={data.case.full_text || ''}
                          caseTitle={title}
                          citation={data.case.citation}
                          className={`text-gray-200 leading-8 ${
                            readerSize === "sm" ? "text-[0.95rem]" : 
                            readerSize === "lg" ? "text-[1.1rem]" : "text-[1rem]"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
        
        {!data && !loading && !error && (
          <div className="p-6">
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-100">No case data available</h3>
              <p className="mt-1 text-sm text-gray-400">We couldn't find the case you're looking for.</p>
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/precedents')}
                  className="inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to precedents
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-6">
            <ErrorMessage 
              error={error} 
              onRetry={handleRetry} 
              retryDisabled={isRetrying}
            />
          </div>
        )}
      </div>
    </div>
  );
}
