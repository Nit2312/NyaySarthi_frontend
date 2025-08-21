"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Scale, Sparkles, Zap, Crown, Shield, Star, Heart, Diamond } from "lucide-react"

interface FloatingElement {
  id: string
  icon: React.ComponentType<{ className?: string }>
  size: string
  position: { x: number; y: number }
  animation: string
  delay: number
  opacity: number
}

const icons = [Scale, Sparkles, Zap, Crown, Shield, Star, Heart, Diamond]
const animations = [
  "floating-orbit",
  "floating-pulse",
  "floating-drift",
  "floating-spiral",
  "floating-bounce",
  "floating-sway",
  "floating-gentle",
  "floating-slow",
]

const sizes = ["w-4 h-4", "w-5 h-5", "w-6 h-6", "w-3 h-3"]

export function AdvancedFloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    const generateElements = () => {
      const newElements: FloatingElement[] = []

      for (let i = 0; i < 12; i++) {
        newElements.push({
          id: `floating-${i}`,
          icon: icons[Math.floor(Math.random() * icons.length)],
          size: sizes[Math.floor(Math.random() * sizes.length)],
          position: {
            x: Math.random() * 100,
            y: Math.random() * 100,
          },
          animation: animations[Math.floor(Math.random() * animations.length)],
          delay: Math.random() * 5,
          opacity: 0.1 + Math.random() * 0.3,
        })
      }

      setElements(newElements)
    }

    generateElements()
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((element) => {
        const IconComponent = element.icon
        return (
          <div
            key={element.id}
            className={`absolute ${element.animation} glow-subtle`}
            style={{
              left: `${element.position.x}%`,
              top: `${element.position.y}%`,
              animationDelay: `${element.delay}s`,
              opacity: element.opacity,
            }}
          >
            <IconComponent className={`${element.size} text-white`} />
          </div>
        )
      })}

      {/* Additional decorative floating orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 glass-ultra rounded-full glow-pulsing floating-drift" />
      <div className="absolute top-1/3 right-20 w-24 h-24 glass-strong rounded-full glow-rotating floating-spiral" />
      <div className="absolute bottom-20 left-1/4 w-40 h-40 glass rounded-full glow-medium floating-orbit" />
      <div className="absolute top-2/3 right-1/3 w-16 h-16 glass-ultra rounded-full glow-intense floating-bounce" />
      <div className="absolute bottom-1/3 right-10 w-28 h-28 glass-strong rounded-full glow-pulsing floating-sway" />

      {/* Floating light rays */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-white/10 via-white/5 to-transparent floating-sway" />
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-white/8 via-white/3 to-transparent floating-gentle" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent floating-pulse" />
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent floating-drift" />
    </div>
  )
}
