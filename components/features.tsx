"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, FileText, Clock, Globe, Shield, Zap } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const features = [
  {
    icon: MessageSquare,
    titleKey: "features.aiChat.title",
    descKey: "features.aiChat.desc",
  },
  {
    icon: FileText,
    titleKey: "features.docAnalysis.title",
    descKey: "features.docAnalysis.desc",
  },
  {
    icon: Clock,
    titleKey: "features.availability.title",
    descKey: "features.availability.desc",
  },
  {
    icon: Globe,
    titleKey: "features.bilingual.title",
    descKey: "features.bilingual.desc",
  },
  {
    icon: Shield,
    titleKey: "features.privacy.title",
    descKey: "features.privacy.desc",
  },
  {
    icon: Zap,
    titleKey: "features.instant.title",
    descKey: "features.instant.desc",
  },
]

export function Features() {
  const { t } = useLanguage()

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src="/images/supreme-court-india.png"
              alt="Supreme Court of India"
              className="w-16 h-16 rounded-lg object-cover glow-subtle"
            />
            <h2 className="text-4xl lg:text-5xl font-bold font-dm-sans text-premium text-glow">
              {t("features.title")}
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("features.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass-premium floating-element hover:scale-105 transition-transform duration-300 glow-subtle hover:glow-medium border border-white/10"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 glass-subtle rounded-lg flex items-center justify-center glow-subtle">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-premium">{t(feature.titleKey)}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 glass-premium rounded-3xl p-8 glow-strong border border-white/10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-premium text-glow">Built for Indian Legal System</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI is specifically trained on Indian laws, regulations, and legal procedures. From the Indian Penal
                Code to the Constitution of India, we understand the nuances of the Indian judicial system.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">IPC Coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Constitutional Law</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Civil Procedures</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/supreme-court-india.png"
                alt="Supreme Court of India Building"
                className="w-full h-64 rounded-2xl object-cover glow-medium"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
