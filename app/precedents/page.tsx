"use client"

import { PrecedentFinderInterface } from "@/components/precedent-finder-interface"
import { Navigation } from "@/components/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-context"
import { ErrorBoundary } from "@/components/error-boundary"

export default function PrecedentsPage() {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return null
  }
  if (user) {
    return (
      <ErrorBoundary>
        <DashboardLayout currentPage="precedent">
          <PrecedentFinderInterface />
        </DashboardLayout>
      </ErrorBoundary>
    )
  }
  return (
    <ErrorBoundary>
      <Navigation />
      <PrecedentFinderInterface />
    </ErrorBoundary>
  )
}
