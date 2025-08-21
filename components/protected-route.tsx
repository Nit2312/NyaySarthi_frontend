"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Scale, Lock, ArrowRight } from "lucide-react"
import { useState } from "react"
import { ClientOnly } from "./client-only"
import { Loading } from "./ui/loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

function ProtectedRouteContent({ children, fallback }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const { t } = useLanguage()
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
    isOpen: false,
    mode: "login",
  })

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthModal({ isOpen: true, mode })
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: "login" })
  }

  const switchAuthMode = () => {
    setAuthModal((prev) => ({ ...prev, mode: prev.mode === "login" ? "signup" : "login" }))
  }

  // Show loading state while checking authentication - make it faster
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="glass-premium rounded-3xl p-8 text-center space-y-4 glow-strong">
          <Loading size="md" text="Checking authentication status" />
        </div>
      </div>
    )
  }

  // Show authentication required screen if user is not logged in
  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
          <div className="max-w-md w-full">
            <div className="glass-premium rounded-3xl p-8 text-center space-y-6 glow-strong border border-white/10">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full glass-subtle flex items-center justify-center glow-medium">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-premium text-glow">Authentication Required</h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Please sign in to access this premium feature of Nyay Sarthi. Join thousands of legal professionals
                    already using our platform.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full premium-button text-lg py-3 group"
                  onClick={() => openAuthModal("login")}
                >
                  <Scale className="mr-3 w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Sign In to Continue
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full glass-ultra bg-transparent border-white/20 hover:border-white/40 text-lg py-3"
                  onClick={() => openAuthModal("signup")}
                >
                  Create New Account
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => (window.location.href = "/")}
                >
                  ← Back to Home
                </Button>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Secure Login</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={authModal.isOpen}
          onClose={closeAuthModal}
          mode={authModal.mode}
          onSwitchMode={switchAuthMode}
        />
      </>
    )
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  return (
    <ClientOnly fallback={fallback || <div className="min-h-screen bg-background" />}>
      <ProtectedRouteContent fallback={fallback}>{children}</ProtectedRouteContent>
    </ClientOnly>
  )
}
