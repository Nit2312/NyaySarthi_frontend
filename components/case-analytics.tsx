"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, PieChart, TrendingUp, Calendar, MapPin, Gavel, Users, FileText, Download } from "lucide-react"
import { ApiService } from "@/lib/api-service"
import type { CaseDoc } from "@/lib/types/case"

interface CaseAnalyticsProps {
  cases: CaseDoc[]
  searchQuery?: string
  className?: string
}

interface CourtDistribution {
  court: string
  count: number
  percentage: number
}

interface YearlyTrend {
  year: number
  count: number
}

interface CategoryDistribution {
  category: string
  count: number
  percentage: number
  color: string
}

export function CaseAnalytics({ cases, searchQuery, className = "" }: CaseAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate court distribution
  const courtDistribution: CourtDistribution[] = useMemo(() => {
    const courtCounts = cases.reduce((acc, case_) => {
      const court = case_.court || "Unknown Court"
      acc[court] = (acc[court] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = cases.length
    return Object.entries(courtCounts)
      .map(([court, count]) => ({
        court,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
  }, [cases])

  // Calculate yearly trends
  const yearlyTrends: YearlyTrend[] = useMemo(() => {
    const yearCounts = cases.reduce((acc, case_) => {
      if (case_.date) {
        const year = new Date(case_.date).getFullYear()
        if (year > 1900) { // Filter out invalid dates
          acc[year] = (acc[year] || 0) + 1
        }
      }
      return acc
    }, {} as Record<number, number>)

    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year)
  }, [cases])

  // Calculate category distribution
  const categoryDistribution: CategoryDistribution[] = useMemo(() => {
    const categoryCounts = cases.reduce((acc, case_) => {
      const category = (case_ as any).category || "General"
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const colors = [
      "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", 
      "bg-pink-500", "bg-indigo-500", "bg-red-500", "bg-orange-500"
    ]

    const total = cases.length
    return Object.entries(categoryCounts)
      .map(([category, count], index) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count)
  }, [cases])

  // Calculate key statistics
  const stats = useMemo(() => {
    const totalCases = cases.length
    const uniqueCourts = new Set(cases.map(c => c.court).filter(Boolean)).size
    const dateRange = cases
      .map(c => c.date ? new Date(c.date) : null)
      .filter(Boolean) as Date[]
    
    let timeSpan = 0
    if (dateRange.length > 1) {
      const sorted = dateRange.sort((a, b) => a.getTime() - b.getTime())
      timeSpan = sorted[sorted.length - 1].getFullYear() - sorted[0].getFullYear()
    }

    const avgSimilarity = cases
      .map(c => (c as any).relevanceScore)
      .filter(score => typeof score === 'number')
      .reduce((sum, score, _, arr) => arr.length ? sum + score / arr.length : 0, 0)

    return {
      totalCases,
      uniqueCourts,
      timeSpan,
      avgSimilarity: Math.round(avgSimilarity)
    }
  }, [cases])

  if (cases.length === 0) {
    return (
      <Card className={`glass-card border-white/10 ${className}`}>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No data available for analysis</p>
          <p className="text-gray-500 text-sm mt-1">Search for cases to see analytics</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 text-gray-300">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="courts" className="data-[state=active]:bg-white/10 text-gray-300">
              <Gavel className="w-4 h-4 mr-2" />
              Courts
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-white/10 text-gray-300">
              <TrendingUp className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-white/10 text-gray-300">
              <PieChart className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
          </TabsList>
          
          <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-white/10">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.totalCases}</div>
                <div className="text-xs text-gray-400">Total Cases</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/10">
              <CardContent className="p-4 text-center">
                <Gavel className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.uniqueCourts}</div>
                <div className="text-xs text-gray-400">Courts</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/10">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.timeSpan}</div>
                <div className="text-xs text-gray-400">Year Span</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/10">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.avgSimilarity}%</div>
                <div className="text-xs text-gray-400">Avg Similarity</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">
                  Most cases are from <strong className="text-white">{courtDistribution[0]?.court}</strong> ({courtDistribution[0]?.percentage}%)
                </span>
              </div>
              {yearlyTrends.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">
                    Cases span from <strong className="text-white">{yearlyTrends[0]?.year}</strong> to <strong className="text-white">{yearlyTrends[yearlyTrends.length - 1]?.year}</strong>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">
                  Top category: <strong className="text-white">{categoryDistribution[0]?.category}</strong> ({categoryDistribution[0]?.count} cases)
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courts" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                Court Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courtDistribution.map((court, index) => (
                <div key={court.court} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 font-medium">{court.court}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">{court.count}</span>
                      <Badge className="bg-white/10 text-gray-300 border-white/20">
                        {court.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                        index === 2 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        'bg-gradient-to-r from-gray-500 to-gray-600'
                      }`}
                      style={{ width: `${court.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {yearlyTrends.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-end justify-between h-64 gap-2">
                    {yearlyTrends.map((trend, index) => {
                      const maxCount = Math.max(...yearlyTrends.map(t => t.count))
                      const height = (trend.count / maxCount) * 200
                      return (
                        <div key={trend.year} className="flex flex-col items-center gap-2 flex-1">
                          <div className="text-xs text-gray-400">{trend.count}</div>
                          <div 
                            className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 w-full"
                            style={{ height: `${height}px` }}
                          ></div>
                          <div className="text-xs text-gray-300 transform -rotate-45 origin-bottom-left">
                            {trend.year}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white text-sm font-medium mb-2">Timeline Insights</h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• Peak year: {yearlyTrends.reduce((max, trend) => trend.count > max.count ? trend : max).year}</li>
                      <li>• Total years covered: {yearlyTrends.length}</li>
                      <li>• Average cases per year: {Math.round(yearlyTrends.reduce((sum, t) => sum + t.count, 0) / yearlyTrends.length)}</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No date information available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Category List */}
                <div className="space-y-3">
                  {categoryDistribution.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                        <span className="text-gray-300 font-medium">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{category.count}</span>
                        <Badge className="bg-white/10 text-gray-300 border-white/20">
                          {category.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visual Representation */}
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full border-8 border-white/10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{categoryDistribution.length}</div>
                        <div className="text-xs text-gray-400">Categories</div>
                      </div>
                    </div>
                    {/* Simple arc indicators */}
                    {categoryDistribution.slice(0, 4).map((cat, index) => {
                      const angle = (index * 90) - 45
                      const radius = 110
                      const x = Math.cos((angle * Math.PI) / 180) * radius
                      const y = Math.sin((angle * Math.PI) / 180) * radius
                      return (
                        <div
                          key={cat.category}
                          className={`absolute w-4 h-4 rounded-full ${cat.color} border-2 border-white/20`}
                          style={{
                            left: `calc(50% + ${x}px - 8px)`,
                            top: `calc(50% + ${y}px - 8px)`,
                          }}
                        ></div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
