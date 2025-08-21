"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: "lawyer" | "judge" | "citizen"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, role: "lawyer" | "judge" | "citizen") => Promise<boolean>
  logout: () => void
  isLoading: boolean
  redirectToDashboard: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user session - make this faster
    const storedUser = localStorage.getItem("nyay-sarthi-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("nyay-sarthi-user")
      }
    }
    setIsLoading(false)
  }, [])

  const redirectToDashboard = () => {
    router.push("/dashboard")
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Reduce API call simulation time
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock authentication - in real app, this would be an API call
    if (email && password.length >= 6) {
      const mockUser: User = {
        id: "1",
        name: email.split("@")[0],
        email,
        role: email.includes("judge") ? "judge" : email.includes("lawyer") ? "lawyer" : "citizen",
      }

      setUser(mockUser)
      localStorage.setItem("nyay-sarthi-user", JSON.stringify(mockUser))
      setIsLoading(false)
      // Automatically redirect to dashboard after successful login
      redirectToDashboard()
      return true
    }

    setIsLoading(false)
    return false
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: "lawyer" | "judge" | "citizen",
  ): Promise<boolean> => {
    setIsLoading(true)

    // Reduce API call simulation time
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock registration
    if (name && email && password.length >= 6) {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role,
      }

      setUser(newUser)
      localStorage.setItem("nyay-sarthi-user", JSON.stringify(newUser))
      setIsLoading(false)
      // Automatically redirect to dashboard after successful signup
      redirectToDashboard()
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("nyay-sarthi-user")
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
