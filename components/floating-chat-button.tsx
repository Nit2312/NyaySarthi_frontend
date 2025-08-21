"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl floating-element hover:scale-110 transition-all duration-300"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 max-w-[calc(100vw-2rem)]">
          <Card className="glass-strong floating-element">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                {t("chat.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm">{t("chat.greeting")}</div>

              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent">
                  {t("chat.propertyDispute")}
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent">
                  {t("chat.consumerRights")}
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent">
                  {t("chat.familyLaw")}
                </Button>
              </div>

              <Link href="/chat">
                <Button className="w-full">{t("common.startConsultation")}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
