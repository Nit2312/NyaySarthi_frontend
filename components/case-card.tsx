"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Bookmark, Eye, Download, GitCompare } from "lucide-react"
import { CaseService } from "@/lib/case-service"
import type { CaseDoc } from "@/lib/types/case"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/components/ui/use-toast"

interface CaseCardProps {
  caseData: CaseDoc & { relevanceScore?: number; category?: string; summary?: string }
  searchQuery?: string
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
  isSelectionDisabled?: boolean
  onBookmarkToggle?: (id: string) => void
  isBookmarked?: boolean
  className?: string
}

export function CaseCard({
  caseData,
  searchQuery = "",
  isSelected = false,
  onToggleSelect,
  isSelectionDisabled = false,
  onBookmarkToggle,
  isBookmarked = false,
  className = ""
}: CaseCardProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [isHovered, setIsHovered] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(false)
  
  // Handle case click with prefetching
  const handleCardClick = useCallback(async (e: React.MouseEvent) => {
    // Don't navigate if clicking on a button or link
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
      return;
    }
    
    // Don't navigate if selection mode is active
    if (isSelected || isSelectionDisabled) {
      return;
    }
    
    try {
      setIsNavigating(true);
      
      // Prefetch case details before navigation
      if (caseData.id) {
        await CaseService.prefetchCaseDetails(caseData.id, searchQuery);
        
        // Navigate to case details page
        const params = new URLSearchParams();
        if (searchQuery) params.set('description', searchQuery);
        router.push(`/precedents/${caseData.id}?${params.toString()}`);
      }
    } catch (error) {
      console.error('Failed to navigate to case details:', error);
      toast({
        title: "Error",
        description: "Failed to load case details. Please try again.",
        variant: "destructive"
      });
      setIsNavigating(false);
    }
  }, [caseData.id, searchQuery, router, isSelected, isSelectionDisabled, toast])
  
  // Handle mouse enter for prefetching
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    
    // Only prefetch if not already prefetching and not already in cache
    if (!isPrefetching && !isSelected && caseData.id) {
      setIsPrefetching(true);
      CaseService.prefetchCaseDetails(caseData.id, searchQuery)
        .catch((error: unknown) => {
          console.warn('Prefetch failed:', error);
        })
        .finally(() => {
          setIsPrefetching(false);
        });
    }
  }, [caseData.id, searchQuery, isPrefetching, isSelected])
  
  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])
  
  // Handle toggle select for comparison
  const handleToggleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleSelect) {
      onToggleSelect(caseData.id)
    }
  }, [caseData.id, onToggleSelect])
  
  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onBookmarkToggle) {
      onBookmarkToggle(caseData.id)
    }
  }, [caseData.id, onBookmarkToggle])
  
  return (
    <Card 
      className={cn(
        "glass-card border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group relative",
        isSelected && "ring-2 ring-blue-500/50 border-blue-500/30 bg-blue-500/5",
        isNavigating && "opacity-75",
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-busy={isNavigating}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-gray-200 transition-colors line-clamp-2">
              {caseData.title}
            </h3>
            {caseData.citation && (
              <p className="text-gray-400 text-sm mt-1">{caseData.citation}</p>
            )}
          </div>
          
          {/* {typeof caseData.relevanceScore === 'number' && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {Math.round(caseData.relevanceScore)}% {t("precedent.relevant")}
            </Badge>
          )} */}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{caseData.court || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {caseData.date ? new Date(caseData.date).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>

        {caseData.summary && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
            {caseData.summary}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-white/20 text-gray-300">
              {caseData.category || 'Case Law'}
            </Badge>
            {isBookmarked && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Bookmark className="w-3 h-3 mr-1" />
                Saved
              </Badge>
            )}
          </div>
          
          <div className="flex gap-1">
            {caseData.url && (
              <Button 
                asChild 
                size="sm" 
                variant="ghost" 
                className="text-gray-400 hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <Link href={caseData.url} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-gray-400 hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-4 h-4" />
            </Button>
            
            {onToggleSelect && (
              <Button 
                size="sm" 
                variant="ghost" 
                className={cn(
                  "transition-colors",
                  isSelected 
                    ? "text-blue-400 hover:text-blue-300" 
                    : isSelectionDisabled
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 hover:text-white"
                )}
                onClick={handleToggleSelect}
                disabled={isSelectionDisabled}
                aria-label={isSelected ? "Deselect for comparison" : "Select for comparison"}
              >
                <GitCompare className="w-4 h-4" />
              </Button>
            )}
            
            {onBookmarkToggle && (
              <Button 
                size="sm" 
                variant="ghost" 
                className={cn(
                  "transition-colors",
                  isBookmarked 
                    ? "text-yellow-400 hover:text-yellow-300" 
                    : "text-gray-400 hover:text-white"
                )}
                onClick={handleBookmarkToggle}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <Bookmark 
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isBookmarked ? "fill-current" : ""
                  )} 
                />
              </Button>
            )}
          </div>
        </div>
        
        {/* Loading indicator for navigation */}
        {isNavigating && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
