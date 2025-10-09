import { CaseDoc } from "./types/case"

export interface SearchPattern {
  query: string
  timestamp: number
  results: number
  categories: string[]
  courts: string[]
}

export interface UserPreference {
  preferredCategories: Record<string, number>
  preferredCourts: Record<string, number>
  searchFrequency: Record<string, number>
  timePatterns: {
    mostActiveHour: number
    mostActiveDay: string
  }
}

export interface Recommendation {
  id: string
  title: string
  reason: string
  score: number
  type: 'trending' | 'similar' | 'category-based' | 'court-based' | 'time-based'
  query: string
}

class RecommendationService {
  private static readonly STORAGE_KEYS = {
    SEARCH_PATTERNS: 'nyay-sarthi-search-patterns',
    USER_PREFERENCES: 'nyay-sarthi-user-preferences',
    VIEWED_CASES: 'nyay-sarthi-viewed-cases'
  }

  private static readonly CATEGORIES = [
    "Constitutional Law",
    "Criminal Law", 
    "Civil Law",
    "Corporate Law",
    "Family Law",
    "Tax Law",
    "Labour Law",
    "Property Law",
    "Environmental Law",
    "Human Rights"
  ]

  private static readonly TRENDING_TOPICS = [
    { topic: "Digital Privacy Rights", weight: 0.9 },
    { topic: "Environmental Protection", weight: 0.8 },
    { topic: "Labor Rights", weight: 0.7 },
    { topic: "Consumer Protection", weight: 0.6 },
    { topic: "Corporate Governance", weight: 0.5 },
    { topic: "Property Disputes", weight: 0.4 },
    { topic: "Family Court Matters", weight: 0.3 },
    { topic: "Tax Assessment", weight: 0.2 }
  ]

  static recordSearch(query: string, results: CaseDoc[]): void {
    try {
      const patterns = this.getSearchPatterns()
      const categories = this.extractCategories(results)
      const courts = this.extractCourts(results)

      const newPattern: SearchPattern = {
        query: query.toLowerCase().trim(),
        timestamp: Date.now(),
        results: results.length,
        categories,
        courts
      }

      patterns.unshift(newPattern)
      // Keep only last 100 searches
      if (patterns.length > 100) {
        patterns.splice(100)
      }

      localStorage.setItem(this.STORAGE_KEYS.SEARCH_PATTERNS, JSON.stringify(patterns))
      this.updateUserPreferences(newPattern)
    } catch (error) {
      console.error('Failed to record search pattern:', error)
    }
  }

  static recordCaseView(caseDoc: CaseDoc): void {
    try {
      const viewedCases = this.getViewedCases()
      const viewRecord = {
        id: caseDoc.id,
        title: caseDoc.title,
        court: caseDoc.court,
        category: (caseDoc as any).category,
        timestamp: Date.now()
      }

      // Remove existing record for same case
      const existingIndex = viewedCases.findIndex(v => v.id === caseDoc.id)
      if (existingIndex >= 0) {
        viewedCases.splice(existingIndex, 1)
      }

      viewedCases.unshift(viewRecord)
      // Keep only last 50 viewed cases
      if (viewedCases.length > 50) {
        viewedCases.splice(50)
      }

      localStorage.setItem(this.STORAGE_KEYS.VIEWED_CASES, JSON.stringify(viewedCases))
    } catch (error) {
      console.error('Failed to record case view:', error)
    }
  }

