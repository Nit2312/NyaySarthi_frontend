"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Scale, User, ArrowLeft, Mic, Paperclip, Sparkles, Zap, Shield, AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { getEnhancedLegalResponse } from "@/lib/indian-legal-context"
import { useLoading } from "@/hooks/use-loading"
import { useDebounce } from "@/hooks/use-debounce"
import Link from "next/link"
import useSpeech from "@/hooks/use-speech"
import { ChatMessagesArea } from "./chat-messages-area"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  language?: "en" | "hi"
}



export function ChatInterface() {
  const { t, language } = useLanguage()
  const { isLoading, withLoading } = useLoading()
  
  // Prevent scrolling on mount
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: t("chat.greeting"),
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Control body overflow
  useEffect(() => {
    // Prevent body scroll when chat interface is mounted
    document.body.style.overflow = 'hidden'
    return () => {
      // Restore body scroll when unmounted
      document.body.style.overflow = ''
    }
  }, [])

  // Speech-to-text integration
  const {
    supported: sttSupported,
    listening,
    interimTranscript,
    start: startListening,
    stop: stopListening,
    reset: resetListening,
  } = useSpeech({
    lang: language === "hi" ? "hi-IN" : "en-IN",
    onResult: (text) => {
      // Append recognized text to the input
      setInputValue((prev) => (prev ? prev + " " : "") + text)
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Prevent the outer page from scrolling while this chat view is mounted
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setError(null)

    await withLoading(async () => {
      try {
        // Simulate AI response with better error handling
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: getEnhancedLegalResponse(currentInput, language),
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
      } catch (err) {
        setError("Failed to get response. Please try again.")
        console.error("Chat error:", err)
      }
    })
  }, [inputValue, isLoading, language, withLoading])

  const handleQuickQuestion = (question: string) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
        <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background">
        <div
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Main container - fixed width, full height */}
      <div className="relative w-full h-full max-w-5xl mx-auto flex flex-col z-10">
        {/* Header (keeps title and back button) */}
        <div className="glass-ultra rounded-t-3xl px-4 floating-element glow-medium border border-white/20 h-16 flex items-center shrink-0">
          <div className="flex items-center justify-start">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="glass-strong glow-subtle hover:glow-medium transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h2 className="ml-4 text-lg font-semibold">Chat Assistant</h2>
          </div>
        </div>

        {/* Main card: messages take available space; input stays fixed at bottom */}
  <Card className="glass-ultra border-x border-white/20 border-t-0 rounded-none glow-medium flex-1 min-h-0 flex flex-col h-[calc(100vh-4rem)]">
            {/* Card header: includes quick questions and the message input so header+search stay together */}
            <div className="glass-ultra border-b border-white/10 p-4 sticky top-0 z-20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-accent" />
                  <h3 className="text-sm font-bold text-premium">{language === "en" ? "Quick Legal Questions:" : "त्वरित कानूनी प्रश्न:"}</h3>
                </div>
                <div className="flex-1 ml-4">
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={language === "en" ? "Ask about Indian law..." : "भारतीय कानून के बारे में पूछें..."}
                      className="glass-strong border-white/20 pr-28 py-3 text-base font-medium glow-subtle focus:glow-medium transition-all duration-300"
                      disabled={isLoading}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 glass glow-subtle hover:glow-medium transition-all"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => (listening ? stopListening() : startListening())}
                        aria-pressed={listening}
                        title={sttSupported ? (listening ? "Stop voice input" : "Start voice input") : "Voice input not supported in this browser"}
                        className={`h-9 w-9 p-0 glass ${listening ? "bg-primary/20" : ""} glow-subtle hover:glow-medium transition-all`}
                      >
                        <Mic className={`w-4 h-4 ${listening ? "animate-pulse text-primary" : ""}`} />
                      </Button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="h-9 w-9 p-0 glass-strong glow-medium hover:glow-strong transition-all duration-300 group"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto">
                <button onClick={() => handleQuickQuestion('What are the steps to file a consumer complaint?')} className="badge">Consumer rights</button>
                <button onClick={() => handleQuickQuestion('How to get bail in criminal cases?')} className="badge">Bail procedure</button>
                <button onClick={() => handleQuickQuestion('How much is compensation for motor accident?')} className="badge">Motor accident</button>
              </div>
            </div>

            {/* Messages area - scrollable */}
            <ChatMessagesArea messages={messages} isLoading={isLoading} error={error} />

            {/* Footer disclaimer */}
            <div className="p-3 border-t border-white/10 text-center">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <p className="text-xs text-muted-foreground text-center font-medium">
                  {language === "en"
                    ? "Nyay Sarthi provides general legal information based on Indian law. Consult a qualified lawyer for specific legal advice."
                    : "न्याय सारथी भारतीय कानून के आधार पर सामान्य कानूनी जानकारी प्रदान करता है। विशिष्ट कानूनी सलाह के लिए एक योग्य वकील से सलाह लें।"}
                </p>
              </div>
            </div>
        </Card>
      </div>
    </div>
  )
}
