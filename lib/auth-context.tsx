"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import type { AuthChangeEvent, Session, User as SupabaseUser } from "@supabase/supabase-js"

interface AppUser {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: AppUser | null
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true; message?: string } | { ok: false; error: string }>
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: true; message?: string } | { ok: false; error: string }>
  logout: () => void
  isLoading: boolean
  redirectToDashboard: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const ensureProfile = async (u: SupabaseUser) => {
      const profileName = (u.user_metadata as any)?.name || u.email?.split("@")[0] || "User"
      try {
        await supabase.from("profiles").upsert({ id: u.id, name: profileName, email: u.email || "" })
      } catch (_) {
        // ignore; may be blocked by RLS if session not fully established yet
      }
    }

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const s = data.session
      if (s?.user) {
        const u = s.user
        const profileName = (u.user_metadata as any)?.name || u.email?.split("@")[0] || "User"
        setUser({ id: u.id, name: profileName, email: u.email || "" })
        // Ensure profile row exists on load
        await ensureProfile(u)
      }
      setIsLoading(false)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((
      _event: AuthChangeEvent,
      session: Session | null,
    ) => {
      if (session?.user) {
        const u = session.user
        const profileName = (u.user_metadata as any)?.name || u.email?.split("@")[0] || "User"
        setUser({ id: u.id, name: profileName, email: u.email || "" })
        // Ensure profile row exists after auth changes (login/signup)
        ensureProfile(u)
      } else {
        setUser(null)
      }
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const redirectToDashboard = () => {
    router.push("/dashboard")
  }

  const login = async (
    email: string,
    password: string,
  ): Promise<{ ok: true; message?: string } | { ok: false; error: string }> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.session?.user) {
        setIsLoading(false)
        return { ok: false, error: (error as any)?.message || (error as any)?.error_description || "Invalid login credentials" }
      }
      const u = data.session.user
      const profileName = (u.user_metadata as any)?.name || u.email?.split("@")[0] || "User"
      setUser({ id: u.id, name: profileName, email: u.email || "" })
      setIsLoading(false)
      redirectToDashboard()
      return { ok: true, message: "Logged in successfully" }
    } catch (e: any) {
      setIsLoading(false)
      return { ok: false, error: e?.message || "Login failed" }
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ ok: true; message?: string } | { ok: false; error: string }> => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error || !data.user) {
        setIsLoading(false)
        return { ok: false, error: (error as any)?.message || (error as any)?.error_description || "Registration failed" }
      }

      // Create or update profile row (requires a 'profiles' table with RLS allowing user)
      try {
        await supabase.from("profiles").upsert({ id: data.user.id, name, email })
      } catch (_) {
        // ignore if table not ready; auth still succeeds
      }

      // Some projects require email confirmation; if so, session may be null
      if (data.session?.user) {
        const u = data.session.user
        setUser({ id: u.id, name, email: u.email || email })
        redirectToDashboard()
        setIsLoading(false)
        return { ok: true, message: "Signed up and logged in successfully" }
      }
      setIsLoading(false)
      return { ok: true, message: "Signup successful. Please check your email to confirm." }
    } catch (e: any) {
      setIsLoading(false)
      return { ok: false, error: e?.message || "Registration failed" }
    }
  }

  const logout = () => {
    supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading, redirectToDashboard }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
