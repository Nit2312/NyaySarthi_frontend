"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { LanguageToggle } from "@/components/language-toggle"
import { ProtectedRoute } from "@/components/protected-route"
import { useUserData } from "@/lib/user-data-service"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Upload, Scale, Clock, TrendingUp, FileText, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { listActiveConversations } from "@/lib/chat-repo"

function DashboardContent() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const { chatSessions, documents, searchHistory, activities } = useUserData()

  // Dynamic totals
  const [chatCount, setChatCount] = useState<number>(0)
  const [docCount, setDocCount] = useState<number>(0)
  const [precCount, setPrecCount] = useState<number>(0)

  // Fetch chat count from DB for current user
  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return
        const rows = await listActiveConversations(user.id, 1000)
        setChatCount((rows as any[]).length || 0)
      } catch {
        setChatCount(0)
      }
    })()
  }, [user?.id])

  // Read session/local counters for Documents and Precedent Searches
  useEffect(() => {
    if (typeof window === 'undefined') return
    const keyDocs = `stats:${user?.id || 'anon'}:docs`
    const keyPrec = `stats:${user?.id || 'anon'}:precedent`
    const sync = () => {
      try {
        setDocCount(Number(localStorage.getItem(keyDocs) || '0'))
        setPrecCount(Number(localStorage.getItem(keyPrec) || '0'))
      } catch {
        setDocCount(0); setPrecCount(0)
      }
    }
    sync()
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return
      if (e.key === keyDocs || e.key === keyPrec) sync()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [user?.id])

  const totalActivities = useMemo(() => chatCount + docCount + precCount, [chatCount, docCount, precCount])

  const recentActivities = (activities || []).slice(0, 5)
  const recentChats = (chatSessions || []).slice(0, 3)
  const recentDocuments = (documents || []).filter((doc) => doc.status === "completed").slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-premium rounded-3xl p-8 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-premium glow-text mb-2">
              {language === "en" ? `Welcome back, ${user?.name}!` : `वापसी पर स्वागत है, ${user?.name}!`}
            </h2>
            <p className="text-white/70 text-lg">
              {language === "en"
                ? "Here's your legal assistance dashboard overview"
                : "यहाँ आपका कानूनी सहायता डैशबोर्ड अवलोकन है"}
            </p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="glass-strong text-sm px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {user?.role === "lawyer"
                ? language === "en"
                  ? "Lawyer"
                  : "वकील"
                : user?.role === "judge"
                  ? language === "en"
                    ? "Judge"
                    : "न्यायाधीश"
                  : language === "en"
                    ? "Citizen"
                    : "नागरिक"}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-subtle rounded-2xl p-6 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-white glow-subtle" />
            <div className="text-2xl font-bold text-premium glow-text">{chatCount}</div>
            <div className="text-white/70 text-sm">{language === "en" ? "Chat Sessions" : "चैट सत्र"}</div>
          </div>
          <div className="glass-subtle rounded-2xl p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-3 text-white glow-subtle" />
            <div className="text-2xl font-bold text-premium glow-text">{docCount}</div>
            <div className="text-white/70 text-sm">{language === "en" ? "Documents" : "दस्तावेज़"}</div>
          </div>
          <div className="glass-subtle rounded-2xl p-6 text-center">
            <Scale className="w-8 h-8 mx-auto mb-3 text-white glow-subtle" />
            <div className="text-2xl font-bold text-premium glow-text">{precCount}</div>
            <div className="text-white/70 text-sm">{language === "en" ? "Precedent Searches" : "पूर्व उदाहरण खोज"}</div>
          </div>
          <div className="glass-subtle rounded-2xl p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-white glow-subtle" />
            <div className="text-2xl font-bold text-premium glow-text">{totalActivities}</div>
            <div className="text-white/70 text-sm">{language === "en" ? "Total Activities" : "कुल गतिविधियाँ"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <Card className="glass-premium border-white/10">
          <CardHeader>
            <CardTitle className="text-premium glow-text flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {language === "en" ? "Recent Activities" : "हाल की गतिविधियाँ"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 glass-subtle rounded-xl">
                <div className="w-2 h-2 bg-white rounded-full glow-subtle" />
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.description}</p>
                  <p className="text-white/60 text-sm">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ''}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Chats */}
        <Card className="glass-premium border-white/10">
          <CardHeader>
            <CardTitle className="text-premium glow-text flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {language === "en" ? "Recent Chats" : "हाल की चैट"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentChats.map((chat, index) => (
              <div key={index} className="p-3 glass-subtle rounded-xl">
                <p className="text-white font-medium truncate">{chat.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {chat.messages.length} {language === "en" ? "messages" : "संदेश"}
                  </Badge>
                  <span className="text-white/60 text-sm">{chat.createdAt ? new Date(chat.createdAt).toLocaleString() : ''}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card className="glass-premium border-white/10">
        <CardHeader>
          <CardTitle className="text-premium glow-text flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {language === "en" ? "Recent Documents" : "हाल के दस्तावेज़"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDocuments.map((doc, index) => (
              <div key={index} className="p-4 glass-subtle rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-white/70" />
                  <span className="text-white font-medium truncate">{doc.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {doc.type.toUpperCase()}
                  </Badge>
                  <span className="text-white/60 text-sm">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="dashboard">
        <LanguageToggle />
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
