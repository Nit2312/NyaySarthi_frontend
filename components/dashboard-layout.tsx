"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Home, Settings, Bell, Crown, Menu, X, Scale, Upload, BookOpen, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

const sidebarItems = [
  {
    icon: Home,
    label: "Dashboard",
    labelHi: "डैशबोर्ड",
    href: "/dashboard",
    key: "dashboard",
  },
  {
    icon: MessageSquare,
    label: "Chat Assistant",
    labelHi: "चैट सहायक",
    href: "/dashboard/chat",
    key: "chat",
  },
  {
    icon: Upload,
    label: "Upload Document",
    labelHi: "दस्तावेज़ अपलोड करें",
    href: "/dashboard/upload",
    key: "upload",
  },
  {
    icon: Scale,
    label: "Precedent Finder",
    labelHi: "पूर्व उदाहरण खोजक",
    href: "/dashboard/precedent",
    key: "precedent",
  },
  {
    icon: BookOpen,
    label: "Legal Resources",
    labelHi: "कानूनी संसाधन",
    href: "/resources",
    key: "resources",
  },
]

export function DashboardLayout({ children, currentPage = "dashboard" }: DashboardLayoutProps) {
  const { t, language } = useLanguage()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen)
  }, [sidebarOpen])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed)
  }, [sidebarCollapsed])

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/15 to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl floating-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/[0.02] rounded-full blur-2xl floating-gentle" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/[0.015] rounded-full blur-xl floating-subtle" />

        <div
          className="absolute inset-0 opacity-[0.008]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="flex relative z-10">
        <aside
          className={`fixed inset-y-0 left-0 z-50 glass-ultra border-r border-white/20 transform transition-all duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static lg:inset-0 ${sidebarCollapsed ? 'w-20' : 'w-72'}`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                {!sidebarCollapsed && (
                  <Link href="/" className="flex items-center gap-3">
                    <img src="/images/scales-justice-india.png" alt="Nyay Sarthi" className="w-8 h-8 object-contain" />
                    <span className="text-xl font-bold text-premium text-glow">Nyay Sarthi</span>
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebarCollapse}
                    className="h-8 w-8 p-0 glass glow-subtle hover:glow-medium transition-all"
                  >
                    {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="lg:hidden h-8 w-8 p-0" onClick={closeSidebar}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 glow-medium">
                  <AvatarImage src="/images/indian-lawyer.png" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-premium truncate">{user?.name || "User"}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="glass-strong text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        {language === "en" ? "Premium" : "प्रीमियम"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex-1 p-3 space-y-2">
              {sidebarItems.map((item) => (
                <Link key={item.key} href={item.href}>
                  <Button
                    variant={currentPage === item.key ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 h-12 text-left font-medium transition-all duration-300 ${
                      currentPage === item.key
                        ? "glass-strong glow-medium text-premium"
                        : "hover:glass hover:glow-subtle"
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title={sidebarCollapsed ? (language === "en" ? item.label : item.labelHi) : undefined}
                  >
                    <item.icon className="w-5 h-5" />
                    {!sidebarCollapsed && (language === "en" ? item.label : item.labelHi)}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="p-3 border-t border-white/10 space-y-2">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 h-12 hover:glass hover:glow-subtle transition-all ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={sidebarCollapsed ? (language === "en" ? "Profile" : "प्रोफ़ाइल") : undefined}
              >
                <User className="w-5 h-5" />
                {!sidebarCollapsed && (language === "en" ? "Profile" : "प्रोफ़ाइल")}
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 h-12 hover:glass hover:glow-subtle transition-all ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={sidebarCollapsed ? (language === "en" ? "Settings" : "सेटिंग्स") : undefined}
              >
                <Settings className="w-5 h-5" />
                {!sidebarCollapsed && (language === "en" ? "Settings" : "सेटिंग्स")}
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={`w-full justify-start gap-3 h-12 hover:glass hover:glow-subtle transition-all text-red-400 hover:text-red-300 ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={sidebarCollapsed ? (language === "en" ? "Logout" : "लॉगआउट") : undefined}
              >
                <LogOut className="w-5 h-5" />
                {!sidebarCollapsed && (language === "en" ? "Logout" : "लॉगआउट")}
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex-1 lg:ml-0">
          <header className="glass-ultra border-b border-white/20 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden glass glow-subtle"
                  onClick={toggleSidebar}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold text-premium text-glow">
                  {language === "en"
                    ? sidebarItems.find((item) => item.key === currentPage)?.label || "Dashboard"
                    : sidebarItems.find((item) => item.key === currentPage)?.labelHi || "डैशबोर्ड"}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="glass glow-subtle hover:glow-medium transition-all">
                  <Bell className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="glass glow-subtle hover:glow-medium transition-all">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
      )}
    </div>
  )
}
