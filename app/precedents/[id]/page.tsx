"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { ApiService, type CaseDoc } from "@/lib/api-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ExternalLink, Scale, FileText, Gavel, RotateCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs"
import { Navigation } from "@/components/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

// Renders plain text case documents in a more structured, readable format
function StructuredPlainDocument({
  text,
  caseTitle,
  citation,
  className,
}: {
  text: string
  caseTitle?: string
  citation?: string
  className?: string
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

interface CaseDetailsResponse {
  case: CaseDoc & { full_text?: string; full_text_html?: string }
  similarity_score: number
  similar_points: string[]
  query_terms?: string[]
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
function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-200">Unable to load case details</h3>
          <p className="text-sm text-red-100 mt-1">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 bg-red-500/10 border-red-500/20 text-red-100 hover:bg-red-500/20 hover:text-white"
            onClick={onRetry}
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CaseDetailsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id
  const searchParams = useSearchParams()
  const description = searchParams.get("desc") || undefined

  const [data, setData] = useState<CaseDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [readerSize, setReaderSize] = useState<"sm" | "md" | "lg">("md")
  const [retryCount, setRetryCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const fetchCaseDetails = useCallback(async () => {
    if (!id) return
    
    const controller = new AbortController()
    let timeoutId: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout
    
    try {
      setLoading(true)
      setError(null)
      setProgress(0)
      
      // Start progress indicator
      progressInterval = setInterval(() => {
        setProgress(prev => {
          // Slow down progress as it approaches 90%
          if (prev < 90) {
            return prev + (100 - prev) * 0.1
          }
          return prev
        })
      }, 1000)
      
      // Set a timeout for the fetch operation
      timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort()
        }
      }, 180000) // 3 minute timeout for case details
      
      const res = await ApiService.getCaseDetails(
        id, 
        description,
        controller.signal,
        180000 // 3 minute timeout
      )
      
      // Complete the progress
      setProgress(100)
      
      if (res.success) {
        setData(res)
      } else {
        throw new Error(res.error || 'Failed to load case details')
      }
      
    } catch (e: any) {
      console.error('Error fetching case details:', e)
      
      // Handle specific error cases
      let errorMessage
      
      if (e.name === 'AbortError' || e.message?.includes('timeout')) {
        errorMessage = 'The case details are taking longer than expected to load. The system is still processing your request.'
      } else if (e.message?.includes('Failed to fetch') || e.message?.includes('network')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
      } else if (e.message?.includes('404')) {
        errorMessage = 'The requested case could not be found. It may have been removed or is not available.'
      } else if (e.message?.includes('50')) {
        errorMessage = 'The server is currently experiencing high traffic. Please try again in a few moments.'
      } else {
        errorMessage = e?.message || 'An unexpected error occurred while loading the case details.'
      }
      
      setError(errorMessage)
      
      // Auto-retry for certain errors
      if (!e.message?.includes('404') && retryCount < 2) {
        const retryDelay = Math.min(3000 * (retryCount + 1), 10000) // 3s, 6s, 10s max
        console.log(`Retrying in ${retryDelay}ms...`)
        setIsRetrying(true)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        setIsRetrying(false)
        setRetryCount(prev => prev + 1)
        return fetchCaseDetails()
      }
    } finally {
      clearTimeout(timeoutId!)
      clearInterval(progressInterval!)
      setLoading(false)
    }
  }, [id, description])
  
  // Initial fetch 
  const handleRetry = () => {
    setRetryCount(0)
    setError(null)
    fetchCaseDetails()
  } 
  // Cleanup function to abort any pending requests
    return () => {
      // The AbortController in fetchCaseDetails will handle the cleanup
    }
  }, [fetchCaseDetails])
  
  const title = useMemo(() => data?.case?.title || "Case Detail", [data])
 
  // Simple client-side summary fallback when backend summary is missing or errored
  const computedSummary = useMemo(() => {
    const serverSummary = data?.case?.summary?.trim()
    if (serverSummary && !/internal error/i.test(serverSummary)) return serverSummary

    // Prefer plain text; if only HTML available, strip tags
    const source = data?.case?.full_text?.trim() || data?.case?.full_text_html?.trim() || ""
    if (!source) return "Summary not available."

    const plain = source.replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    // Take first 5 sentences up to ~800 chars
    const sentences = plain.split(/(?<=[.!?])\s+/).slice(0, 8)
    let out = ""
    for (const s of sentences) {
      if ((out + " " + s).length > 800) break
      out += (out ? " " : "") + s
    }
    return out || plain.slice(0, 800)
  }, [data])
  
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Precedents", href: "/precedents", icon: <Gavel className="w-4 h-4" /> },
    { label: title.length > 50 ? title.substring(0, 50) + "..." : title, icon: <FileText className="w-4 h-4" /> }
  ]

  const content = (
    <div className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black ${user ? "pt-6" : "pt-20"} p-4 sm:p-6`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
          
          <div className="inline-flex items-center gap-2 text-gray-300 bg-white/5 px-3 py-1.5 rounded-md">
            <Scale className="w-4 h-4" />
            <span className="text-sm">Nyay Sarthi</span>
          </div>
        </div>

        <Card className="glass-card border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white text-2xl font-semibold">
              {loading ? <Skeleton className="h-8 w-3/4" /> : title}
            </CardTitle>
            {data?.case?.citation && (
              <p className="text-gray-400 text-sm mt-1">{data.case.citation}</p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Loading case details...</h3>
                  <span className="text-sm text-muted-foreground">
                    {isRetrying ? `Retrying (${retryCount + 1}/3)...` : 'This may take a moment'}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {progress < 30 && 'Fetching case information...'}
                  {progress >= 30 && progress < 70 && 'Analyzing case details...'}
                  {progress >= 70 && progress < 100 && 'Finalizing...'}
                  {progress === 100 && 'Almost there...'}
                </div>
                <LoadingSkeleton />
              </div>
            )}
            {error && (
              <div className="space-y-4">
                <ErrorMessage 
                  error={error} 
                  onRetry={handleRetry} 
                  retryDisabled={isRetrying || retryCount >= 2}
                />
                {retryCount >= 2 && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Still having trouble? The server might be experiencing high traffic. 
                      Try again in a few minutes or contact support if the problem persists.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {data && !loading && !error && (
              <div className="space-y-6">
                {/* Similarity and link */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium text-gray-300">Relevance Score</span>
                        <div className="w-40">
                          <div className="w-full relative">
                            <Progress 
                              value={data.similarity_score} 
                              className="h-2 bg-gray-700/50 overflow-hidden"
                            />
                            <div 
                              className="absolute top-0 left-0 h-full transition-all duration-300"
                              style={{
                                width: `${data.similarity_score}%`,
                                backgroundColor: data.similarity_score > 70 ? '#10B981' : 
                                              data.similarity_score > 40 ? '#F59E0B' : '#EF4444'
                              }}
                            />
                          </div>
                        </div>
                        <Badge 
                          className={`text-white border-0 ${
                            data.similarity_score > 70 ? 'bg-green-500/20' : 
                            data.similarity_score > 40 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                          }`}
                        >
                          {data.similarity_score}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        This score indicates how relevant this case is to your search query.
                      </p>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      {data.case.url && (
                        <Button 
                          asChild 
                          variant="outline" 
                          className="bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 flex-1 sm:flex-none"
                        >
                          <a href={data.case.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Original
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                        onClick={() => window.print()}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Query terms */}
                {data.query_terms && data.query_terms.length > 0 && (
                  <div className="p-6 border-b border-white/10">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Search Terms</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.query_terms.map((term, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 transition-colors"
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-3">
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

                {/* Similar points */}
                {data.similar_points && data.similar_points.length > 0 && (
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

                {/* Full document with reader options */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="text-white text-lg font-medium flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-300" />
                      Full Case Document
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 whitespace-nowrap">Text size:</span>
                      <div className="inline-flex bg-white/5 rounded-md p-0.5">
                        {(['sm', 'md', 'lg'] as const).map((size) => (
                          <button
                            key={size}
                            className={`px-3 py-1 rounded-md text-sm transition-colors ${
                              readerSize === size 
                                ? 'bg-white/10 text-white' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                            }`}
                            onClick={() => setReaderSize(size)}
                          >
                            {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {data.case.full_text_html ? (
                    <div
                      className={`glass-card border-white/10 rounded p-6 text-gray-200 prose prose-invert max-w-3xl mx-auto prose-p:text-justify prose-p:leading-8 prose-p:indent-6 prose-headings:text-white prose-a:text-blue-300 prose-a:underline prose-mark:bg-yellow-500/20 prose-mark:text-yellow-200 ${readerSize === "sm" ? "prose-sm" : readerSize === "lg" ? "prose-lg" : ""}`}
                      // Render trusted HTML from backend (already sanitized/upstreamed)
                      dangerouslySetInnerHTML={{ __html: data.case.full_text_html }}
                    />
                  ) : (
                    <StructuredPlainDocument
                      text={data.case.full_text || ""}
                      caseTitle={title}
                      citation={data.case.citation}
                      className={`glass-card border-white/10 rounded p-6 text-gray-200 leading-8 ${readerSize === "sm" ? "text-[0.95rem]" : readerSize === "lg" ? "text-[1.1rem]" : "text-[1rem]"}`}
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (isLoading) {
    return null
  }
  if (user) {
    return (
      <DashboardLayout currentPage="precedent">
        {content}
      </DashboardLayout>
    )
  }

  return (
    <>
      <Navigation />
      {content}
    </>
  )
}
