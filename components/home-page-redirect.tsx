"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ClientOnly } from "./client-only"
import { Loading } from "./ui/loading"

interface HomePageRedirectProps {
  children: React.ReactNode
}

function HomePageRedirectContent({ children }: HomePageRedirectProps) {
  const { user, isLoading, redirectToDashboard } = useAuth()

  useEffect(() => {
    // If user is logged in and not loading, redirect to dashboard immediately
    if (user && !isLoading) {
      // Use a small delay to ensure the component has mounted
      const timer = setTimeout(() => {
        redirectToDashboard()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [user, isLoading, redirectToDashboard])

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

  // If user is not logged in, show the home page
  if (!user) {
    return <>{children}</>
  }

  // If user is logged in, show minimal loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="glass-premium rounded-3xl p-8 text-center space-y-4 glow-strong">
        <Loading size="md" text="Taking you to your dashboard" />
      </div>
    </div>
  )
}

export function HomePageRedirect({ children }: HomePageRedirectProps) {
  return (
    <ClientOnly fallback={<>{children}</>}>
      <HomePageRedirectContent>{children}</HomePageRedirectContent>
    </ClientOnly>
  )
}
