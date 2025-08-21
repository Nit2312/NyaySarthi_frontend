"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardChatInterface } from "@/components/dashboard-chat-interface"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardChatPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="chat">
        <DashboardChatInterface />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
