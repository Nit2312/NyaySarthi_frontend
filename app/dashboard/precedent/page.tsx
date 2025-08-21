import { DashboardLayout } from "@/components/dashboard-layout"
import { PrecedentFinderInterface } from "@/components/precedent-finder-interface"
import { ProtectedRoute } from "@/components/protected-route"

export default function PrecedentFinderPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="precedent">
        <PrecedentFinderInterface />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
