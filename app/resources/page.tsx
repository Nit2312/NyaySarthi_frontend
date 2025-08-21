import { LegalResources } from "@/components/legal-resources"
import { LanguageToggle } from "@/components/language-toggle"
import { PremiumFooter } from "@/components/premium-footer"
import { ProtectedRoute } from "@/components/protected-route"

export default function ResourcesPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <LanguageToggle />
        <LegalResources />
        <PremiumFooter />
      </main>
    </ProtectedRoute>
  )
}
