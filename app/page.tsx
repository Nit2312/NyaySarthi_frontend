import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { TargetAudience } from "@/components/target-audience"
import { Advantages } from "@/components/advantages"
import { FloatingChatButton } from "@/components/floating-chat-button"
import { LanguageToggle } from "@/components/language-toggle"
import { Navigation } from "@/components/navigation"
import { PremiumFooter } from "@/components/premium-footer"
import { HomePageRedirect } from "@/components/home-page-redirect"
import { ClientOnly } from "@/components/client-only"
import Image from "next/image"

export default function HomePage() {
  return (
    <HomePageRedirect>
      <ClientOnly fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
          <div className="glass-premium rounded-3xl p-8 text-center space-y-4 glow-strong">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg font-medium">Loading Nyay Sarthi...</p>
          </div>
        </div>
      }>
        <main className="min-h-screen relative overflow-hidden">
          <div className="fixed inset-0 bg-background z-0">
            {/* Supreme Court Background Image */}
            <div className="absolute inset-0">
              <Image
                src="/img/photo1.jpg"
                alt="Homepage background"
                fill
                priority
                className="object-cover object-center"
                sizes="100vw"
              />
              {/* Subtle dark scrim for readability */}
              <div className="absolute inset-0 bg-black/45" />
            </div>
          </div>

          {/* Floating orbs removed as requested */}

          <div className="relative z-10 pt-16">
            <Navigation />
            <LanguageToggle />
            <section id="home" className="scroll-mt-24">
              <Hero />
            </section>
            <section id="features" className="scroll-mt-24">
              <Features />
            </section>
            <section id="about" className="scroll-mt-24">
              <TargetAudience />
            </section>
            <section id="advantages" className="scroll-mt-24">
              <Advantages />
            </section>
            <FloatingChatButton />
            <PremiumFooter />
          </div>
        </main>
      </ClientOnly>
    </HomePageRedirect>
  )
}
