"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { X, User, Mail, Lock, Scale } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "login" | "signup"
  onSwitchMode: () => void
}

export function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
  const { login, signup, isLoading } = useAuth()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen" as "lawyer" | "judge" | "citizen",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      let success = false
      if (mode === "login") {
        success = await login(formData.email, formData.password)
      } else {
        success = await signup(formData.name, formData.email, formData.password, formData.role)
      }

      if (success) {
        onClose()
        setFormData({ name: "", email: "", password: "", role: "citizen" })
        // Redirect is now handled automatically by the auth context
      } else {
        setError(mode === "login" ? "Invalid credentials" : "Registration failed")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md">
        <div className="glass-premium rounded-3xl p-8 shadow-2xl border border-white/10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full glass-subtle hover:glass-hover transition-all duration-300"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full glass-subtle flex items-center justify-center">
              <Scale className="w-8 h-8 text-white glow-text" />
            </div>
            <h2 className="text-2xl font-bold text-white glow-text mb-2">
              {mode === "login" ? t("auth.login") : t("auth.signup")}
            </h2>
            <p className="text-white/70">{mode === "login" ? t("auth.loginSubtitle") : t("auth.signupSubtitle")}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90 font-medium">
                  {t("auth.fullName")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 glass-input border-white/20 text-white placeholder:text-white/50"
                    placeholder={t("auth.enterName")}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 font-medium">
                {t("auth.email")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 glass-input border-white/20 text-white placeholder:text-white/50"
                  placeholder={t("auth.enterEmail")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 font-medium">
                {t("auth.password")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 glass-input border-white/20 text-white placeholder:text-white/50"
                  placeholder={t("auth.enterPassword")}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white/90 font-medium">
                  {t("auth.role")}
                </Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 glass-input border-white/20 text-white bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="citizen" className="bg-gray-900 text-white">
                    {t("auth.citizen")}
                  </option>
                  <option value="lawyer" className="bg-gray-900 text-white">
                    {t("auth.lawyer")}
                  </option>
                  <option value="judge" className="bg-gray-900 text-white">
                    {t("auth.judge")}
                  </option>
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">{error}</div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full premium-button text-lg py-3 font-semibold">
              {isLoading ? t("auth.processing") : mode === "login" ? t("auth.login") : t("auth.signup")}
            </Button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-white/70">
              {mode === "login" ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
              <button
                onClick={onSwitchMode}
                className="text-white hover:text-white/80 font-semibold underline transition-colors"
              >
                {mode === "login" ? t("auth.signup") : t("auth.login")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
