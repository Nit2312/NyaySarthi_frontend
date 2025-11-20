"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Scale, User, Mic, Paperclip, Sparkles, Clock, ChevronLeft, ChevronRight, Plus, MessageSquare, Pencil, Trash, Download } from "lucide-react"
import { upsertConversation, appendMessage, getMessages, listActiveConversations, deleteConversation } from "@/lib/chat-repo"
import { downloadChatPDF } from "@/lib/export-pdf"
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

type ThreadMeta = { id: string; title: string; lastMessage: string; updatedAt: number }

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
  const [mobileThreadsOpen, setMobileThreadsOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string>(
    () => (typeof window !== 'undefined' ? localStorage.getItem('conversationId') || '' : '')
  )
  const [threads, setThreads] = useState<ThreadMeta[]>([])
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

  // Prevent auto-scroll on first render
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      return
    }
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load threads from Supabase
  const refreshThreads = useCallback(async () => {
    try {
      if (!user?.id) return
      const rows = await listActiveConversations(user.id, 100)
      const mapped: ThreadMeta[] = (rows as any[]).map((r) => ({
        id: r.id,
        title: r.title,
        lastMessage: "",
        updatedAt: r.updated_at ? Date.parse(r.updated_at) : Date.now(),
      }))
      setThreads(mapped)
    } catch {}
  }, [])

  useEffect(() => { refreshThreads() }, [refreshThreads])

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
      if (!convId || convId.length !== 36) {
        // Create a Supabase conversation with first message as title (trim)
        const title = currentInput.slice(0, 50)
        try {
          convId = await upsertConversation(title, undefined, user?.id)
          setConversationId(convId)
          if (typeof window !== 'undefined') localStorage.setItem('conversationId', convId)
        } catch {}
      } else {
        // Touch title if still generic
        try { await upsertConversation(currentInput.slice(0,50), convId, user?.id) } catch {}
      }

      // Persist user message
      try { if (convId && user?.id) await appendMessage(convId, 'user', currentInput, user.id) } catch {}

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
        // Persist AI message
        try { if (convId && user?.id) await appendMessage(convId, 'ai', aiResponse.content, user.id) } catch {}
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
        // Persist AI message
        try { if (convId && user?.id) await appendMessage(convId, 'ai', content, user.id) } catch {}
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

  const loadPreviousChat = useCallback(async (chatId: string) => {
    setActiveChat(chatId)
    setConversationId(chatId)
    if (typeof window !== 'undefined') localStorage.setItem('conversationId', chatId)
    try {
      if (!user?.id) return
      const rows = await getMessages(chatId, user.id)
      const restored: Message[] = rows.map(r => ({ id: r.id, content: r.content, sender: r.role as any, timestamp: new Date(r.created_at) }))
      setMessages(restored.length ? restored : [{
        id: 'new-1',
        content: language === 'en' ? `Hello! I'm your AI legal assistant. How can I help you with Indian law today?` : `नमस्ते! मैं आपका AI कानूनी सहायक हूं। आज मैं भारतीय कानून में आपकी कैसे सहायता कर सकता हूं?`,
        sender: 'ai', timestamp: new Date()
      }])
    } catch {
      setMessages([{ id: 'new-1', content: language==='en'?`Hello! I'm your AI legal assistant. How can I help you with Indian law today?`:`नमस्ते! मैं आपका AI कानूनी सहायक हूं। आज मैं भारतीय कानून में आपकी कैसे सहायता कर सकता हूं?`, sender: 'ai', timestamp: new Date() }])
    }
  }, [language, user?.id])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed)
  }, [sidebarCollapsed])

  const startNewChat = useCallback(async () => {
    setActiveChat(null)
    setApiError(null)
    let newId = ''
    try {
      newId = await upsertConversation(language==='en' ? 'New Chat' : 'नई चैट', undefined, user?.id)
    } catch {
      newId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    }
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
    // Refresh thread list from Supabase
    refreshThreads()
  }, [language, refreshThreads, user?.id])

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

  // Download PDF handler
  const handleDownloadPDF = useCallback(async () => {
    if (!conversationId) return
    try {
      if (!user?.id) return
      const msgs = await getMessages(conversationId, user.id)
      const title = threads.find(t => t.id === conversationId)?.title || 'Chat'
      const pdfMsgs = (msgs as any[]).map(m => ({ role: m.role as 'user' | 'ai', content: m.content, created_at: m.created_at }))
      downloadChatPDF(title, pdfMsgs)
    } catch {}
  }, [conversationId, threads, user?.id])

  return (
    <div className="flex flex-col md:h-[calc(100vh-120px)] gap-3 md:gap-4">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between gap-2 px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileThreadsOpen(true)}
          className="glass rounded-full px-3"
          aria-controls="mobile-threads-panel"
          aria-expanded={mobileThreadsOpen}
          aria-label="Open chat threads"
        >
          <MessageSquare className="w-4 h-4 mr-2" /> Threads
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleDownloadPDF} className="glass rounded-full h-9 w-9 p-0">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="md:flex md:flex-row md:gap-4">
        {/* Collapsible Recent Chats Sidebar (hidden on mobile, shown via overlay) */}
        <div className={`hidden md:flex transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-14' : 'w-64'} flex-col`}>
          <Card className="glass-ultra border border-white/10 h-full flex flex-col shadow-2xl">
          <CardHeader className="pb-3 pt-4 px-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-white/90">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  {language === "en" ? "Recent Chats" : "हाल की चैट"}
                </CardTitle>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-7 w-7 p-0 hover:bg-white/10 transition-all"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-2">
            {!sidebarCollapsed && (
              <Button
                onClick={startNewChat}
                className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-white transition-all py-2.5 text-sm font-medium mb-2"
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
                    className={`rounded-lg cursor-pointer transition-all duration-200 ${
                      activeChat === chat.id 
                        ? "bg-white/10 border-l-2 border-primary shadow-lg" 
                        : "bg-white/[0.02] hover:bg-white/5 border-l-2 border-transparent"
                    } ${sidebarCollapsed ? 'p-2' : 'p-3'}`}
                  >
                    {sidebarCollapsed ? (
                      <div className="flex flex-col items-center space-y-1">
                        <MessageSquare className={`w-4 h-4 transition-all duration-200 ${
                          activeChat === chat.id 
                            ? "text-primary" 
                            : "text-white/50 hover:text-white/80"
                        }`} />
                        {activeChat === chat.id && (
                          <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-1.5">
                          <h4 className="font-medium text-sm text-white/90 truncate pr-2">
                            {(chat as any).title || (language==='en'?'Untitled':'शीर्षक रहित')}
                          </h4>
                          <div className="flex gap-1 opacity-70 hover:opacity-100" onClick={(e)=>e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={async ()=>{
                                const next = prompt(language==='en'?'Rename chat':'चैट का नाम बदलें', (chat as any).title || '')
                                if (next && next.trim()) { try { await upsertConversation(next.trim(), chat.id, user?.id); refreshThreads(); } catch {} }
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5"/>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={async ()=>{
                                if (confirm(language==='en'?'Delete this chat?':'इस चैट को हटाएँ?')) {
                                  // Optimistic UI update first
                                  let prevThreads: ThreadMeta[] = []
                                  setThreads(prev => {
                                    prevThreads = prev
                                    const next = prev.filter(t => t.id !== chat.id)
                                    try { localStorage.setItem('chatThreads', JSON.stringify(next)) } catch {}
                                    return next
                                  })
                                  if (activeChat === chat.id) setActiveChat(null)
                                  // Clear local cache for this conversation
                                  try { localStorage.removeItem(`chatHistory:${chat.id}`) } catch {}
                                  // Reset if currently open
                                  if (conversationId === chat.id) {
                                    setConversationId('')
                                    try { localStorage.removeItem('conversationId') } catch {}
                                    setMessages([{ id: 'new-1', content: language==='en'?`Hello! I'm your AI legal assistant. How can I help you with Indian law today?`:`नमस्ते! मैं आपका AI कानूनी सहायक हूं। आज मैं भारतीय कानून में आपकी कैसे सहायता कर सकता हूं?`, sender:'ai', timestamp: new Date()}])
                                  }
                                  try {
                                    if (user?.id) await deleteConversation(chat.id, user.id)
                                    // Sync with server (in case other changes)
                                    await refreshThreads()
                                  } catch (e) {
                                    // Rollback UI if server delete failed
                                    if (prevThreads.length) setThreads(prevThreads)
                                    alert(language==='en'? 'Failed to delete chat. Please try again.' : 'चैट हटाने में विफल। कृपया पुनः प्रयास करें।')
                                  }
                                }
                              }}
                            >
                              <Trash className="w-3.5 h-3.5"/>
                            </Button>
                          </div>
                        </div>
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
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-200 text-sm">{apiError}</p>
          </div>
        )}

        {/* Messages + Input (single block like ChatGPT) */}
        <Card className="glass-ultra/50 border border-white/5 flex-1 min-h-[60vh] md:min-h-0 shadow-none">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Scrollable messages area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-3 pt-2 pb-3 max-h-[calc(100vh-280px)] md:max-h-none">
              <div className="space-y-1.5">
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
                      className={`max-w-[92%] md:max-w-[82%] rounded-2xl px-3.5 py-2 transition-colors ${
                        message.sender === "user"
                          ? "bg-white text-neutral-900 ml-auto border border-white/40"
                          : "bg-white/[0.06] text-white/95 border border-white/10"
                      }`}
                    >
                      <div className={`text-[14px] sm:text-[15px] leading-7 whitespace-pre-wrap break-words ${message.sender === 'user' ? 'text-neutral-900' : 'text-white/95'}`}>{message.content}</div>
                      <div className="flex items-center justify-between mt-1 gap-3">
                        <p className={`text-[11px] leading-none ${message.sender === 'user' ? 'text-neutral-600' : 'text-white/50'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {message.category && (
                          <Badge variant="secondary" className="text-[10px] bg-white/10 text-white/70 border-0 px-2 py-0">
                            {message.category}
                          </Badge>
                        )}
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

                {isTyping && (
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
              </div>
              <div ref={messagesEndRef} />
            </div>
            {/* Docked input footer inside the same card */}
            <div className="border-t border-white/5 px-2 py-2 bg-transparent">
              <div className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={language === "en" ? "Ask about Indian law..." : "भारतीय कानून के बारे में पूछें..."}
                      className="bg-white/[0.06] border-white/10 pr-28 pl-3 py-3 text-[15px] placeholder:text-white/40 focus:bg-white/[0.08] focus:border-primary/40 transition-all rounded-full"
                      disabled={isTyping}
                    />
                    {listening && (
                      <div className="absolute left-0 top-full mt-1 text-xs text-primary/80">
                        {language === 'en' ? 'Listening...' : 'सुन रहा हूँ...'} {interimTranscript}
                      </div>
                    )}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadPDF}
                      className="h-9 w-9 p-0 hover:bg-white/10 transition-all rounded-full"
                      title={language==='en' ? 'Download chat as PDF' : 'चैट को PDF में डाउनलोड करें'}
                      aria-label={language==='en' ? 'Download' : 'डाउनलोड'}
                    >
                      <Download className="w-4 h-4 text-white/60" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                        onClick={handleFileUpload}
                        className={`h-9 w-9 p-0 hover:bg-white/10 transition-all rounded-full ${listening ? 'opacity-50' : ''}`}
                        disabled={listening}
                      >
                        <Paperclip className="w-4 h-4 text-white/60" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleVoiceInput}
                        className={`h-9 w-9 p-0 hover:bg-white/10 transition-all rounded-full ${listening ? 'bg-primary/20 text-primary' : ''}`}
                        aria-pressed={listening}
                        title={sttSupported ? (listening ? (language === 'en' ? 'Stop voice input' : 'वॉइस इनपुट रोकें') : (language === 'en' ? 'Start voice input' : 'வॉइस इनपुट शुरू करें')) : (language === 'en' ? 'Voice input not supported' : 'वॉइस इनपुट समर्थित नहीं है')}
                        disabled={isTyping}
                      >
                        <Mic className={`w-4 h-4 ${listening ? 'animate-pulse text-primary' : 'text-white/60'}`} />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="h-11 w-11 bg-primary hover:bg-primary/90 transition-all rounded-full group shadow-md flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 -translate-x-[1px] group-hover:translate-x-0 transition-transform" />
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

                {/* disclaimer removed as requested */}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Close md:flex wrapper */}
      </div>

      {/* Mobile Threads Overlay */}
      {mobileThreadsOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="mobile-threads-title" id="mobile-threads-panel">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileThreadsOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 top-16 bg-background border-t border-white/10 rounded-t-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 id="mobile-threads-title" className="text-lg font-semibold">Threads</h3>
              <Button variant="ghost" size="sm" onClick={() => setMobileThreadsOpen(false)} aria-label="Close threads">✕</Button>
            </div>
            {/* Reuse the threads list */}
            <div className="space-y-2">
              <Button
                onClick={() => { startNewChat(); setMobileThreadsOpen(false) }}
                className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-white transition-all py-2.5 text-sm font-medium mb-2"
              >
                <Plus className="w-4 h-4" />
                {language === "en" ? "New Chat" : "नई चैट"}
              </Button>
              {threads.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {language === 'en' ? 'No chats yet. Start a new chat.' : 'अभी कोई चैट नहीं। नई चैट शुरू करें।'}
                </div>
              ) : (
                threads
                  .sort((a,b) => b.updatedAt - a.updatedAt)
                  .map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => { loadPreviousChat(chat.id); setMobileThreadsOpen(false) }}
                      className={`rounded-lg cursor-pointer transition-all duration-200 p-3 ${
                        activeChat === chat.id 
                          ? "bg-white/10 border-l-2 border-primary shadow-lg" 
                          : "bg-white/[0.02] hover:bg-white/5 border-l-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <h4 className="font-medium text-sm text-white/90 truncate pr-2">{(chat as any).title || (language==='en'?'Untitled':'शीर्षक रहित')}</h4>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
