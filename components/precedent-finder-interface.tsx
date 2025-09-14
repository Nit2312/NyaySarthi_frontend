"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/lib/language-context"
import { Search, BookOpen, Scale, Calendar, MapPin, User, Download, Eye, Star, Filter, TrendingUp, Clock, Bookmark, BarChart3, SortDesc, GitCompare, Plus, Check, Activity } from "lucide-react"
import { ApiService, type CaseDoc } from "@/lib/api-service"
import { useRouter } from "next/navigation"
import { CaseComparison } from "@/components/case-comparison"
import { CaseAnalytics } from "@/components/case-analytics"
import { SearchLoading, CaseCardSkeleton } from "@/components/ui/loading"
import RecommendationService, { type Recommendation } from "@/lib/recommendation-service"

interface SearchResultCase {
  id: string
  title: string
  citation?: string
  date?: string
  court?: string
  relevanceScore?: number
  summary?: string
  full_text?: string
  full_text_html?: string
  // Add other fields that might be present in the API response
  [key: string]: any
}

interface SearchResult {
  success: boolean
  ik_error?: string
  cases?: SearchResultCase[]
  // Add other fields that might be present in the API response
  [key: string]: any
}

interface PrecedentCase extends SearchResultCase {
  // We will use CaseDoc from the API. Some fields may be missing depending on API/scrape.
  relevanceScore?: number
  category?: string
  keyPoints?: string[]
  parties?: { petitioner?: string; respondent?: string }
  petitioner?: string
  respondent?: string
}

