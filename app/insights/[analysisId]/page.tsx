import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, AlertTriangle, CheckCircle, AlertCircle, ArrowLeft, Info } from "lucide-react"

interface AnalysisResponse {
  success: true
  analysis_id: string
  filename: string
  content_type?: string
  extracted_chars?: number
  advice: {
    summary?: string
    issues?: string[]
    improvements?: string[]
    missing?: string[]
    disclaimer?: string
  }
}

type AnalysisError = { success: false; status?: number; error?: string }

async function fetchAnalysis(analysisId: string): Promise<AnalysisResponse | AnalysisError> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000")

  const res = await fetch(`${baseUrl}/api/analyze-document/${encodeURIComponent(analysisId)}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    return { success: false, status: res.status, error: await res.text().catch(() => undefined) }
  }
  const json = await res.json()
  return json as AnalysisResponse
}

export default async function InsightsPage({ params }: { params: { analysisId: string } }) {
  const { analysisId } = params
  const data = await fetchAnalysis(analysisId)
  if (!data.success) {
    const status = data.status
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto py-16 px-6 space-y-6 text-center">
          <h1 className="text-4xl font-bold">Analysis {status === 404 ? 'Not Found' : 'Unavailable'}</h1>
          <p className="text-slate-400 text-lg">This analysis may have expired or the ID is invalid. Please upload your document again to generate a fresh analysis.</p>
          <div className="flex items-center justify-center">
            <Button asChild className="bg-white/10 hover:bg-white/20 text-white">
              <Link href="/dashboard/upload">Back to Upload</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }
  const advice = data.advice || {}

  const toArray = (val: unknown): string[] => {
    if (Array.isArray(val)) return val.filter((x) => typeof x === 'string') as string[]
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val)
        if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string') as string[]
      } catch {}
      const split = val
        .replace(/^```[\s\S]*?\n|```$/g, '')
        .split(/\r?\n|;|,|\u2022|\-|\*/)
        .map((s) => s.trim())
        .filter(Boolean)
      return split
    }
    return []
  }

  const issues = toArray(advice.issues)
  const improvements = toArray(advice.improvements)
  const missing = toArray(advice.missing)
  const disclaimer = advice.disclaimer || "These insights are suggestions for educational purposes and are not legal advice. Do not rely on them."

  const summaryRaw = advice.summary
  let summaryText = ""
  if (typeof summaryRaw === "string") {
    try {
      const parsed = JSON.parse(summaryRaw)
      if (parsed && typeof parsed.summary === "string") {
        summaryText = parsed.summary
      } else {
        summaryText = summaryRaw
      }
    } catch {
      summaryText = summaryRaw
    }
  }

  const sanitize = (s: string) => {
    let t = s.trim()
    if (t.startsWith("```")) {
      t = t.replace(/^```[a-zA-Z]*\n?/, "").replace(/```\s*$/, "").trim()
    }
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
      t = t.slice(1, -1)
    }
    t = t.replace(/^\s*summary\s*:\s*/i, "").trim()
    return t
  }
  summaryText = sanitize(summaryText)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto py-6 px-5">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/dashboard/upload" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />Back to Upload
              </Link>
            </Button>
          </div>
          
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-white">Document Analysis Report</h1>
            
            <div className="bg-[#0f1115] rounded-lg p-4 shadow-sm border border-white/10">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  <span className="font-medium text-slate-200 truncate max-w-[220px]">{data.filename}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="uppercase font-medium border-white/20 text-slate-200 px-2 py-0.5">
                    {data.content_type?.split('/')[1] || 'Document'}
                  </Badge>
                  {typeof data.extracted_chars === 'number' && (
                    <Badge variant="secondary" className="bg-white/10 text-slate-200 px-2 py-0.5">{data.extracted_chars.toLocaleString()} chars</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Summary Section */}
          <Card className="shadow-md border border-white/10 bg-[#0f1115]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-900/30 rounded-md">
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-white">Document Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-base leading-relaxed text-slate-200">
                  {summaryText || "No summary available."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Issues Section */}
          <Card className="shadow-md border border-white/10 bg-[#0f1115]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-900/30 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-white">Legal Issues & Risks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {issues.length > 0 ? (
                <div className="space-y-2.5">
                  {issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-red-900/10 rounded-md border-l-2 border-red-500/70">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-200 leading-relaxed text-[15px]">{issue}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-base text-slate-400">No legal issues identified</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Improvements Section */}
          <Card className="shadow-md border border-white/10 bg-[#0f1115]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-900/30 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-white">Suggested Improvements</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {improvements.length > 0 ? (
                <div className="space-y-2.5">
                  {improvements.map((improvement, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-green-900/10 rounded-md border-l-2 border-green-500/70">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-200 leading-relaxed text-[15px]">{improvement}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Info className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-base text-slate-400">No improvements suggested</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Missing Clauses Section */}
          <Card className="shadow-md border border-white/10 bg-[#0f1115]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-900/30 rounded-md">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                </div>
                <CardTitle className="text-lg font-semibold text-white">Missing Clauses & Data Points</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {missing.length > 0 ? (
                <div className="space-y-2.5">
                  {missing.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-amber-900/10 rounded-md border-l-2 border-amber-500/70">
                      <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-200 leading-relaxed text-[15px]">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-base text-slate-400">All essential clauses appear to be present</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert className="bg-[#0f1115] border border-white/10 shadow-md">
            <Info className="h-4 w-4 text-amber-400" />
            <AlertTitle className="text-base font-semibold text-white">Important Disclaimer</AlertTitle>
            <AlertDescription className="text-slate-300 text-sm leading-relaxed mt-1.5">
              {disclaimer}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
