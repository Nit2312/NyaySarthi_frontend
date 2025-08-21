"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Scale, Shield, Sparkles, Zap, Users, BookOpen, MessageCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { AuthModal } from "@/components/auth-modal"

export function Hero() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
    isOpen: false,
    mode: "signup",
  })

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthModal({ isOpen: true, mode })
  }

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: "signup" })
  }

  const switchAuthMode = () => {
    setAuthModal((prev) => ({ ...prev, mode: prev.mode === "login" ? "signup" : "login" }))
  }

  return (
    <>
      <section className="relative min-h-[88vh] flex items-center px-4 py-16">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs bg-black/40 backdrop-blur-sm border border-white/10">
                <Scale className="w-4 h-4 text-white/80" />
                <span className="text-white/90">{t("hero.tagline")}</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-semibold tracking-tight text-white">
                {t("hero.title")}
              </h1>

              <p className="text-lg lg:text-xl text-white/85 leading-relaxed max-w-2xl">
                {t("hero.subtitle")}
              </p>

              <div className="rounded-2xl p-6 space-y-4 bg-black/35 backdrop-blur-md border border-white/10">
                <h3 className="text-base font-semibold text-white/90">What is Nyay Sarthi?</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Nyay Sarthi is India's most advanced AI-powered legal assistant, designed specifically for the Indian
                  judicial system. Whether you're a citizen seeking legal guidance, a lawyer researching case laws, or a
                  judge looking for precedents, our platform provides instant, accurate legal information in both
                  English and Hindi.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button
                    size="lg"
                    className="text-base px-8 py-6 bg-white text-black hover:bg-white/90"
                    onClick={() => (window.location.href = "/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="text-base px-8 py-6 bg-white text-black hover:bg-white/90"
                    onClick={() => openAuthModal("signup")}
                  >
                    {t("common.tryFree")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-6 border-white/40 text-white hover:bg-white/10"
                  onClick={() => (window.location.href = "/chat")}
                >
                  Try Demo Chat
                </Button>
              </div>
            </div>

            {/* Right Content: Simple preview card */}
            <div className="hidden lg:block">
              <div className="rounded-3xl p-6 bg-black/35 backdrop-blur-md border border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Scale className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Nyay Sarthi AI</div>
                      <div className="text-xs text-white/70">Premium Legal Assistant</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg p-3 text-sm bg-white/5 border border-white/10 text-white/90">
                      {t("chat.greeting")}
                    </div>
                    <div className="rounded-lg p-3 text-sm ml-10 bg-white/10 border border-white/15 text-white/90">
                      मुझे property dispute के बारे में जानकारी चाहिए
                    </div>
                    <div className="rounded-lg p-3 text-sm bg-white/5 border border-white/10 text-white/85">
                      I can help you with property disputes under Indian law. Let me provide you with relevant
                      information about property rights, dispute resolution mechanisms, and legal procedures...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onSwitchMode={switchAuthMode}
      />
    </>
  )
}
