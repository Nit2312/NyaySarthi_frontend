"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Scale, User, AlertCircle } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  category?: string
}

interface ChatMessagesAreaProps {
  messages: Message[]
  isLoading?: boolean
  error?: string | null
  height?: string
  className?: string
}

export function ChatMessagesArea({ 
  messages, 
  isLoading = false, 
  error = null, 
  height = undefined,
  className = ""
}: ChatMessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className={`flex-1 min-h-0 ${className}`}>
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "ai" && (
                <Avatar className="w-10 h-10 bg-gradient-to-br from-primary to-accent glow-medium floating-element">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    <Scale className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-6 py-4 floating-element transition-all duration-300 ${
                  message.sender === "user"
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground ml-auto glow-medium border border-white/20"
                    : "glass-strong glow-subtle border border-white/10"
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-line font-medium">
                  {message.content}
                </div>
                <p className="text-xs opacity-70 mt-3 font-medium">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {message.sender === "user" && (
                <Avatar className="w-10 h-10 bg-gradient-to-br from-secondary to-muted glow-subtle floating-element">
                  <AvatarFallback className="bg-gradient-to-br from-secondary to-muted text-secondary-foreground">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <Avatar className="w-10 h-10 bg-gradient-to-br from-primary to-accent glow-medium">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Scale className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="glass-strong rounded-2xl px-6 py-4 glow-subtle border border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce glow-subtle"></div>
                  <div
                    className="w-3 h-3 bg-primary rounded-full animate-bounce glow-subtle"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-primary rounded-full animate-bounce glow-subtle"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex gap-4 justify-start">
              <Avatar className="w-10 h-10 bg-gradient-to-br from-destructive to-red-500 glow-medium">
                <AvatarFallback className="bg-gradient-to-br from-destructive to-red-500 text-white">
                  <AlertCircle className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="glass-strong rounded-2xl px-6 py-4 glow-subtle border border-red-500/20 bg-red-500/10">
                <div className="text-sm leading-relaxed text-red-200 font-medium">{error}</div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
    </div>
  )
}
