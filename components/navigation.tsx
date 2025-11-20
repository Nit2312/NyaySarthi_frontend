"use client"

import { Button } from "@/components/ui/button"
import { Scale, Menu, X, User, LogOut } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { ClientOnly } from "@/components/client-only"
import Link from "next/link"
import { useState, useCallback } from "react"

function NavigationContent() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
    isOpen: false,
    mode: "login",
  })
  const [showUserMenu, setShowUserMenu] = useState(false)

  const openAuthModal = useCallback((mode: "login" | "signup") => {
    setAuthModal({ isOpen: true, mode })
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModal({ isOpen: false, mode: "login" })
  }, [])

  const switchAuthMode = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, mode: prev.mode === "login" ? "signup" : "login" }))
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setShowUserMenu(false)
  }, [logout])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen)
  }, [isMenuOpen])

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(!showUserMenu)
  }, [showUserMenu])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-border/20 pt-[env(safe-area-inset-top)]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-dm-sans">Nyay Sarthi</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="#home">
                <Button variant="ghost" size="sm">
                  {t("nav.home")}
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost" size="sm">
                  Features
                </Button>
              </Link>
              <Link href="#about">
                <Button variant="ghost" size="sm">
                  About
                </Button>
              </Link>
              <Link href="#advantages">
                <Button variant="ghost" size="sm">
                  Advantages
                </Button>
              </Link>
              <Link href="#blogs">
                <Button variant="ghost" size="sm">
                  Blogs
                </Button>
              </Link>

              {user ? (
                <>
                  <Link href="/precedents">
                    <Button variant="ghost" size="sm">
                      Precedents
                    </Button>
                  </Link>
                  <Link href="/resources">
                    <Button variant="ghost" size="sm">
                      Resources
                    </Button>
                  </Link>
                  <Link href="/chat">
                    <Button variant="ghost" size="sm">
                      Chat
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleUserMenu}
                      className="flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      {user.name}
                    </Button>

                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 glass-premium rounded-lg border border-white/10 shadow-xl">
                        <div className="p-2">
                          <div className="px-3 py-2 text-sm text-white/70 border-b border-white/10">{user.email}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full justify-start mt-2 text-red-400 hover:text-red-300"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => openAuthModal("login")}>
                    Login
                  </Button>
                  <Button size="sm" className="premium-button" onClick={() => openAuthModal("signup")}>
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div id="mobile-nav" className="md:hidden py-4 border-t border-border/20">
              <div className="flex flex-col gap-2">
                <Link href="#home">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                    {t("nav.home")}
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                    Features
                  </Button>
                </Link>
                <Link href="#about">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                    About
                  </Button>
                </Link>
                <Link href="#advantages">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                    Advantages
                  </Button>
                </Link>
                <Link href="#blogs">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                    Blogs
                  </Button>
                </Link>

                {user ? (
                  <>
                    <Link href="/precedents">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Precedents
                      </Button>
                    </Link>
                    <Link href="/resources">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Resources
                      </Button>
                    </Link>
                    <Link href="/chat">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Chat
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                    <div className="border-t border-white/10 mt-2 pt-2">
                      <div className="px-3 py-2 text-sm text-white/70">
                        {user.name} ({user.email})
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-red-400 hover:text-red-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => openAuthModal("login")}
                    >
                      Login
                    </Button>
                    <Button size="sm" className="w-full mt-2 premium-button" onClick={() => openAuthModal("signup")}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onSwitchMode={switchAuthMode}
      />
    </>
  )
}

export function Navigation() {
  return (
    <ClientOnly fallback={<div className="h-16" />}>
      <NavigationContent />
    </ClientOnly>
  )
}