  static getRecommendations(currentQuery?: string): Recommendation[] {
    try {
      const recommendations: Recommendation[] = []
      const preferences = this.getUserPreferences()
      const patterns = this.getSearchPatterns()
      const viewedCases = this.getViewedCases()

      // 1. Category-based recommendations
      recommendations.push(...this.getCategoryBasedRecommendations(preferences))

      // 2. Similar search recommendations
      if (currentQuery) {
        recommendations.push(...this.getSimilarSearchRecommendations(currentQuery, patterns))
      }

      // 3. Trending topics
      recommendations.push(...this.getTrendingRecommendations())

      // 4. Court-based recommendations
      recommendations.push(...this.getCourtBasedRecommendations(preferences))

      // 5. Time-based recommendations
      recommendations.push(...this.getTimeBasedRecommendations(patterns))

      // 6. Recently viewed similar cases
      recommendations.push(...this.getViewHistoryRecommendations(viewedCases))

      // Sort by score and deduplicate
      const uniqueRecommendations = this.deduplicateRecommendations(recommendations)
      return uniqueRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 15)
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      return this.getFallbackRecommendations()
    }
  }

  static getSmartSearchSuggestions(query: string): string[] {
    try {
      const patterns = this.getSearchPatterns()
      const preferences = this.getUserPreferences()
      
      if (query.length < 2) {
        // Return popular categories when query is too short
        return Object.entries(preferences.preferredCategories)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([category]) => `Find cases related to ${category.toLowerCase()}`)
      }

      const queryLower = query.toLowerCase()
      const suggestions = new Set<string>()

      // Find similar past searches
      patterns.forEach(pattern => {
        if (pattern.query.includes(queryLower) && pattern.query !== queryLower) {
          suggestions.add(pattern.query)
        }
      })

      // Add smart completions
      const smartCompletions = this.generateSmartCompletions(query, preferences)
      smartCompletions.forEach(comp => suggestions.add(comp))

      return Array.from(suggestions).slice(0, 8)
    } catch (error) {
      return []
    }
  }

  private static getSearchPatterns(): SearchPattern[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SEARCH_PATTERNS)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private static getViewedCases(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.VIEWED_CASES)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private static getUserPreferences(): UserPreference {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {}

    return {
      preferredCategories: {},
      preferredCourts: {},
      searchFrequency: {},
      timePatterns: {
        mostActiveHour: 14,
        mostActiveDay: 'Monday'
      }
    }
  }

  private static updateUserPreferences(pattern: SearchPattern): void {
    try {
      const preferences = this.getUserPreferences()

      // Update category preferences
      pattern.categories.forEach(category => {
        preferences.preferredCategories[category] = (preferences.preferredCategories[category] || 0) + 1
      })

      // Update court preferences
      pattern.courts.forEach(court => {
        preferences.preferredCourts[court] = (preferences.preferredCourts[court] || 0) + 1
      })

      // Update search frequency
      const queryTerms = pattern.query.split(' ').filter(term => term.length > 3)
      queryTerms.forEach(term => {
        preferences.searchFrequency[term] = (preferences.searchFrequency[term] || 0) + 1
      })

      // Update time patterns
      const now = new Date()
      preferences.timePatterns.mostActiveHour = now.getHours()
      preferences.timePatterns.mostActiveDay = now.toLocaleDateString('en', { weekday: 'long' })

      localStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to update user preferences:', error)
    }
  }

  private static extractCategories(results: CaseDoc[]): string[] {
    return [...new Set(results.map(r => (r as any).category).filter(Boolean))]
  }

  private static extractCourts(results: CaseDoc[]): string[] {
    // Filter out undefined/null courts and ensure the return type is string[]
    const courts = results
      .map(r => r.court)
      .filter((c): c is string => typeof c === 'string' && c.length > 0)
    return [...new Set(courts)]
  }

  private static getCategoryBasedRecommendations(preferences: UserPreference): Recommendation[] {
    const recommendations: Recommendation[] = []
    
    const topCategories = Object.entries(preferences.preferredCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    topCategories.forEach(([category, count], index) => {
      recommendations.push({
        id: `category-${category}`,
        title: `Explore more ${category} cases`,
        reason: `You've searched ${count} times in this area`,
        score: 0.8 - (index * 0.1),
        type: 'category-based',
        query: `Find recent ${category.toLowerCase()} cases and precedents`
      })
    })

    return recommendations
  }

  private static getSimilarSearchRecommendations(query: string, patterns: SearchPattern[]): Recommendation[] {
    const queryLower = query.toLowerCase()
    const queryTerms = queryLower.split(' ').filter(term => term.length > 3)
    
    return patterns
      .filter(p => {
        const similarity = this.calculateTextSimilarity(queryLower, p.query)
        return similarity > 0.3 && similarity < 0.9
      })
      .slice(0, 3)
      .map((pattern, index) => ({
        id: `similar-${pattern.timestamp}`,
        title: `"${this.capitalizeFirst(pattern.query)}"`,
        reason: 'Similar to your current search',
        score: 0.7 - (index * 0.1),
        type: 'similar' as const,
        query: pattern.query
      }))
  }

  private static getTrendingRecommendations(): Recommendation[] {
    return this.TRENDING_TOPICS
      .slice(0, 4)
      .map((trend, index) => ({
        id: `trending-${trend.topic}`,
        title: `${trend.topic} cases`,
        reason: 'Trending topic in legal research',
        score: 0.6 + trend.weight * 0.1,
        type: 'trending' as const,
        query: `Find recent cases related to ${trend.topic.toLowerCase()}`
      }))
  }

  private static getCourtBasedRecommendations(preferences: UserPreference): Recommendation[] {
    const topCourts = Object.entries(preferences.preferredCourts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)

    return topCourts.map(([court, count], index) => ({
      id: `court-${court}`,
      title: `Recent ${court} decisions`,
      reason: `You often search cases from this court`,
      score: 0.5 - (index * 0.1),
      type: 'court-based' as const,
      query: `Find recent important decisions from ${court}`
    }))
  }

  private static getTimeBasedRecommendations(patterns: SearchPattern[]): Recommendation[] {
    const recentPatterns = patterns.filter(p => Date.now() - p.timestamp < 7 * 24 * 60 * 60 * 1000) // Last week
    
    if (recentPatterns.length === 0) return []

    const categories = recentPatterns.flatMap(p => p.categories)
    const categoryCount = categories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]

    if (!topCategory) return []

    return [{
      id: `time-${topCategory[0]}`,
      title: `Latest ${topCategory[0]} updates`,
      reason: 'Based on your recent research focus',
      score: 0.45,
      type: 'time-based',
      query: `Find the latest ${topCategory[0].toLowerCase()} cases and updates`
    }]
  }

  private static getViewHistoryRecommendations(viewedCases: any[]): Recommendation[] {
    if (viewedCases.length === 0) return []

    const recentViews = viewedCases.slice(0, 3)
    
    return recentViews.map((viewed, index) => ({
      id: `viewed-${viewed.id}`,
      title: `Cases similar to "${viewed.title.slice(0, 50)}..."`,
      reason: 'Based on your recently viewed cases',
      score: 0.4 - (index * 0.05),
      type: 'similar' as const,
      query: `Find cases similar to ${viewed.title.toLowerCase()}`
    }))
  }

  private static generateSmartCompletions(query: string, preferences: UserPreference): string[] {
  const completions: string[] = []
    const queryLower = query.toLowerCase()

    // Category-based completions
    this.CATEGORIES.forEach(category => {
      if (category.toLowerCase().includes(queryLower)) {
        completions.push(`${query} in ${category}`)
        completions.push(`Recent ${category.toLowerCase()} cases about ${query}`)
      }
    })

    // Common legal terms completions
    const legalTerms = ['rights', 'law', 'court', 'judgment', 'precedent', 'case', 'ruling', 'decision']
    legalTerms.forEach(term => {
      if (term.includes(queryLower) || queryLower.includes(term)) {
        completions.push(`${query} ${term}`)
      }
    })

    return completions.slice(0, 3)
  }

  private static calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' ').filter(w => w.length > 3))
    const words2 = new Set(text2.split(' ').filter(w => w.length > 3))
    
    const intersection = new Set([...words1].filter(w => words2.has(w)))
    const union = new Set([...words1, ...words2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  private static deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set<string>()
    return recommendations.filter(rec => {
      if (seen.has(rec.query.toLowerCase())) {
        return false
      }
      seen.add(rec.query.toLowerCase())
      return true
    })
  }

  private static capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  private static getFallbackRecommendations(): Recommendation[] {
    return [
      {
        id: 'fallback-1',
        title: 'Explore Constitutional Law cases',
        reason: 'Popular category',
        score: 0.5,
        type: 'category-based',
        query: 'constitutional law recent cases'
      },
      {
        id: 'fallback-2', 
        title: 'Criminal Law precedents',
        reason: 'Frequently searched',
        score: 0.4,
        type: 'category-based',
        query: 'criminal law landmark judgments'
      }
    ]
  }
}

export default RecommendationService
