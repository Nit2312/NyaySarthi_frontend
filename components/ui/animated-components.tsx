"use client"

import { useState, useEffect, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  className?: string
}

export function FadeIn({ children, delay = 0, direction = "up", className }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  const directionClasses = {
    up: "translate-y-5",
    down: "-translate-y-5",
    left: "translate-x-5",
    right: "-translate-x-5"
  }

  return (
    <div
      className={cn(
        "transition-all duration-600 ease-out",
        isVisible ? "opacity-100 translate-x-0 translate-y-0" : `opacity-0 ${directionClasses[direction]}`,
        className
      )}
    >
      {children}
    </div>
  )
}

interface CountUpProps {
  end: number
  duration?: number
  className?: string
  suffix?: string
}

export function CountUp({ end, duration = 2, className, suffix = "" }: CountUpProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(end * easeOutQuart))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration])

  return <span className={className}>{count}{suffix}</span>
}

interface PulseProps {
  children: ReactNode
  className?: string
  intensity?: "low" | "medium" | "high"
}

export function Pulse({ children, className, intensity = "medium" }: PulseProps) {
  const intensityClasses = {
    low: "animate-pulse",
    medium: "animate-pulse opacity-75",
    high: "animate-pulse opacity-50"
  }

  return (
    <div className={cn(intensityClasses[intensity], className)}>
      {children}
    </div>
  )
}

interface FloatingProps {
  children: ReactNode
  className?: string
  duration?: number
}

export function Floating({ children, className, duration = 3 }: FloatingProps) {
  return (
    <div
      className={cn("animate-bounce", className)}
      style={{
        animationDuration: `${duration}s`,
        animationIterationCount: 'infinite'
      }}
    >
      {children}
    </div>
  )
}

interface GlowProps {
  children: ReactNode
  className?: string
  color?: string
  intensity?: "low" | "medium" | "high"
}

export function Glow({ children, className, color = "white", intensity = "medium" }: GlowProps) {
  const glowClasses = {
    low: `drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`,
    medium: `drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`,
    high: `drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]`
  }

  return (
    <div 
      className={cn(glowClasses[intensity], className)}
      style={{
        filter: `drop-shadow(0 0 ${intensity === 'low' ? '10px' : intensity === 'medium' ? '15px' : '25px'} ${color})`
      }}
    >
      {children}
    </div>
  )
}

interface TypewriterProps {
  text: string
  speed?: number
  className?: string
  cursor?: boolean
}

export function Typewriter({ text, speed = 50, className, cursor = true }: TypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let currentIndex = 0
    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  useEffect(() => {
    if (cursor) {
      const cursorTimer = setInterval(() => {
        setShowCursor(prev => !prev)
      }, 500)

      return () => clearInterval(cursorTimer)
    }
  }, [cursor])

  return (
    <span className={className}>
      {displayText}
      {cursor && <span className={showCursor ? "opacity-100" : "opacity-0"}>|</span>}
    </span>
  )
}

interface ParticleFieldProps {
  className?: string
  particleCount?: number
}

export function ParticleField({ className, particleCount = 30 }: ParticleFieldProps) {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    animationDelay: Math.random() * 5
  }))

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            animationDelay: `${particle.animationDelay}s`
          }}
        />
      ))}
    </div>
  )
}

interface ShimmerProps {
  children: ReactNode
  className?: string
}

export function Shimmer({ children, className }: ShimmerProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      {children}
    </div>
  )
}

interface SuccessCheckmarkProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function SuccessCheckmark({ className, size = "md" }: SuccessCheckmarkProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "rounded-full bg-green-500 flex items-center justify-center transition-all duration-500 ease-out",
        sizeClasses[size],
        isVisible ? "scale-100 rotate-0" : "scale-0 rotate-180",
        className
      )}
    >
      <svg
        className="text-white"
        width="60%"
        height="60%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
  )
}
