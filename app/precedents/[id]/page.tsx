"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { CaseService } from "@/lib/case-service"
import { CaseDoc } from "@/lib/types/case"
import { ArrowLeft, ChevronDown } from "lucide-react"
import FormattedCaseContent from "./formatted-content"

// Extended type to handle the response format
interface CaseResponse {
  case?: CaseDoc;
  case_details?: CaseDoc;
  similar_points?: string[];
  similarity_score?: number;
  analysis_status?: string;
  cache_status?: string;
  success: boolean;
  error?: string;
  [key: string]: any;
}

// Type-safe case data access helper
const getCaseField = (data: any, field: string): any => {
  if (!data) return '';
  if (data[field] !== undefined) return data[field];
  if (data.case?.[field] !== undefined) return data.case[field];
  if (data.case_details?.[field] !== undefined) return data.case_details[field];
  return '';
};

function formatDate(dateString?: string) {
  if (!dateString) return 'Date not available';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

function formatJudges(judges?: string | string[]) {
  if (!judges) return 'Not specified';
  if (Array.isArray(judges)) {
    return judges.join(', ');
  }
  return judges;
}

export default function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<CaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [analysis, setAnalysis] = useState<{
    success?: boolean;
    summary?: string;
    similarity_score?: number | null;
    similarity_percent?: number | null;
    key_points?: string[];
    used_llm?: boolean;
    cached?: boolean;
  } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const description = searchParams?.get('description') || undefined;

  useEffect(() => {
    if (!id) {
      setError('No case ID provided');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const resp = await CaseService.getCaseDetails(String(id), description, undefined, 30000, 0, 3, false);
        if (!resp || (resp as any).success === false) throw new Error((resp as any)?.error || 'Failed to fetch case details');
        setData(resp as any);
      } catch (e: any) {
        setError(e?.message || 'Failed to load case details');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, description]);

  // Memoize fields for analysis
  const caseId = useMemo(() => (data?.case?.id || (data as any)?.doc_id || String(id)), [data, id]);
  const caseTitle = useMemo(() => (data?.case?.title || (data as any)?.title || "Case Details"), [data]);
  const fullText = useMemo(() => (
    (data?.case?.full_text as any) || (data as any)?.full_text || ''
  ), [data]);

  // Fetch analysis lazily after content available; cache in sessionStorage to avoid rework
  useEffect(() => {
    if (!caseId || !fullText || fullText.length < 50) return; // need substantial text
    const cacheKey = `analysis:${caseId}:${(description||'').trim()}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setAnalysis(JSON.parse(cached));
        return;
      }
    } catch {}

    let aborted = false;
    const controller = new AbortController();
    (async () => {
      try {
        setAnalysisLoading(true);
        setAnalysisError(null);
        const form = new URLSearchParams();
        form.set('doc_id', String(caseId));
        form.set('title', caseTitle || String(caseId));
        form.set('full_text', fullText);
        if (description) form.set('description', description);
        const resp = await fetch('/api/cases/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
          body: form.toString(),
          signal: controller.signal,
        });
        if (!resp.ok) throw new Error(`Analysis failed: ${resp.status}`);
        const json = await resp.json();
        if (!aborted) {
          setAnalysis(json);
          try { sessionStorage.setItem(cacheKey, JSON.stringify(json)); } catch {}
        }
      } catch (e: any) {
        if (!aborted) setAnalysisError(e?.message || 'Failed to analyze case');
      } finally {
        if (!aborted) setAnalysisLoading(false);
      }
    })();
    return () => { aborted = true; controller.abort(); };
  }, [caseId, caseTitle, fullText, description]);

  // Derive displayed key points: min 3, max 4. If backend provides <3, top up from summary sentences
  const displayedKeyPoints = useMemo(() => {
    const raw = analysis?.key_points?.filter(Boolean) ?? [];
    let out = raw.slice(0, 4);
    if (out.length < 3) {
      const sentences = (analysis?.summary || '')
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(Boolean);
      for (const s of sentences) {
        if (out.length >= 3) break;
        if (!out.includes(s)) {
          const sFixed = /[.!?]$/.test(s) ? s : s + '.';
          out.push(sFixed);
        }
      }
    }
    return out.slice(0, 4);
  }, [analysis]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Loading case details...</h1>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">{error ? 'Error' : 'Case Not Found'}</h1>
        </div>
        {error && <div className="bg-red-900/20 border border-red-800 rounded p-4 text-red-200 text-sm">{error}</div>}
      </div>
    );
  }

  const responseData = data as CaseResponse;
  const caseData = responseData.case || responseData.case_details || (responseData as any);
  const plainText = (
    getCaseField(responseData, 'full_text') ||
    getCaseField(responseData, 'case.full_text') ||
    getCaseField(responseData, 'case_details.full_text') ||
    ''
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex items-start gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent leading-tight">
                {caseData?.title || 'Case Details'}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {caseData?.court && (
                  <Badge variant="outline" className="border-white/20 text-gray-300">{caseData.court}</Badge>
                )}
                {caseData?.date && (
                  <Badge variant="outline" className="border-white/20 text-gray-300">{formatDate(caseData.date)}</Badge>
                )}
                {caseData?.citation && (
                  <Badge variant="outline" className="border-white/20 text-gray-300">{caseData.citation}</Badge>
                )}
                {caseData?.url && (
                  <a className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4 ml-2" href={caseData.url} target="_blank" rel="noopener noreferrer">View Source</a>
                )}
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="mb-6">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold">AI Analysis</h2>
                  {analysis && (
                    <div className="text-xs text-gray-500">
                      {analysis.cached ? 'cached' : analysis.used_llm ? 'LLM-generated' : 'heuristic'}
                    </div>
                  )}
                </div>
                {analysisError && (
                  <div className="text-sm text-red-300 mb-3">{analysisError}</div>
                )}
                {!analysis && analysisLoading && (
                  <div className="text-sm text-gray-400">Analyzing…</div>
                )}
                {analysis && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Summary */}
                    <div className="md:col-span-3">
                      <h3 className="text-lg font-medium mb-2">Summary</h3>
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-[15px]">{analysis.summary}</p>
                    </div>
                    {/* Key points */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium mb-2">Top Key Points</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-300 text-[15px]">
                        {displayedKeyPoints.map((kp, idx) => (
                          <li key={idx}>{kp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {typeof analysis?.similarity_percent === 'number' && (
                  <div className="mt-5">
                    <div className="text-sm text-gray-400 mb-2">Similarity with your query</div>
                    <div className="h-2 w-full bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, analysis!.similarity_percent!))}%` }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{analysis!.similarity_percent}%</div>
                  </div>
                )}
                {!analysis && !analysisLoading && !analysisError && (
                  <div className="text-sm text-gray-400">Analysis will appear here once the document loads.</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full Judgment with expand/collapse */}
          <Card className="glass-card border-white/10">
            <CardContent className="p-0">
              <div className={`p-6 ${expanded ? '' : 'max-h-[560px] overflow-hidden relative'}`}>
                {(!expanded) && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/80 to-transparent"></div>
                )}
                {caseData?.full_text_html && String(caseData.full_text_html).trim().length > 0 ? (
                  <div className="case-html-content prose prose-invert max-w-none prose-headings:mt-6 prose-p:leading-7" dangerouslySetInnerHTML={{ __html: caseData.full_text_html as any }} />
                ) : (
                  <pre className="whitespace-pre-wrap leading-relaxed text-[15px]">{plainText}</pre>
                )}
              </div>
              <div className="px-6 pb-5 -mt-2">
                <Button variant="ghost" className="text-gray-300 hover:text-white" onClick={() => setExpanded(v => !v)}>
                  <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  {expanded ? 'Collapse full judgment' : 'Expand full judgment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
