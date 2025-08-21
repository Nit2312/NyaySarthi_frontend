"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { NoSSR } from "./no-ssr"

function LanguageToggleContent() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fixed top-20 right-4 z-50">
      <div className="glass rounded-full p-1 floating-element">
        <Button
          variant={language === "en" ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage("en")}
          className="rounded-full px-3 py-1 text-xs"
        >
          EN
        </Button>
        <Button
          variant={language === "hi" ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage("hi")}
          className="rounded-full px-3 py-1 text-xs"
        >
          हिं
        </Button>
      </div>
    </div>
  )
}

export function LanguageToggle() {
  return (
    <NoSSR fallback={
      <div className="fixed top-20 right-4 z-50">
        <div className="glass rounded-full p-1 floating-element">
          <Button variant="default" size="sm" className="rounded-full px-3 py-1 text-xs">
            EN
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full px-3 py-1 text-xs">
            हिं
          </Button>
        </div>
      </div>
    }>
      <LanguageToggleContent />
    </NoSSR>
  )
}
