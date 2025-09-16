"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Briefcase, Building, GraduationCap } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const audiences = [
  {
    icon: Users,
    titleKey: "audience.consumers.title",
    descKey: "audience.consumers.desc",
    color: "bg-blue-500",
  },
  {
    icon: Briefcase,
    titleKey: "audience.lawyers.title",
    descKey: "audience.lawyers.desc",
    color: "bg-green-500",
  },
  {
    icon: Building,
    titleKey: "audience.firms.title",
    descKey: "audience.firms.desc",
    color: "bg-purple-500",
  },
  {
    icon: GraduationCap,
    titleKey: "audience.students.title",
    descKey: "audience.students.desc",
    color: "bg-orange-500",
  },
]

export function TargetAudience() {
  const { t } = useLanguage()

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* <img
              src="/images/indian-constitution.png"
              alt="Indian Constitution"
              className="w-16 h-16 rounded-lg object-cover glow-subtle"
            /> */}
            <h2 className="text-4xl lg:text-5xl font-bold font-dm-sans text-premium text-glow leading-snug pb-2">
              {t("audience.title")}
            </h2>
          </div>
          <p className="text-xl text-white max-w-3xl mx-auto">{t("audience.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <Card
              key={index}
              className="glass-premium floating-element hover:scale-105 transition-all duration-300 glow-subtle hover:glow-medium border border-white/10"
            >
              <CardContent className="p-6 space-y-4 text-center">
                <div
                  className={`w-16 h-16 glass-subtle rounded-full flex items-center justify-center mx-auto glow-medium`}
                >
                  <audience.icon className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-premium">{t(audience.titleKey)}</h3>
                  <p className="text-white leading-relaxed text-sm">{t(audience.descKey)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 glass-premium rounded-3xl p-8 glow-strong border border-white/10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <img
                src="/images/courtroom.webp"
                alt="Indian Legal Professional"
                className="w-full h-64 rounded-2xl object-cover glow-medium"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-premium text-glow">Trusted by Legal Professionals</h3>
              <p className="text-white leading-relaxed">
                Join thousands of Indian legal professionals who trust Nyay Sarthi for accurate legal guidance. From
                High Court advocates to district court lawyers, our platform serves the entire legal community with
                precision and reliability.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center glass rounded-lg p-3 glow-subtle">
                  <div className="text-2xl font-bold text-premium text-glow">500+</div>
                  <div className="text-sm text-muted-foreground">Lawyers</div>
                </div>
                <div className="text-center glass rounded-lg p-3 glow-subtle">
                  <div className="text-2xl font-bold text-premium text-glow">50+</div>
                  <div className="text-sm text-muted-foreground">Law Firms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
