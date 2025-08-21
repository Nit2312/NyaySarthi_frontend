"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Scale,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Send,
  Sparkles,
  Zap,
  Crown,
  Heart,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

const footerLinks = {
  en: {
    product: {
      title: "Product",
      links: [
        { name: "AI Legal Assistant", href: "/chat" },
        { name: "Legal Resources", href: "/resources" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Pricing", href: "#" },
      ],
    },
    legal: {
      title: "Legal Areas",
      links: [
        { name: "Property Law", href: "/resources?category=property" },
        { name: "Consumer Rights", href: "/resources?category=consumer" },
        { name: "Family Law", href: "/resources?category=family" },
        { name: "Criminal Law", href: "/resources?category=criminal" },
      ],
    },
    company: {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Blog", href: "#" },
      ],
    },
    support: {
      title: "Support",
      links: [
        { name: "Help Center", href: "#" },
        { name: "API Documentation", href: "#" },
        { name: "Status", href: "#" },
        { name: "Community", href: "#" },
      ],
    },
  },
  hi: {
    product: {
      title: "उत्पाद",
      links: [
        { name: "AI कानूनी सहायक", href: "/chat" },
        { name: "कानूनी संसाधन", href: "/resources" },
        { name: "डैशबोर्ड", href: "/dashboard" },
        { name: "मूल्य निर्धारण", href: "#" },
      ],
    },
    legal: {
      title: "कानूनी क्षेत्र",
      links: [
        { name: "संपत्ति कानून", href: "/resources?category=property" },
        { name: "उपभोक्ता अधिकार", href: "/resources?category=consumer" },
        { name: "पारिवारिक कानून", href: "/resources?category=family" },
        { name: "आपराधिक कानून", href: "/resources?category=criminal" },
      ],
    },
    company: {
      title: "कंपनी",
      links: [
        { name: "हमारे बारे में", href: "#" },
        { name: "संपर्क", href: "#" },
        { name: "करियर", href: "#" },
        { name: "ब्लॉग", href: "#" },
      ],
    },
    support: {
      title: "सहायता",
      links: [
        { name: "सहायता केंद्र", href: "#" },
        { name: "API दस्तावेज़", href: "#" },
        { name: "स्थिति", href: "#" },
        { name: "समुदाय", href: "#" },
      ],
    },
  },
}

export function PremiumFooter() {
  const { language } = useLanguage()
  const links = footerLinks[language]

  return (
    <footer className="relative mt-20">
      {/* Background with premium effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-muted/10 to-transparent">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl floating-slow" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-white/[0.015] rounded-full blur-2xl floating-gentle" />
        <div
          className="absolute inset-0 opacity-[0.005]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Blogs Section */}
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div id="blogs" className="scroll-mt-24 glass-ultra rounded-3xl p-12 floating-element glow-strong border border-white/20 mb-16">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-accent glow-medium" />
                <h2 className="text-4xl font-bold text-premium text-glow">
                  {language === "en" ? "Explore Legal Blogs" : "कानूनी ब्लॉग्स देखें"}
                </h2>
              </div>
              <p className="text-xl text-muted-foreground font-medium">
                {language === "en"
                  ? "Read insights on Indian law, procedures, and expert analysis from our team."
                  : "भारतीय कानून, प्रक्रियाओं और विशेषज्ञ विश्लेषण पर हमारे लेख पढ़ें।"}
              </p>
              <div className="flex items-center justify-center">
                <Link href="/blog">
                  <Button className="glass-strong glow-medium hover:glow-strong transition-all duration-300 px-8 py-3 group">
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    {language === "en" ? "Read Blogs" : "ब्लॉग पढ़ें"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="glass-ultra rounded-3xl p-12 floating-element glow-medium border border-white/20">
            <div className="grid lg:grid-cols-6 gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center glow-strong">
                    <Scale className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-premium text-glow">Nyay Sarthi</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {language === "en" ? "Premium AI Legal Assistant" : "प्रीमियम AI कानूनी सहायक"}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {language === "en"
                    ? "Empowering Indians with accessible legal knowledge through cutting-edge AI technology. Your trusted companion for navigating the complexities of Indian law."
                    : "अत्याधुनिक AI तकनीक के माध्यम से सुलभ कानूनी ज्ञान के साथ भारतीयों को सशक्त बनाना। भारतीय कानून की जटिलताओं को समझने के लिए आपका विश्वसनीय साथी।"}
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-5 h-5 text-accent glow-subtle" />
                    <span className="text-muted-foreground font-medium">support@nyaysarthi.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-accent glow-subtle" />
                    <span className="text-muted-foreground font-medium">+91 1800-NYAY-HELP</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-accent glow-subtle" />
                    <span className="text-muted-foreground font-medium">
                      {language === "en" ? "New Delhi, India" : "नई दिल्ली, भारत"}
                    </span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-3">
                  {[Twitter, Linkedin, Instagram, Youtube].map((Icon, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-12 h-12 glass glow-subtle hover:glow-medium transition-all duration-300 floating-element"
                    >
                      <Icon className="w-5 h-5" />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Links Sections */}
              {Object.entries(links).map(([key, section]) => (
                <div key={key} className="space-y-4">
                  <h4 className="text-lg font-bold text-premium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium hover:translate-x-1 inline-block"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="border-t border-white/10 mt-12 pt-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <span className="font-medium">
                    © 2024 Nyay Sarthi. {language === "en" ? "All rights reserved." : "सभी अधिकार सुरक्षित।"}
                  </span>
                  <div className="flex gap-6">
                    <Link href="#" className="hover:text-foreground transition-colors">
                      {language === "en" ? "Privacy Policy" : "गोपनीयता नीति"}
                    </Link>
                    <Link href="#" className="hover:text-foreground transition-colors">
                      {language === "en" ? "Terms of Service" : "सेवा की शर्तें"}
                    </Link>
                    <Link href="#" className="hover:text-foreground transition-colors">
                      {language === "en" ? "Cookie Policy" : "कुकी नीति"}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="glass-strong glow-subtle px-3 py-1">
                    <Zap className="w-3 h-3 mr-1 text-accent" />
                    {language === "en" ? "Powered by AI" : "AI द्वारा संचालित"}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{language === "en" ? "Made with" : "के साथ बनाया गया"}</span>
                    <Heart className="w-4 h-4 text-red-400 glow-subtle" />
                    <span>{language === "en" ? "in India" : "भारत में"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
