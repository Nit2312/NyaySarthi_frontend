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
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl floating-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/[0.02] rounded-full blur-2xl floating-gentle" />
        <div
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8 flex flex-col relative z-10" style={{ height: '100vh' }}>
        <div className="glass-ultra rounded-t-3xl p-4 floating-element glow-medium border border-white/20">
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
          </div>
        </div>

        <Card className="glass-ultra border-x border-white/20 border-t-0 rounded-none glow-medium" style={{ height: '600px' }}>
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
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
                      <div className="text-sm leading-relaxed whitespace-pre-line font-medium">{message.content}</div>
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
          </CardContent>
        </Card>

        <div className="glass-ultra border-x border-white/20 border-t-0 rounded-none p-6 glow-subtle">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-premium">
              {language === "en" ? "Quick Legal Questions:" : "त्वरित कानूनी प्रश्न:"}
            </h3>
          </div>
        </div>

        <div className="glass-ultra rounded-b-3xl p-6 floating-element glow-strong border border-white/20">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === "en" ? "Ask about Indian law..." : "भारतीय कानून के बारे में पूछें..."}
                className="glass-strong border-white/20 pr-28 py-4 text-base font-medium glow-subtle focus:glow-medium transition-all duration-300"
                disabled={isLoading}
              />
              {listening && (
                <div className="absolute left-3 bottom-[-1.25rem] text-xs text-accent/80">
                  Listening... {interimTranscript}
                </div>
              )}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 glass glow-subtle hover:glow-medium transition-all"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (listening ? stopListening() : startListening())}
                  aria-pressed={listening}
                  title={sttSupported ? (listening ? "Stop voice input" : "Start voice input") : "Voice input not supported in this browser"}
                  className={`h-10 w-10 p-0 glass ${listening ? "bg-primary/20" : ""} glow-subtle hover:glow-medium transition-all`}
                >
                  <Mic className={`w-5 h-5 ${listening ? "animate-pulse text-primary" : ""}`} />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="floating-element px-6 py-4 glass-strong glow-medium hover:glow-strong transition-all duration-300 group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Shield className="w-4 h-4 text-accent" />
            <p className="text-xs text-muted-foreground text-center font-medium">
              {language === "en"
                ? "Nyay Sarthi provides general legal information based on Indian law. Consult a qualified lawyer for specific legal advice."
                : "न्याय सारथी भारतीय कानून के आधार पर सामान्य कानूनी जानकारी प्रदान करता है। विशिष्ट कानूनी सलाह के लिए एक योग्य वकील से सलाह लें।"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
