import { Scale } from "lucide-react"

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
