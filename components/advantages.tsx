"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Clock, Zap, DollarSign, CheckCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const advantages = [
  {
    icon: Shield,
    titleKey: "advantages.private.title",
    descKey: "advantages.private.desc",
    stat: "100%",
    statLabel: "Secure",
  },
  {
    icon: Clock,
    titleKey: "advantages.fast.title",
    descKey: "advantages.fast.desc",
    stat: "5 Seconds",
    statLabel: "Response Time",
  },
  {
    icon: Zap,
    titleKey: "advantages.support.title",
    descKey: "advantages.support.desc",
    stat: "24/7",
    statLabel: "Available",
  },
  {
    icon: DollarSign,
    titleKey: "advantages.cost.title",
    descKey: "advantages.cost.desc",
    stat: "90%",
    statLabel: "Cost Savings",
  },
]

export function Advantages() {
  const { t } = useLanguage()

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold font-dm-sans">{t("advantages.title")}</h2>
          <p className="text-xl text-muted-white max-w-3xl mx-auto">{t("advantages.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => (
            <Card
              key={index}
              className="glass floating-element hover:scale-105 transition-all duration-300 text-center"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <advantage.icon className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-dm-sans">{t(advantage.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(advantage.descKey)}</p>
                </div>

                <div className="pt-4 border-t border-border/20">
                  <div className="text-3xl font-bold text-primary">{advantage.stat}</div>
                  <div className="text-xs text-muted-foreground">{advantage.statLabel}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3 floating-element">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Trusted by 10,000+ users across India</span>
          </div>
        </div>
      </div>
    </section>
  )
}
