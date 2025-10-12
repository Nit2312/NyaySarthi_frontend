import { ChatInterface } from "@/components/chat-interface"
import { LanguageToggle } from "@/components/language-toggle"
import { ProtectedRoute } from "@/components/protected-route"

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <main className="fixed inset-0 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="absolute top-2 right-2 z-20">
          <LanguageToggle />
        </div>
        <ChatInterface />
      </main>
    </ProtectedRoute>
  )
}
