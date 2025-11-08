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
  suppressInitialScroll?: boolean
}

export function ChatMessagesArea({ 
  messages, 
  isLoading = false, 
  error = null, 
  height = undefined,
  className = "",
  suppressInitialScroll = false,
}: ChatMessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitializedRef = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (suppressInitialScroll && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      return
    }
    scrollToBottom()
  }, [messages, suppressInitialScroll])

  return (
    <div className={`flex-1 min-h-0 ${className}`}>
      <ScrollArea className="h-full">
        <div className="px-3 py-6">
          <div className="space-y-6">
            {messages.map((message, idx) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"} group`}
              >
                {message.sender === "ai" && (
                  <Avatar className="w-8 h-8 bg-primary/20 border border-primary/30 flex-shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <Scale className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 transition-all ${
                    message.sender === "user"
                      ? "bg-white text-neutral-900 ml-auto shadow-lg border border-white/60"
                      : "bg-white/[0.04] text-white/95 border border-white/10"
                  }`}
                >
                  <div className={
                    `text-[15px] leading-7 ${message.sender === 'user' ? 'text-neutral-900' : 'text-white/95'} whitespace-pre-wrap break-words`
                  }>
                    {message.content}
                  </div>
                  <div className={`mt-2 text-[11px] ${message.sender === 'user' ? 'text-neutral-600' : 'text-white/50'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                {message.sender === "user" && (
                  <Avatar className="w-8 h-8 bg-white/10 border border-white/20 flex-shrink-0">
                    <AvatarFallback className="bg-white/10 text-white/80">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 bg-primary/20 border border-primary/30">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <Scale className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white/[0.04] rounded-2xl px-4 py-3 border border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex gap-1 justify-start">
                <Avatar className="w-8 h-8 bg-primary/20 border border-primary/30">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <Scale className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-red-500/10 rounded-2xl px-4 py-3 border border-red-500/30">
                  <div className="text-[15px] leading-7 whitespace-pre-line text-red-200">{error}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
    </div>
  )
}
