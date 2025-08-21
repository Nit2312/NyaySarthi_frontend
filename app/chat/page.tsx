import { ChatInterface } from "@/components/chat-interface"
import { LanguageToggle } from "@/components/language-toggle"
import { ProtectedRoute } from "@/components/protected-route"

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <LanguageToggle />
        <ChatInterface />
      </main>
    </ProtectedRoute>
  )
}