export function PrecedentFinderInterface() {
  const { t } = useLanguage()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<PrecedentCase[]>(() => {
    // Load search results from session storage on initial render
    if (typeof window !== 'undefined') {
      const savedResults = sessionStorage.getItem('nyay-sarthi-search-results')
      return savedResults ? JSON.parse(savedResults) : []
    }
    return []
  })
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState<PrecedentCase | null>(null)
  const [ikDiag, setIkDiag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'court'>('relevance')
  const [selectedCourt, setSelectedCourt] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [bookmarkedCases, setBookmarkedCases] = useState<Set<string>>(new Set())
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set())
  const [showComparison, setShowComparison] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([])

  // No more static mock data; we fetch real results from the backend

  // Load search history on component mount
  useEffect(() => {
    const saved = localStorage.getItem('nyay-sarthi-search-history')
    if (saved) {
      setSearchHistory(JSON.parse(saved))
    }
    const savedBookmarks = localStorage.getItem('nyay-sarthi-bookmarks')
    if (savedBookmarks) {
      setBookmarkedCases(new Set(JSON.parse(savedBookmarks)))
    }
    
    // Load initial recommendations
    setRecommendations(RecommendationService.getRecommendations())
  }, [])

  // Update smart suggestions when query changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        if (searchQuery.length > 1) {
          const suggestions = RecommendationService.getSmartSearchSuggestions(searchQuery)
          setSmartSuggestions(suggestions)
          setRecommendations(RecommendationService.getRecommendations(searchQuery))
        } else {
          setSmartSuggestions([])
          setRecommendations(RecommendationService.getRecommendations())
        }
      } catch (error) {
        console.warn('Failed to update recommendations:', error)
        setSmartSuggestions([])
        setRecommendations([])
      }
    }, 300) // Debounce by 300ms
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const saveSearchHistory = (query: string, results?: PrecedentCase[]) => {
    const updated = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
    setSearchHistory(updated)
    localStorage.setItem('nyay-sarthi-search-history', JSON.stringify(updated))
    
    // Save search results to session storage
    if (results) {
      sessionStorage.setItem('nyay-sarthi-search-results', JSON.stringify(results))
    }

    // Record pattern for recommendations
    try {
      if (results) {
        RecommendationService.recordSearch(query, results)
      }
    } catch {}
  }

  const toggleBookmark = (caseId: string) => {
    const newBookmarks = new Set(bookmarkedCases)
    if (newBookmarks.has(caseId)) {
      newBookmarks.delete(caseId)
    } else {
      newBookmarks.add(caseId)
    }
    setBookmarkedCases(newBookmarks)
    localStorage.setItem('nyay-sarthi-bookmarks', JSON.stringify([...newBookmarks]))
  }

  const toggleComparisonSelection = (caseId: string) => {
    const newSelection = new Set(selectedForComparison)
    if (newSelection.has(caseId)) {
      newSelection.delete(caseId)
    } else {
      if (newSelection.size >= 3) {
        // Limit to 3 cases for comparison
        return
      }
      newSelection.add(caseId)
    }
    setSelectedForComparison(newSelection)
  }

  const clearComparisonSelection = () => {
    setSelectedForComparison(new Set())
  }

  const startComparison = () => {
    if (selectedForComparison.size >= 2) {
      setShowComparison(true)
    }
  }

  const sortResults = (results: PrecedentCase[]) => {
    const sorted = [...results]
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => (new Date(b.date || '1900-01-01')).getTime() - (new Date(a.date || '1900-01-01')).getTime())
      case 'court':
        return sorted.sort((a, b) => (a.court || '').localeCompare(b.court || ''))
      case 'relevance':
      default:
        return sorted.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    }
  }

  const filterResults = (results: PrecedentCase[]) => {
    return results.filter(case_ => {
      if (selectedCourt !== 'all' && case_.court !== selectedCourt) return false
      if (selectedCategory !== 'all' && case_.category !== selectedCategory) return false
      if (dateRange !== 'all') {
        const caseYear = new Date(case_.date || '1900-01-01').getFullYear()
        const currentYear = new Date().getFullYear()
        switch (dateRange) {
          case 'recent': return currentYear - caseYear <= 5
          case 'last10': return currentYear - caseYear <= 10
          case 'older': return currentYear - caseYear > 10
        }
      }
      return true
    })
  }

  // Optimize search query for better performance
  const optimizeQuery = (query: string): string => {
    // Simple query cleaning - remove extra spaces and limit length
    return query
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 100) // Limit query length
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSearchError(null)
    setIkDiag(null)
    // Clear search results from session storage
    sessionStorage.removeItem('nyay-sarthi-search-results')
  }

  const handleSearch = async (customQuery?: string) => {
    const query = (customQuery || searchQuery).trim()
    if (!query) {
      setSearchError('Please enter a search query')
      return
    }
    
    // Optimize the search query
    const optimizedQuery = optimizeQuery(query)
    if (!optimizedQuery || optimizedQuery.length < 3) {
      setIkDiag('Please enter a more specific search query (at least 3 characters)')
      return
    }
    
    setSelectedCase(null)
    setSearchError(null)
    setIsSearching(true)
    
    // Show initial loading message
    setIkDiag('Searching for relevant cases...')
    
    try {
      // Optimize query by removing extra spaces and special characters
      const optimizedQuery = query.trim().replace(/\s+/g, ' ')
      
      // Show loading state with a slight delay to prevent UI flicker
      const loadingTimer = setTimeout(() => {
        setIkDiag(prev => prev || 'Searching through legal precedents...')
      }, 500)

      try {
        // Make the API request with a 30-second timeout (handled by the API service)
        const searchResult = await ApiService.searchCases(optimizedQuery, 5)
        
        clearTimeout(loadingTimer)
        
        if (!searchResult) {
          throw new Error('No response from server. Please check your connection and try again.')
        }

        if (!searchResult.success) {
          // Handle specific error cases
          if (searchResult.ik_error?.includes('too many requests')) {
            throw new Error('Too many requests. Please wait a moment before trying again.')
          }
          throw new Error(searchResult.ik_error || 'Search request failed. Please try again.')
        }

        // Validate and process the response
        if (!Array.isArray(searchResult.cases)) {
          console.error('Invalid response format:', searchResult)
          throw new Error('Invalid response from server. Please try again.')
        }

        const validCases = searchResult.cases.filter(case_ => {
          if (!case_?.id || !case_?.title) {
            console.warn('Skipping invalid case:', case_)
            return false
          }
          return true
        })
        
        if (validCases.length === 0) {
          setSearchResults([]) // Clear any previous results
          
          // Generate helpful suggestions based on the search query
          const suggestions = [
            'Try using more specific legal terms related to your query',
            'Check your spelling or try different keywords',
            'Use fewer keywords to broaden your search',
            'Try searching for a more general legal concept',
            'Include specific legal terms or case citations if available'
          ]
          
          // Show the first suggestion as the main message
          setSearchError(suggestions[0])
          
          // Show additional tips
          setIkDiag('Search tips: ' + 
            '• Use specific legal terminology\n' +
            '• Include relevant sections or articles\n' +
            '• Try different combinations of keywords\n' +
            '• Check your spelling'
          )
          
          // Don't throw an error, just return early
          return
        }
        
        const filteredAndSorted = sortResults(filterResults(validCases))
        setSearchResults(filteredAndSorted)
        
        // Save to search history with results for recommendations
        saveSearchHistory(query, filteredAndSorted)
        
        // Handle success/warning cases
        if (searchResult.ik_error && searchResult.ik_error !== 'no_credentials') {
          console.warn('Indian Kanoon warning:', searchResult.ik_error)
          setIkDiag(`Note: ${searchResult.ik_error}. Showing available results.`)
        } else {
          // Show success message briefly
          setIkDiag(`Found ${filteredAndSorted.length} relevant case${filteredAndSorted.length !== 1 ? 's' : ''}`)
          setTimeout(() => setIkDiag(null), 3000)
        }
        
      } catch (error) {
        console.error('Search error:', error)
        
        // Clear any pending loading timeout
        clearTimeout(loadingTimer)
        
        // Handle different types of errors with user-friendly messages
        let errorMessage = 'An error occurred during search.'
        
        if (error instanceof Error) {
          const errorStr = error.message.toLowerCase()
          
          if (errorStr.includes('network') || errorStr.includes('failed to fetch')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.'
          } else if (errorStr.includes('timeout') || errorStr.includes('timed out')) {
            errorMessage = 'The server is taking too long to respond. Please try again in a moment.'
          } else if (errorStr.includes('too many requests')) {
            errorMessage = 'Too many requests. Please wait a moment before trying again.'
          } else if (errorStr.includes('no response')) {
            errorMessage = 'No response from server. Please check your connection and try again.'
          } else {
            errorMessage = error.message || errorMessage
          }
        }
        
        setSearchError(errorMessage)
        setIkDiag('')
        setSearchResults([])
        
        // Clear error after 10 seconds
        setTimeout(() => {
          setSearchError('')
        }, 10000)
      } finally {
        setIsSearching(false)
      }
    } catch (error: unknown) {
      console.error('Search error:', error)
      
      // More detailed error handling with specific error messages
      let errorMessage = 'An error occurred while searching.'
      let errorDetails = ''
      let clearAfter = 5000 // Default 5 seconds for error display
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase()
        errorDetails = error.message
        
        // Handle specific error cases with more specific messages
        if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
          errorMessage = 'Search limit reached'
          errorDetails = 'Please wait a moment before trying again.'
          clearAfter = 10000 // Show rate limit errors longer
        } 
        else if (errorMsg.includes('network') || errorMsg.includes('offline') || errorMsg.includes('timeout')) {
          errorMessage = 'Connection issue'
          errorDetails = 'Please check your internet connection and try again.'
        } 
        else if (errorMsg.includes('no result') || errorMsg.includes('not found')) {
          errorMessage = 'No results found'
          errorDetails = 'Try different search terms or broaden your search.'
        }
        else if (errorMsg.includes('time out') || errorMsg.includes('timed out')) {
          errorMessage = 'Request timed out'
          errorDetails = 'The server took too long to respond. Please try again.'
        }
      }
      
      console.warn(`Search failed: ${errorMessage} - ${errorDetails}`)
      
      // Set error states
      setSearchError(errorMessage)
      setIkDiag(errorDetails || errorMessage)
      setSearchResults([])
      
      // Clear the error after specified duration
      const timeoutId = setTimeout(() => {
        setSearchError(null)
        setIkDiag(null)
      }, clearAfter)
      
      // Cleanup timeout on component unmount
      return () => clearTimeout(timeoutId)
    } finally {
      setIsSearching(false)
    }
  }

  const categories = [
    "Constitutional Law",
    "Criminal Law",
    "Civil Law",
    "Corporate Law",
    "Family Law",
    "Tax Law",
    "Labour Law",
    "Property Law",
  ]
  const courts = ["Supreme Court of India", "High Court", "District Court", "Tribunal"]

  return (
    <div className="min-h-max bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white/3 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white/4 rounded-full blur-2xl animate-float"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-xl flex items-center justify-center glass-card">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                {t("precedent.title")}
              </h1>
              <p className="text-gray-400 mt-1">{t("precedent.subtitle")}</p>
            </div>
          </div>
        </div>

        <Card className="glass-card border-white/10 mb-8">
          <CardContent className="p-6">
            {/* Main Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder={t("precedent.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                      aria-label="Clear search"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                {/* Smart Suggestions */}
                {(smartSuggestions.length > 0 && searchQuery.length > 1) && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-2">Smart suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {smartSuggestions.slice(0, 3).map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSearchQuery(suggestion)}
                          className="text-xs px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 hover:bg-blue-500/20 transition-colors"
                        >
                          <TrendingUp className="w-3 h-3 inline mr-1" />{suggestion.slice(0, 40)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recent Search History */}
                {!searchQuery && searchHistory.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-2">Recent searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.slice(0, 3).map((query, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSearchQuery(query)}
                          className="text-xs px-3 py-1 bg-white/5 rounded-full text-gray-300 hover:bg-white/10 transition-colors"
                        >
                          <Clock className="w-3 h-3 inline mr-1" />{query.slice(0, 30)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </div>
                  ) : 'Search'}
                </Button>
                <Button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/10 h-10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Court</label>
                    <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/20">
                        <SelectItem value="all">All Courts</SelectItem>
                        {courts.map(court => (
                          <SelectItem key={court} value={court}>{court}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/20">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Date Range</label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/20">
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="recent">Last 5 Years</SelectItem>
                        <SelectItem value="last10">Last 10 Years</SelectItem>
                        <SelectItem value="older">Older than 10 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={(value: 'relevance' | 'date' | 'court') => setSortBy(value)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/20">
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="court">Court</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostic Messages */}
            {(ikDiag || searchError) && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                searchError 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
              }`}>
                {searchError || ikDiag}
                {searchError && (
                  <button 
                    onClick={() => setSearchError(null)} 
                    className="float-right text-sm font-medium hover:opacity-80"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            )}

            {/* Quick Categories */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {t("precedent.categories")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className={`cursor-pointer border-white/20 transition-colors ${
                      selectedFilters.includes(category) 
                        ? 'bg-white/20 text-white border-white/40' 
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setSelectedFilters((prev) =>
                        prev.includes(category) ? prev.filter((f) => f !== category) : [...prev, category],
                      )
                    }}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isSearching && (
          <div className="space-y-6">
            <SearchLoading searchQuery={searchQuery} />
            <div className="grid lg:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <CaseCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}
        
        {searchResults.length > 0 && !isSearching && (
          <>
            {showAnalytics && (
              <CaseAnalytics 
                cases={searchResults} 
                searchQuery={searchQuery}
                className="mb-6"
              />
            )}
            
            <div className={`grid ${showAnalytics ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
              {/* Results List */}
              <div className={`${showAnalytics ? 'col-span-1' : 'lg:col-span-2'} space-y-4`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {t("precedent.results")} ({searchResults.length})
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-white/20 transition-colors ${
                      showAnalytics 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-gray-300 hover:bg-white/10"
                    onClick={() => setSortBy(sortBy === 'relevance' ? 'date' : 'relevance')}
                  >
                    <SortDesc className="w-4 h-4 mr-2" />
                    Sort by {sortBy === 'relevance' ? 'Date' : 'Relevance'}
                  </Button>
                </div>
              </div>
              
              {/* Comparison Toolbar */}
              {selectedForComparison.size > 0 && (
                <Card className="glass-card border-blue-500/30 bg-blue-500/5 p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GitCompare className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">
                        {selectedForComparison.size} case{selectedForComparison.size !== 1 ? 's' : ''} selected for comparison
                      </span>
                      {selectedForComparison.size >= 3 && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Max reached
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-gray-300 hover:bg-white/10"
                        onClick={clearComparisonSelection}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                        onClick={startComparison}
                        disabled={selectedForComparison.size < 2}
                      >
                        <GitCompare className="w-4 h-4 mr-2" />
                        Compare ({selectedForComparison.size})
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              {searchResults.map((case_) => (
                <Card
                  key={case_.id}
                  className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    // Record case view for recommendations
                    try {
                      RecommendationService.recordCaseView(case_)
                    } catch {}
                    
                    const q = new URLSearchParams()
                    if (searchQuery) q.set('desc', searchQuery)
                    router.push(`/precedents/${case_.id}?${q.toString()}`)
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-gray-200 transition-colors">
                          {case_.title}
                        </h3>
                        {case_.citation && (
                          <p className="text-gray-400 text-sm mt-1">{case_.citation}</p>
                        )}
                      </div>
                      {typeof case_.relevanceScore === 'number' && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          {case_.relevanceScore}% {t("precedent.relevant")}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4" />
                        {case_.court || '—'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        {case_.date ? new Date(case_.date).toLocaleDateString() : '—'}
                      </div>
                    </div>

                    {case_.summary && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{case_.summary}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-white/20 text-gray-300">
                          {case_.category || 'Case Law'}
                        </Badge>
                        {bookmarkedCases.has(case_.id) && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Bookmark className="w-3 h-3 mr-1" />Saved
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {case_.url && (
                          <Button asChild size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                            <a href={case_.url} target="_blank" rel="noreferrer">
                              <Eye className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className={`transition-colors ${
                            selectedForComparison.has(case_.id)
                              ? 'text-blue-400 hover:text-blue-300'
                              : selectedForComparison.size >= 3
                                ? 'text-gray-600 cursor-not-allowed'
                                : 'text-gray-400 hover:text-white'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleComparisonSelection(case_.id)
                          }}
                          disabled={selectedForComparison.size >= 3 && !selectedForComparison.has(case_.id)}
                          title={selectedForComparison.has(case_.id) ? 'Remove from comparison' : 'Add to comparison'}
                        >
                          {selectedForComparison.has(case_.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className={`transition-colors ${
                            bookmarkedCases.has(case_.id) 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-gray-400 hover:text-white'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleBookmark(case_.id)
                          }}
                        >
                          {bookmarkedCases.has(case_.id) ? <Bookmark className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

              
              {/* Case Details Sidebar - only show when not in analytics mode */}
              {!showAnalytics && (
                <div className="lg:col-span-1">
                  {selectedCase ? (
                    <Card className="glass-card border-white/10 sticky top-6 max-h-[calc(100vh-3rem)] overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">{t("precedent.caseDetails")}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 overflow-y-auto pr-2 max-h-[calc(100vh-3rem-4rem)]">
                        <div>
                          <h4 className="font-medium text-white mb-2">{selectedCase.title}</h4>
                          {selectedCase.summary && (
                            <p className="text-gray-400 text-sm">{selectedCase.summary}</p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-white mb-2">{t("precedent.parties")}</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-400">{t("precedent.petitioner")}: </span>
                              <span className="text-white">{selectedCase.parties?.petitioner || '—'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">{t("precedent.respondent")}: </span>
                              <span className="text-white">{selectedCase.parties?.respondent || '—'}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-white mb-2">{t("precedent.judges")}</h4>
                          <div className="space-y-1">
                            {(selectedCase as any).judges?.map((judge: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                <User className="w-3 h-3" />
                                {judge}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-white mb-2">{t("precedent.keyPoints")}</h4>
                          <ul className="space-y-1">
                            {(selectedCase.keyPoints ?? []).map((point, index) => (
                              <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                                <div className="w-1 h-1 bg-white rounded-full mt-2 flex-shrink-0"></div>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {selectedCase.url && (
                          <div className="pt-4 border-t border-white/10">
                            <Button asChild className="w-full bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white">
                              <a href={selectedCase.url} target="_blank" rel="noreferrer">
                                <Eye className="w-4 h-4 mr-2" />
                                View on Indian Kanoon
                              </a>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="glass-card border-white/10 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                      <CardContent className="p-6 text-center">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">{t("precedent.selectCase")}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {searchResults.length === 0 && !isSearching && (
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border-white/10">
              <TabsTrigger value="recent" className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white">
                <Clock className="w-4 h-4 mr-2" />Recent
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />Trending
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white">
                <Bookmark className="w-4 h-4 mr-2" />Bookmarks ({bookmarkedCases.size})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {searchHistory.length > 0 ? searchHistory.slice(0, 5).map(
                      (search, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => {
                            setSearchQuery(search)
                            handleSearch()
                          }}
                        >
                          <span className="text-gray-300 flex-1 truncate">{search}</span>
                          <Search className="w-4 h-4 text-gray-400 ml-2" />
                        </div>
                      ),
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Clock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>No recent searches yet</p>
                        <p className="text-xs mt-1">Your search history will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Quick Start
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["Constitutional Law Cases", "Privacy Rights", "Workplace Harassment", "Fundamental Rights", "Consumer Protection"].map(
                      (search, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => {
                            setSearchQuery(`Find cases related to ${search.toLowerCase()}`)
                          }}
                        >
                          <span className="text-gray-300">{search}</span>
                          <Search className="w-4 h-4 text-gray-400" />
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trending" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Personalized Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recommendations.slice(0, 6).map((rec, index) => (
                      <div
                        key={rec.id}
                        className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                        onClick={() => {
                          setSearchQuery(rec.query)
                          handleSearch()
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">
                            {rec.title}
                          </h4>
                          <Badge 
                            className={`text-xs ml-2 flex-shrink-0 ${
                              rec.type === 'trending' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              rec.type === 'similar' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                              rec.type === 'category-based' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                              rec.type === 'court-based' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                              'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}
                          >
                            {rec.type === 'trending' ? '🔥' :
                             rec.type === 'similar' ? '🔍' :
                             rec.type === 'category-based' ? '📚' :
                             rec.type === 'court-based' ? '⚖️' : '💡'}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs">{rec.reason}</p>
                      </div>
                    ))}
                    {recommendations.length === 0 && (
                      <div className="text-center py-4 text-gray-400">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Start searching to get personalized recommendations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Court Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { court: "Supreme Court", percentage: 85, cases: "1,234" },
                      { court: "High Court", percentage: 65, cases: "892" },
                      { court: "District Court", percentage: 45, cases: "456" },
                      { court: "Tribunal", percentage: 30, cases: "234" }
                    ].map((stat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">{stat.court}</span>
                          <span className="text-white">{stat.cases}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-white/30 to-white/50 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="mt-6">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5" />
                    Bookmarked Cases ({bookmarkedCases.size})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookmarkedCases.size === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Bookmark className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p>No bookmarked cases yet</p>
                      <p className="text-xs mt-1">Bookmark cases to save them for later reference</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-400 text-sm">You have {bookmarkedCases.size} bookmarked case{bookmarkedCases.size !== 1 ? 's' : ''}.</p>
                      <Button 
                        variant="outline"
                        className="w-full border-white/20 text-gray-300 hover:bg-white/10"
                        onClick={() => {
                          setSearchQuery(`Show me my bookmarked cases: ${[...bookmarkedCases].join(', ')}`)
                        }}
                      >
                        View All Bookmarks
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Case Comparison Modal */}
        {showComparison && (
          <CaseComparison
            caseIds={[...selectedForComparison]}
            onClose={() => {
              setShowComparison(false)
              setSelectedForComparison(new Set())
            }}
            userDescription={searchQuery}
          />
        )}
      </div>
    </div>
  )
}
