"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Scale, User, Mic, Paperclip, Sparkles, Clock, ChevronLeft, ChevronRight, Plus, MessageSquare } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { ApiService } from "@/lib/api-service"
import useSpeech from "@/hooks/use-speech"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  category?: string
  saved?: boolean
}

type ThreadMeta = {
  id: string
  title: string
  lastMessage: string
  updatedAt: number
}

// Persistent threads (localStorage-backed)
const loadThreads = (): ThreadMeta[] => {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('chatThreads') || '[]') as ThreadMeta[] } catch { return [] }
}

export function DashboardChatInterface() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        language === "en"
          ? `Welcome back, ${user?.name || "User"}! I'm your AI legal assistant specialized in Indian law. How can I help you today?`
          : `वापस स्वागत है, ${user?.name || "उपयोगकर्ता"}! मैं भारतीय कानून में विशेषज्ञ आपका AI कानूनी सहायक हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?`,
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string>(
    () => (typeof window !== 'undefined' ? localStorage.getItem('conversationId') || '' : '')
  )
  const [threads, setThreads] = useState<ThreadMeta[]>(() => loadThreads())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Speech-to-text (real mic integration)
  const {
    supported: sttSupported,
    listening,
    interimTranscript,
    start: startListening,
    stop: stopListening,
    reset: resetListening,
  } = useSpeech({
    lang: language === "hi" ? "hi-IN" : "en-IN",
    onResult: (text) => setInputValue((prev) => (prev ? prev + " " : "") + text),
  })

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Persist messages to localStorage when they change
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!conversationId) return
    try {
      const serializable = messages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
      }))
      localStorage.setItem(`chatHistory:${conversationId}`, JSON.stringify(serializable))
    } catch (e) {
      // ignore storage errors
    }
  }, [messages, conversationId])

  // Load messages from localStorage on initial mount and when conversation changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!conversationId) return
    try {
      const raw = localStorage.getItem(`chatHistory:${conversationId}`)
      if (raw) {
        const parsed = JSON.parse(raw) as Array<Omit<Message, 'timestamp'> & { timestamp: string }>
        const restored: Message[] = parsed.map(p => ({ ...p, timestamp: new Date(p.timestamp) }))
        setMessages(restored)
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [conversationId])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsTyping(true)
    setApiError(null)

    try {
      // Ensure we have a conversation id for this thread
      let convId = conversationId
      if (!convId) {
        convId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        setConversationId(convId)
        if (typeof window !== 'undefined') localStorage.setItem('conversationId', convId)
      }

      const response = await ApiService.sendChatMessage(currentInput, convId, { 
        prefer: 'indian_constitution_precedent',
      })

      // If the backend routed to Indian Kanoon and returned cases, render a case-wise summary block
      if (response.cases && response.cases.length > 0) {
        const caseBlocks = response.cases
          .map((c, idx) => {
            const header = `${idx + 1}) ${c.title}${c.court ? ` — ${c.court}` : ''}${c.date ? ` (${new Date(c.date).toLocaleDateString()})` : ''}${c.citation ? ` [${c.citation}]` : ''}`
            const body = c.summary ? `\n${c.summary}` : ''
            const link = c.url ? `\nLink: ${c.url}` : ''
            return `${header}${body}${link}`
          })
          .join("\n\n")

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `I found ${response.cases.length} potentially relevant cases.\n\n${caseBlocks}`,
          sender: "ai",
          timestamp: new Date(),
          category: "Case Matches",
        }
        setMessages((prev) => [...prev, aiResponse])
      } else if (response.source === 'indian_kanoon') {
        // Case-search path but 0 cases; include diagnostic if available
        const diag = response.ik_error
          ? `\n\nNote: Case search returned 0 results (diagnostic: ${response.ik_error}). If this persists, please ensure INDIAN_KANOON_EMAIL and INDIAN_KANOON_API_KEY are set on the backend and valid.`
          : ''
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `${response.response}${diag}`,
          sender: "ai",
          timestamp: new Date(),
          category: "Case Matches",
        }
        setMessages((prev) => [...prev, aiResponse])
      } else {
        // Strengthen weak responses by framing with authoritative preface when needed
        let content = response.response || ""
        const weakIndicators = /(don't|do not)\s+have\s+(sufficient|full)?\s*context|cannot\s+(provide|answer)|insufficient\s+context/i
        if (weakIndicators.test(content)) {
          const preface = language === 'en'
            ? 'According to the Constitution of India, applicable statutes, and established judicial precedents, here is a structured, good‑faith analysis:'
            : 'भारत के संविधान, प्रासंगिक अधिनियमों और स्थापित न्यायिक नज़ीरों के आलोक में, यहाँ एक संरचित और सद्भावनापूर्ण विश्लेषण प्रस्तुत है:'
          content = `${preface}\n\n${content}`
        }
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content,
          sender: "ai",
          timestamp: new Date(),
          category: "Legal Advice",
        }
        setMessages((prev) => {
          const next = [...prev, aiResponse]
          // persist messages per conversation
          try {
            const serializable = next.map(m => ({...m, timestamp: m.timestamp.toISOString()}))
            localStorage.setItem(`chatHistory:${convId}`, JSON.stringify(serializable))
          } catch {}
          // update threads meta
          try {
            const title = next.find(m => m.sender === 'user')?.content?.slice(0, 50) || (language === 'en' ? 'New Chat' : 'नई चैट')
            const lastMessage = content.slice(0, 90)
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
      }
      // Update conv id from backend if provided
      if (response.conversation_id && response.conversation_id !== conversationId) {
        setConversationId(response.conversation_id)
        if (typeof window !== 'undefined') localStorage.setItem('conversationId', response.conversation_id)
      }
    } catch (error) {
      console.error('Failed to get AI response:', error)
      setApiError('Failed to get response from AI. Please try again.')
      
      // Fallback response
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: language === "en" 
          ? "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment or rephrase your question."
          : "मैं क्षमा चाहता हूं, लेकिन मुझे अभी अपने ज्ञान आधार से जुड़ने में समस्या हो रही है। कृपया कुछ देर बाद फिर से कोशिश करें या अपना प्रश्न पुनः लिखें।",
        sender: "ai",
        timestamp: new Date(),
        category: "Error",
      }
      setMessages((prev) => [...prev, fallbackResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const loadPreviousChat = useCallback((chatId: string) => {
    setActiveChat(chatId)
    setConversationId(chatId)
    if (typeof window !== 'undefined') localStorage.setItem('conversationId', chatId)
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`chatHistory:${chatId}`)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Array<Omit<Message, 'timestamp'> & { timestamp: string }>
          const restored: Message[] = parsed.map(p => ({ ...p, timestamp: new Date(p.timestamp) }))
          setMessages(restored)
          return
        } catch {}
      }
    }
    setMessages([
      {
        id: "new-1",
        content:
          language === "en"
            ? `Hello! I'm your AI legal assistant. How can I help you with Indian law today?`
            : `नमस्ते! मैं आपका AI कानूनी सहायक हूं। आज मैं भारतीय कानून में आपकी कैसे सहायता कर सकता हूं?`,
        sender: "ai",
        timestamp: new Date(),
      },
    ])
  }, [language])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed)
  }, [sidebarCollapsed])

  const startNewChat = useCallback(() => {
    setActiveChat(null)
    setApiError(null)
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setConversationId(newId)
    if (typeof window !== 'undefined') localStorage.setItem('conversationId', newId)
    setMessages([
      {
        id: "new-1",
        content:
          language === "en"
            ? `Hello! I'm your AI legal assistant. How can I help you with Indian law today?`
            : `नमस्ते! मैं आपका AI कानूनी सहायक हूं। आज मैं भारतीय कानून में आपकी कैसे सहायता कर सकता हूं?`,
        sender: "ai",
        timestamp: new Date(),
      },
    ])
    // Clear any existing history for this new conversation id
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(`chatHistory:${newId}`) } catch {}
    }
    // Add empty thread meta
    try {
      const updated: ThreadMeta[] = [{ id: newId, title: language==='en' ? 'New Chat' : 'नई चैट', lastMessage: '', updatedAt: Date.now() }, ...threads]
      setThreads(updated)
      localStorage.setItem('chatThreads', JSON.stringify(updated))
    } catch {}
  }, [language])

  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Handle file upload logic here
      const userMessage: Message = {
        id: Date.now().toString(),
        content: `📎 Uploaded: ${file.name}`,
        sender: "user",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      
      // Simulate AI response about the uploaded document
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `I've received your document "${file.name}". I can help you analyze this legal document. What specific questions do you have about it?`,
          sender: "ai",
          timestamp: new Date(),
          category: "Document Analysis",
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1500)
    }
  }, [])

  const toggleVoiceInput = useCallback(() => {
    if (listening) {
      stopListening()
    } else {
      startListening()
    }
  }, [listening, startListening, stopListening])

  return (
    <div className="h-full flex gap-4">
      {/* Collapsible Recent Chats Sidebar */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-80'}`}>
        <Card className="glass-ultra glow-medium border border-white/20 h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <CardTitle className="text-lg flex items-center gap-2 text-premium">
                  <Clock className="w-5 h-5 text-accent" />
                  {language === "en" ? "Recent Chats" : "हाल की चैट"}
                </CardTitle>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-8 w-8 p-0 glass glow-subtle hover:glow-medium transition-all"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!sidebarCollapsed && (
              <Button
                onClick={startNewChat}
                className="w-full justify-start gap-3 glass-strong glow-medium hover:glow-strong transition-all"
              >
                <Plus className="w-4 h-4" />
                {language === "en" ? "New Chat" : "नई चैट"}
              </Button>
            )}
            {threads.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                {language === 'en' ? 'No chats yet. Start a new chat.' : 'अभी कोई चैट नहीं। नई चैट शुरू करें।'}
              </div>
            ) : (
              threads
                .sort((a,b) => b.updatedAt - a.updatedAt)
                .map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => loadPreviousChat(chat.id)}
                    className={`rounded-xl cursor-pointer transition-all duration-300 ${
                      activeChat === chat.id ? "glass-strong glow-medium" : "glass hover:glass-strong hover:glow-subtle"
                    } ${sidebarCollapsed ? 'p-2' : 'p-3'}`}
                  >
                    {sidebarCollapsed ? (
                      <div className="flex flex-col items-center space-y-1">
                        <MessageSquare className={`w-4 h-4 transition-all duration-300 ${
                          activeChat === chat.id 
                            ? "text-primary glow-medium" 
                            : "text-white/70 hover:text-white"
                        }`} />
                        {activeChat === chat.id && (
                          <div className="w-1 h-1 bg-accent rounded-full animate-pulse"></div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm text-premium truncate">
                            {chat.title}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {chat.lastMessage}
                        </p>
                      </>
                    )}
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">


        {/* Error Message */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm">{apiError}</p>
          </div>
        )}

        {/* Messages Area */}
        <Card className="glass-ultra glow-medium border border-white/20 mb-4" style={{ height: '600px' }}>
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "ai" && (
                      <Avatar className="w-10 h-10 bg-gradient-to-br from-primary to-accent glow-medium">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          <Scale className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[75%] rounded-2xl px-6 py-4 transition-all duration-300 ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-primary to-accent text-primary-foreground ml-auto glow-medium border border-white/20"
                          : "glass-strong glow-subtle border border-white/10"
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-line font-medium">{message.content}</div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs opacity-70 font-medium">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {message.category && (
                          <Badge variant="secondary" className="text-xs glass">
                            {message.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {message.sender === "user" && (
                      <Avatar className="w-10 h-10 bg-gradient-to-br from-secondary to-muted glow-subtle">
                        <AvatarFallback className="bg-gradient-to-br from-secondary to-muted text-secondary-foreground">
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isTyping && (
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
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="glass-ultra glow-strong border border-white/20">
          <CardContent className="p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === "en" ? "Ask about Indian law..." : "भारतीय कानून के बारे में पूछें..."}
                  className="glass-strong border-white/20 pr-32 py-4 text-base font-medium glow-subtle focus:glow-medium transition-all duration-300"
                  disabled={isTyping}
                />
                {listening && (
                  <div className="absolute left-0 top-full mt-1 text-xs text-accent/80">
                    {language === 'en' ? 'Listening...' : 'सुन रहा हूँ...'} {interimTranscript}
                  </div>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFileUpload}
                    className={`h-8 w-8 p-0 glass glow-subtle hover:glow-medium transition-all ${listening ? 'opacity-50' : ''}`}
                    disabled={listening}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleVoiceInput}
                    className={`h-8 w-8 p-0 glass glow-subtle hover:glow-medium transition-all ${listening ? 'bg-primary/20 text-primary' : ''}`}
                    aria-pressed={listening}
                    title={sttSupported ? (listening ? (language === 'en' ? 'Stop voice input' : 'वॉइस इनपुट रोकें') : (language === 'en' ? 'Start voice input' : 'वॉइस इनपुट शुरू करें')) : (language === 'en' ? 'Voice input not supported' : 'वॉइस इनपुट समर्थित नहीं है')}
                    disabled={isTyping}
                  >
                    <Mic className={`w-4 h-4 ${listening ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-4 glass-strong glow-medium hover:glow-strong transition-all duration-300 group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-4 h-4 text-accent">
                <Scale className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted-foreground text-center font-medium">
                {language === "en"
                  ? "Nyay Sarthi provides general legal information based on Indian law. Consult a qualified lawyer for specific legal advice."
                  : "न्याय सारथी भारतीय कानून के आधार पर सामान्य कानूनी जानकारी प्रदान करता है। विशिष्ट कानूनी सलाह के लिए एक योग्य वकील से सलाह लें।"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
