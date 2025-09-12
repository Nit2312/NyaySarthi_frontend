import { cn } from "@/lib/utils"
import { Scale, Gavel, FileText } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function Loading({ size = "md", text = "Loading...", className = "" }: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center space-y-3">
        <div className={`${sizeClasses[size]} mx-auto rounded-full glass-subtle flex items-center justify-center animate-pulse`}>
          <Scale className={`${iconSizes[size]} text-primary animate-spin`} />
        </div>
        {text && (
          <p className="text-muted-foreground text-sm">{text}</p>
        )}
      </div>
    </div>
  )
}

// Enhanced loading components
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3"
  }

  return (
    <div 
      className={cn(
        "border-white/30 border-t-white rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LegalLoadingProps {
  message?: string
  className?: string
}

export function LegalLoading({ message = "Processing legal data...", className }: LegalLoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="relative mb-6">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-white/20 rounded-full animate-spin">
          <div className="absolute inset-2 border-2 border-white/40 border-t-white rounded-full animate-spin-reverse"></div>
        </div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Scale className="w-6 h-6 text-white animate-pulse" />
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-white font-medium mb-2">{message}</p>
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  )
}

interface SearchLoadingProps {
  searchQuery?: string
  className?: string
}

export function SearchLoading({ searchQuery, className }: SearchLoadingProps) {
  const steps = [
    { icon: FileText, text: "Analyzing query", delay: "0ms" },
    { icon: Scale, text: "Searching Indian Kanoon", delay: "500ms" },
    { icon: Gavel, text: "Processing results", delay: "1000ms" }
  ]

  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="mb-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        {searchQuery && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Searching for:</p>
            <p className="text-white font-medium max-w-md truncate">"{searchQuery}"</p>
          </div>
        )}
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center gap-3 text-gray-300"
              style={{ animationDelay: step.delay }}
            >
              <step.icon className="w-4 h-4 animate-pulse" />
              <span className="text-sm">{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton loading components
export function CaseCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card border-white/10 p-6 animate-pulse", className)}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/5 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-16 bg-white/5 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-white/5 rounded w-full"></div>
          <div className="h-4 bg-white/5 rounded w-full"></div>
        </div>
        
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded w-full"></div>
          <div className="h-3 bg-white/5 rounded w-4/5"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="h-6 w-20 bg-white/5 rounded-full"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-white/5 rounded"></div>
            <div className="h-8 w-8 bg-white/5 rounded"></div>
            <div className="h-8 w-8 bg-white/5 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
