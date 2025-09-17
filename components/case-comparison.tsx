"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, GitCompare, Calendar, MapPin, ExternalLink, Download, FileText } from "lucide-react"
import { ApiService } from "@/lib/api-service"
import type { CaseDoc } from "@/lib/types/case"

interface ExtendedCaseDoc extends CaseDoc {
  full_text?: string
  full_text_html?: string
  similarity_score?: number
  similar_points?: string[]
  analysis_status?: 'complete' | 'partial'
}

interface CaseComparisonProps {
  caseIds: string[]
  onClose: () => void
  userDescription?: string
}

export function CaseComparison({ caseIds, onClose, userDescription }: CaseComparisonProps) {
  const [cases, setCases] = useState<ExtendedCaseDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stripHtml = (html?: string) =>
    (html || "")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

  const computeSummary = (c: ExtendedCaseDoc): string | undefined => {
    const server = (c.summary || "").trim()
    if (server && !/internal error/i.test(server)) return server
    const source = (c.full_text && c.full_text.trim()) || (c.full_text_html && stripHtml(c.full_text_html)) || ""
    if (!source) return undefined
    const sentences = source.split(/(?<=[.!?])\s+/).slice(0, 6)
    let out = ""
    for (const s of sentences) {
      if ((out + " " + s).length > 650) break
      out += (out ? " " : "") + s
    }
    return out || source.slice(0, 650)
  }

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout
        
        const casePromises = caseIds.map(id => 
          ApiService.getCaseDetails(id, userDescription, controller.signal, 90000) // 90s per request
        )
        
        const results = await Promise.all(casePromises)
        clearTimeout(timeoutId)
        
        const casesData = results.map((result, index) => {
          if (!result || !result.case) {
            throw new Error(`Failed to load case ${caseIds[index]}`)
          }
          
          const merged: ExtendedCaseDoc = {
            ...result.case,
            similarity_score: result.similarity_score || 0,
            similar_points: result.similar_points || [],
            analysis_status: (result.analysis_status === 'complete' ? 'complete' : 'partial') as 'complete' | 'partial'
          }
          
          // Ensure we have a readable summary
          const sum = computeSummary(merged)
          if (sum) merged.summary = sum
          
          return merged
        })
        
        // Filter out any cases that failed to load
        const validCases = casesData.filter(c => c && c.id)
        if (validCases.length === 0) {
          throw new Error('No valid cases were loaded for comparison')
        }
        
        setCases(validCases)
      } catch (err: any) {
        console.error('Error in case comparison:', err)
        
        let errorMessage = 'Failed to load cases for comparison'
        if (err.name === 'AbortError' || err.message?.includes('timeout')) {
          errorMessage = 'The request took too long to complete. Some cases may still load, but the comparison is incomplete.'
        } else if (err.message?.includes('Failed to fetch') || err.message?.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else if (err.message) {
          errorMessage = err.message
        }
        
        setError(errorMessage)
        
        // If we have partial results, still show them
        if (cases.length > 0) {
          console.log('Showing partial results despite error', cases)
        }
      } finally {
        setLoading(false)
      }
    }

    if (caseIds.length > 0) {
      fetchCases()
    }
  }, [caseIds, userDescription])

  const getComparisonInsights = () => {
    if (cases.length < 2) return []
    
    const insights = []
    
    // Compare courts
    const courts = cases.map(c => c.court).filter(Boolean)
    const uniqueCourts = [...new Set(courts)]
    if (uniqueCourts.length > 1) {
      insights.push(`Cases span across ${uniqueCourts.length} different courts: ${uniqueCourts.join(', ')}`)
    } else if (uniqueCourts.length === 1) {
      insights.push(`All cases are from ${uniqueCourts[0]}`)
    }
    
    // Compare dates
    const dates = cases.map(c => c.date ? new Date(c.date) : null).filter(Boolean) as Date[]
    if (dates.length > 1) {
      const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime())
      const yearSpan = sortedDates[sortedDates.length - 1].getFullYear() - sortedDates[0].getFullYear()
      if (yearSpan > 0) {
        insights.push(`Cases span ${yearSpan} years (${sortedDates[0].getFullYear()} - ${sortedDates[sortedDates.length - 1].getFullYear()})`)
      }
    }
    
    // Compare similarity scores
    const scores = cases.map(c => c.similarity_score).filter(s => s !== undefined) as number[]
    if (scores.length > 1) {
      const maxScore = Math.max(...scores)
      const minScore = Math.min(...scores)
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
      insights.push(`Similarity scores range from ${minScore}% to ${maxScore}% (avg: ${Math.round(avgScore)}%)`)
    }
    
    return insights
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="glass-card border-white/10 p-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-white">Loading cases for comparison...</span>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="glass-card border-white/10 p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-400 mb-4">Error loading cases</div>
            <p className="text-gray-300 text-sm mb-4">{error}</p>
            <Button onClick={onClose} variant="outline" className="border-white/20 text-gray-300">
              Close
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const insights = getComparisonInsights()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sticky top-4 bg-black/70 backdrop-blur p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <GitCompare className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">Case Comparison ({cases.length} cases)</h1>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Comparison Insights */}
          {insights.length > 0 && (
            <Card className="glass-card border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Comparison Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.map((insight, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                      <div className="w-1 h-1 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Side-by-side comparison */}
          <div className={`grid ${cases.length === 2 ? 'grid-cols-2' : cases.length === 3 ? 'grid-cols-3' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'} gap-6`}>
            {cases.map((case_, index) => (
              <Card key={case_.id} className="glass-card border-white/10 h-fit">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-white text-lg leading-tight">
                      {case_.title}
                    </CardTitle>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 flex-shrink-0">
                      Case {index + 1}
                    </Badge>
                  </div>
                  {case_.citation && (
                    <p className="text-gray-400 text-sm">{case_.citation}</p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{case_.court || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>{case_.date ? new Date(case_.date).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>

                  {/* Similarity Score */}
                  {typeof case_.similarity_score === 'number' && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-300">Similarity</span>
                        <span className="text-white">{case_.similarity_score}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${case_.similarity_score}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {computeSummary(case_) && (
                    <div>
                      <h4 className="text-white text-sm font-medium mb-2">Summary</h4>
                      <p className="text-gray-300 text-xs leading-relaxed line-clamp-4">
                        {computeSummary(case_)}
                      </p>
                    </div>
                  )}

                  {/* Similar Points */}
                  {case_.similar_points && case_.similar_points.length > 0 && (
                    <div>
                      <h4 className="text-white text-sm font-medium mb-2">Key Similarities</h4>
                      <ul className="space-y-1">
                        {case_.similar_points.slice(0, 3).map((point, idx) => (
                          <li key={idx} className="text-gray-300 text-xs flex items-start gap-2">
                            <div className="w-1 h-1 bg-white rounded-full mt-1.5 flex-shrink-0"></div>
                            <span className="line-clamp-2">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator className="bg-white/10" />

                  {/* Actions */}
                  <div className="flex gap-2">
                    {case_.url && (
                      <Button asChild size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                        <a href={case_.url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          View
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
