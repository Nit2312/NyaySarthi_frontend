"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import type { AuthChangeEvent, Session, User as SupabaseUser } from "@supabase/supabase-js"
import { toast } from "@/hooks/use-toast"

interface AppUser {
  id: string
  name: string
  email: string
  // Optional role (e.g., 'lawyer', 'judge', 'citizen') used by the UI
  role?: 'lawyer' | 'judge' | 'citizen' | string
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
      try {
        const { data } = await supabase.auth.getSession()
        const s = data.session
        if (s?.user) {
          const u = s.user
          const profileName = (u.user_metadata as any)?.name || u.email?.split("@")[0] || "User"
          setUser({ id: u.id, name: profileName, email: u.email || "" })
          // Ensure profile row exists on load
          await ensureProfile(u)
        }
      } catch (err: any) {
        // If Supabase attempts a refresh but there is no refresh token available
        // the library can throw an AuthApiError. Detect common signs and recover
        // by forcing a client-side sign out and clearing user state.
        // Also add lightweight, non-sensitive instrumentation to help debug
        // whether the storage keys exist (do NOT log actual tokens).
        let storageInfo = { local: false, session: false }
        try {
          storageInfo.local = !!localStorage.getItem('supabase.auth.token')
        } catch (_) {
          // accessing localStorage may throw in some environments
        }
        try {
          storageInfo.session = !!sessionStorage.getItem('supabase.auth.token')
        } catch (_) {
          // accessing sessionStorage may throw in some environments
        }
        console.warn('Auth init error', { err, storageInfo })
        try {
          await supabase.auth.signOut()
        } catch (_e) {
          // ignore
        }
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((
      _event: AuthChangeEvent,
      session: Session | null,
    ) => {
      try {
        if (session?.user) {
          const u = session.user
          const profileName = (u.user_metadata as any)?.name || u.email?.split("@")[0] || "User"
          setUser({ id: u.id, name: profileName, email: u.email || "" })
          // Ensure profile row exists after auth changes (login/signup)
          ensureProfile(u)
        } else {
          setUser(null)
        }
      } catch (err: any) {
        // Add lightweight storage presence info to help debug missing-token errors
        let storageInfo = { local: false, session: false }
        try {
          storageInfo.local = !!localStorage.getItem('supabase.auth.token')
        } catch (_) {
          // ignore
        }
        try {
          storageInfo.session = !!sessionStorage.getItem('supabase.auth.token')
        } catch (_) {
          // ignore
        }
        console.warn('Auth state change handler error', { err, storageInfo })
        // If we hit an auth-related error (e.g., missing refresh token), force sign-out
        supabase.auth.signOut().catch(() => {})
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
        const errMsg = (error as any)?.message || (error as any)?.error_description || "Invalid login credentials"
        toast({
          title: "Login failed",
          description: errMsg,
          variant: "destructive",
        })
        return { ok: false, error: errMsg }
      }
      const u = data.session.user
      const profileName = (u.user_metadata as any)?.name || u.email?.split("@")[0] || "User"
      setUser({ id: u.id, name: profileName, email: u.email || "" })
      setIsLoading(false)
      redirectToDashboard()
      toast({ title: "Logged in", description: "Logged in successfully" })
      return { ok: true, message: "Logged in successfully" }
    } catch (e: any) {
      setIsLoading(false)
      const errMsg = e?.message || "Login failed"
      toast({ title: "Login failed", description: errMsg, variant: "destructive" })
      return { ok: false, error: errMsg }
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
        const errMsg = (error as any)?.message || (error as any)?.error_description || "Registration failed"
        toast({ title: "Signup failed", description: errMsg, variant: "destructive" })
        return { ok: false, error: errMsg }
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
        toast({ title: "Welcome!", description: "Signed up and logged in successfully" })
        return { ok: true, message: "Signed up and logged in successfully" }
      }
      setIsLoading(false)
      toast({ title: "Signup successful", description: "Please check your email to confirm." })
      return { ok: true, message: "Signup successful. Please check your email to confirm." }
    } catch (e: any) {
      setIsLoading(false)
      const errMsg = e?.message || "Registration failed"
      toast({ title: "Signup failed", description: errMsg, variant: "destructive" })
      return { ok: false, error: errMsg }
    }
  }

  const logout = () => {
    supabase.auth.signOut()
    setUser(null)
    router.push("/")
    toast({ title: "Logged out", description: "You have been signed out." })
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
