"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DocumentUploadInterface } from "@/components/document-upload-interface"
import { ProtectedRoute } from "@/components/protected-route"

export default function DocumentUploadPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="upload">
        <DocumentUploadInterface />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
