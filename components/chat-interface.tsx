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
import { ApiService } from "@/lib/api-service"
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

type ThreadMeta = {
  id: string
  title: string
  lastMessage: string
  updatedAt: number
}



export function ChatInterface() {
  const { t, language } = useLanguage()
  const { isLoading, withLoading } = useLoading()
  
  // Prevent scrolling on mount (page-level)
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
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
  const [conversationId, setConversationId] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('conversationId') || '' : ''))
  const [threads, setThreads] = useState<ThreadMeta[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('chatThreads') || '[]') as ThreadMeta[] } catch { return [] }
  })

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
        // Heuristic prefer hint for backend
        const q = currentInput.toLowerCase()
        const prefer = /\b(article|अनुच्छेद)\b/.test(q)
          ? 'constitution'
          : /(\bv\.?s?\.?\b| vs |citation|holding|ratio|judgment)/i.test(currentInput)
          ? 'cases'
          : undefined

        // Ensure conversation id
        let convId = conversationId
        if (!convId) {
          convId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
          setConversationId(convId)
          if (typeof window !== 'undefined') localStorage.setItem('conversationId', convId)
        }

        const resp = await ApiService.sendAgenticMessage(currentInput, convId, prefer ? { prefer } : undefined)
        const content = resp.response || ""
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => {
          const next = [...prev, aiResponse]
          // persist messages per conversation
          try {
            const serializable = next.map(m => ({...m, timestamp: m.timestamp.toISOString()}))
            localStorage.setItem(`chatHistory:${convId}`, JSON.stringify(serializable))
          } catch {}
          // update thread meta
          try {
            const title = next.find(m => m.sender === 'user')?.content?.slice(0, 50) || 'New Chat'
            const lastMessage = aiResponse.content.slice(0, 90)
            const updatedAt = Date.now()
            const existing = threads.find(t => t.id === convId)
            let updated: ThreadMeta[]
            if (existing) {
              updated = threads.map(t => t.id === convId ? {...t, title, lastMessage, updatedAt} : t)
            } else {
              updated = [{ id: convId, title, lastMessage, updatedAt }, ...threads]
            }
            setThreads(updated)
            localStorage.setItem('chatThreads', JSON.stringify(updated))
          } catch {}
          return next
        })
      } catch (err) {
        setError("Failed to get response. Please try again.")
        console.error("Chat error:", err)
      }
    })
  }, [inputValue, isLoading, language, withLoading, conversationId, threads])

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
    <div className="fixed inset-0 w-full overflow-hidden bg-background">
      <div className="h-full w-full overflow-hidden flex justify-center items-start">
        <div className="h-full w-full max-w-[1600px] grid grid-cols-1 7md:grid-cols-[280px_1fr] transform origin-top scale-[0.2] md:scale-[0.2] lg:scale-[0.2] xl:scale-50">
        {/* Sidebar (md+) */}
        <aside className="hidden md:flex flex-col border-r bg-muted/20">
          <div className="p-3 border-b sticky top-0 bg-muted/30 backdrop-blur">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              <span className="font-semibold">{language === 'en' ? 'Recent Chats' : 'हाल की चैट'}</span>
            </div>
            <Button
              onClick={() => {
                // start new conversation
                const newId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
                setConversationId(newId)
                localStorage.setItem('conversationId', newId)
                setMessages([
                  { id: '1', content: t('chat.greeting'), sender: 'ai', timestamp: new Date() },
                ])
                try { localStorage.removeItem(`chatHistory:${newId}`) } catch {}
              }}
              className="w-full mt-3" size="sm">
              + {language === 'en' ? 'New Chat' : 'नई चैट'}
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {threads.length === 0 ? (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>{language === 'en' ? 'No chats yet.' : 'अभी कोई चैट नहीं।'}</p>
                <p>{language === 'en' ? 'Start a new chat to see it here.' : 'नई चैट शुरू करें।'}</p>
              </div>
            ) : (
              threads
                .sort((a,b) => b.updatedAt - a.updatedAt)
                .map(th => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setConversationId(th.id)
                      localStorage.setItem('conversationId', th.id)
                      try {
                        const raw = localStorage.getItem(`chatHistory:${th.id}`)
                        if (raw) {
                          const parsed = JSON.parse(raw) as Array<Omit<Message,'timestamp'> & {timestamp: string}>
                          const restored: Message[] = parsed.map(p => ({...p, timestamp: new Date(p.timestamp)}))
                          setMessages(restored)
                        } else {
                          setMessages([{ id: '1', content: t('chat.greeting'), sender: 'ai', timestamp: new Date() }])
                        }
                      } catch {
                        setMessages([{ id: '1', content: t('chat.greeting'), sender: 'ai', timestamp: new Date() }])
                      }
                    }}
                    className="w-full text-left rounded-lg p-3 hover:bg-muted/50 transition border">
                    <div className="font-medium truncate">{th.title || (language==='en'?'New Chat':'नई चैट')}</div>
                    <div className="text-xs text-muted-foreground truncate">{th.lastMessage}</div>
                  </button>
                ))
            )}
          </div>
        </aside>

        {/* Main chat column */}
        <section className="flex flex-col h-full">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="icon" aria-label="Back">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <span className="font-semibold">{language === 'en' ? 'Chat Assistant' : 'चैट सहायक'}</span>
              </div>
              <div className="text-xs text-muted-foreground">{language === 'en' ? 'Grounded in Constitution + Cases' : 'संविधान + नज़ीर आधारित'}</div>
            </div>
          </header>

          {/* Messages */}
          <main className="flex-1 min-h-0">
            <div className="h-full max-w-3xl mx-auto px-4">
              <ChatMessagesArea messages={messages} isLoading={isLoading} error={error} className="pt-4" />
            </div>
          </main>

          {/* Input */}
          <footer className="border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="relative flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === 'en' ? 'Ask about Indian law…' : 'भारतीय कानून के बारे में पूछें…'}
                  className="pr-28 py-3 text-base"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Attach">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (listening ? stopListening() : startListening())}
                    aria-pressed={listening}
                    aria-label="Voice input"
                    className={`h-9 w-9 ${listening ? 'bg-primary/10' : ''}`}
                    title={sttSupported ? (listening ? 'Stop voice input' : 'Start voice input') : 'Voice input not supported'}
                  >
                    <Mic className={`w-4 h-4 ${listening ? 'animate-pulse text-primary' : ''}`} />
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} className="h-9 w-9 p-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">
                {language === 'en'
                  ? 'Nyay Sarthi provides general legal information. Consult a qualified lawyer for specific advice.'
                  : 'न्याय सारथी सामान्य कानूनी जानकारी प्रदान करता है। विशिष्ट सलाह के लिए योग्य वकील से परामर्श करें.'}
              </p>
            </div>
          </footer>
        </section>
        </div>
      </div>
    </div>
  )
}
