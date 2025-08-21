"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  MessageSquare,
  FileText,
  Clock,
  TrendingUp,
  Settings,
  Download,
  ArrowLeft,
  Calendar,
  BookOpen,
  Bell,
  Star,
  Sparkles,
  Zap,
  Crown,
  Shield,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

const mockUserData = {
  name: "Rajesh Kumar",
  nameHi: "राजेश कुमार",
  email: "rajesh.kumar@email.com",
  joinDate: "March 2024",
  joinDateHi: "मार्च 2024",
  plan: "Free",
  planHi: "मुफ्त",
  queriesUsed: 45,
  queriesLimit: 100,
  consultations: 12,
  documentsDownloaded: 8,
  favoriteTopics: ["Property Law", "Consumer Rights", "Family Law"],
  favoriteTopicsHi: ["संपत्ति कानून", "उपभोक्ता अधिकार", "पारिवारिक कानून"],
}

const recentChats = [
  {
    id: "1",
    title: "Property dispute with neighbor",
    titleHi: "पड़ोसी के साथ संपत्ति विवाद",
    date: "2024-01-15",
    status: "resolved",
    statusHi: "हल हो गया",
    category: "Property Law",
    categoryHi: "संपत्ति कानून",
  },
  {
    id: "2",
    title: "Consumer complaint process",
    titleHi: "उपभोक्ता शिकायत प्रक्रिया",
    date: "2024-01-12",
    status: "ongoing",
    statusHi: "जारी",
    category: "Consumer Law",
    categoryHi: "उपभोक्ता कानून",
  },
  {
    id: "3",
    title: "Employment termination rights",
    titleHi: "रोजगार समाप्ति अधिकार",
    date: "2024-01-10",
    status: "resolved",
    statusHi: "हल हो गया",
    category: "Labor Law",
    categoryHi: "श्रम कानून",
  },
]

const savedDocuments = [
  {
    id: "1",
    name: "Rent Agreement Template",
    nameHi: "किराया समझौता टेम्प्लेट",
    type: "PDF",
    size: "245 KB",
    downloadDate: "2024-01-14",
    category: "Property Law",
    categoryHi: "संपत्ति कानून",
  },
  {
    id: "2",
    name: "Consumer Complaint Form",
    nameHi: "उपभोक्ता शिकायत फॉर्म",
    type: "PDF",
    size: "180 KB",
    downloadDate: "2024-01-12",
    category: "Consumer Law",
    categoryHi: "उपभोक्ता कानून",
  },
  {
    id: "3",
    name: "Power of Attorney Form",
    nameHi: "मुख्तारनामा फॉर्म",
    type: "PDF",
    size: "320 KB",
    downloadDate: "2024-01-08",
    category: "General",
    categoryHi: "सामान्य",
  },
]

const quickActions = [
  {
    icon: MessageSquare,
    title: "New Legal Query",
    titleHi: "नया कानूनी प्रश्न",
    description: "Ask AI assistant",
    descriptionHi: "AI सहायक से पूछें",
    href: "/chat",
    color: "bg-blue-500",
  },
  {
    icon: FileText,
    title: "Browse Resources",
    titleHi: "संसाधन ब्राउज़ करें",
    description: "Legal documents",
    descriptionHi: "कानूनी दस्तावेज़",
    href: "/resources",
    color: "bg-green-500",
  },
  {
    icon: BookOpen,
    title: "Legal Guides",
    titleHi: "कानूनी गाइड",
    description: "Step-by-step help",
    descriptionHi: "चरणबद्ध सहायता",
    href: "/resources?tab=guides",
    color: "bg-purple-500",
  },
  {
    icon: Calendar,
    title: "Schedule Consultation",
    titleHi: "परामर्श शेड्यूल करें",
    description: "With legal expert",
    descriptionHi: "कानूनी विशेषज्ञ के साथ",
    href: "#",
    color: "bg-orange-500",
  },
]

export function UserDashboard() {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-400 glow-subtle"
      case "ongoing":
        return "bg-yellow-400 glow-subtle"
      default:
        return "bg-gray-400 glow-subtle"
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/15 to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl floating-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/[0.02] rounded-full blur-2xl floating-gentle" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/[0.015] rounded-full blur-xl floating-subtle" />
        <div
          className="absolute inset-0 opacity-[0.008]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
        <div className="glass-ultra rounded-3xl p-8 mb-8 floating-element glow-strong border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="glass-strong glow-subtle hover:glow-medium transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Avatar className="w-20 h-20 glow-medium floating-element">
                <AvatarImage src="/indian-professional-man.png" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
                  {mockUserData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-premium text-glow">
                  {language === "en" ? `Welcome, ${mockUserData.name}` : `स्वागत है, ${mockUserData.nameHi}`}
                </h1>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent" />
                  {language === "en"
                    ? `Premium Member since ${mockUserData.joinDate}`
                    : `${mockUserData.joinDateHi} से प्रीमियम सदस्य`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="glass-strong glow-subtle px-4 py-2 text-sm font-bold">
                <Sparkles className="w-4 h-4 mr-2 text-accent" />
                {language === "en" ? mockUserData.plan : mockUserData.planHi}
              </Badge>
              <Button variant="ghost" size="sm" className="glass glow-subtle hover:glow-medium transition-all">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="glass glow-subtle hover:glow-medium transition-all">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="glass-ultra floating-element hover:scale-105 hover:glow-medium transition-all duration-500 cursor-pointer border border-white/20 group">
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 glow-medium group-hover:glow-strong transition-all duration-300`}
                  >
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-base mb-2 text-premium">
                    {language === "en" ? action.title : action.titleHi}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {language === "en" ? action.description : action.descriptionHi}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="glass-ultra p-2 h-auto glow-medium border border-white/20">
            <TabsTrigger value="overview" className="flex items-center gap-3 px-6 py-3 text-base font-medium">
              <TrendingUp className="w-5 h-5" />
              {language === "en" ? "Overview" : "अवलोकन"}
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-3 px-6 py-3 text-base font-medium">
              <MessageSquare className="w-5 h-5" />
              {language === "en" ? "Chat History" : "चैट इतिहास"}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-3 px-6 py-3 text-base font-medium">
              <FileText className="w-5 h-5" />
              {language === "en" ? "Documents" : "दस्तावेज़"}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-3 px-6 py-3 text-base font-medium">
              <User className="w-5 h-5" />
              {language === "en" ? "Profile" : "प्रोफ़ाइल"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="glass-ultra floating-element glow-medium border border-white/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3 text-premium">
                    <TrendingUp className="w-6 h-6 text-accent glow-subtle" />
                    {language === "en" ? "Usage Statistics" : "उपयोग आंकड़े"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-3 font-medium">
                      <span>{language === "en" ? "Queries Used" : "प्रश्न उपयोग किए गए"}</span>
                      <span className="text-premium">
                        {mockUserData.queriesUsed}/{mockUserData.queriesLimit}
                      </span>
                    </div>
                    <Progress
                      value={(mockUserData.queriesUsed / mockUserData.queriesLimit) * 100}
                      className="h-3 glass"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="text-center glass rounded-xl p-4 glow-subtle">
                      <div className="text-3xl font-bold text-premium text-glow">{mockUserData.consultations}</div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {language === "en" ? "Consultations" : "परामर्श"}
                      </div>
                    </div>
                    <div className="text-center glass rounded-xl p-4 glow-subtle">
                      <div className="text-3xl font-bold text-premium text-glow">
                        {mockUserData.documentsDownloaded}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {language === "en" ? "Downloads" : "डाउनलोड"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-ultra floating-element glow-medium border border-white/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3 text-premium">
                    <Star className="w-6 h-6 text-accent glow-subtle" />
                    {language === "en" ? "Favorite Topics" : "पसंदीदा विषय"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(language === "en" ? mockUserData.favoriteTopics : mockUserData.favoriteTopicsHi).map(
                      (topic, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="glass-strong glow-subtle mr-2 mb-2 px-3 py-1 font-medium"
                        >
                          {topic}
                        </Badge>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-ultra floating-element glow-medium border border-white/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3 text-premium">
                    <Clock className="w-6 h-6 text-accent glow-subtle" />
                    {language === "en" ? "Recent Activity" : "हाल की गतिविधि"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm glass rounded-lg p-3 glow-subtle">
                      <div className="w-3 h-3 bg-green-400 rounded-full glow-subtle"></div>
                      <span className="text-muted-foreground font-medium">
                        {language === "en" ? "Downloaded rent agreement" : "किराया समझौता डाउनलोड किया"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm glass rounded-lg p-3 glow-subtle">
                      <div className="w-3 h-3 bg-blue-400 rounded-full glow-subtle"></div>
                      <span className="text-muted-foreground font-medium">
                        {language === "en" ? "Asked about property rights" : "संपत्ति अधिकारों के बारे में पूछा"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm glass rounded-lg p-3 glow-subtle">
                      <div className="w-3 h-3 bg-purple-400 rounded-full glow-subtle"></div>
                      <span className="text-muted-foreground font-medium">
                        {language === "en" ? "Read consumer law guide" : "उपभोक्ता कानून गाइड पढ़ा"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chats" className="space-y-6">
            <div className="space-y-6">
              {recentChats.map((chat) => (
                <Card
                  key={chat.id}
                  className="glass-ultra floating-element hover:scale-[1.02] hover:glow-medium transition-all duration-500 border border-white/20"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-premium">
                          {language === "en" ? chat.title : chat.titleHi}
                        </h3>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-sm glass-strong glow-subtle border-white/20">
                            {language === "en" ? chat.category : chat.categoryHi}
                          </Badge>
                          <div className={`w-3 h-3 ${getStatusColor(chat.status)} rounded-full`}></div>
                          <span className="text-sm text-muted-foreground font-medium">
                            {language === "en" ? chat.status : chat.statusHi}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-3">
                        <div className="text-sm text-muted-foreground font-medium">{chat.date}</div>
                        <Button size="sm" className="glass-strong glow-subtle hover:glow-medium transition-all">
                          {language === "en" ? "Continue" : "जारी रखें"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {savedDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className="glass-ultra floating-element hover:scale-[1.02] hover:glow-medium transition-all duration-500 border border-white/20"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center glow-medium">
                          <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-bold text-base text-premium">
                            {language === "en" ? doc.name : doc.nameHi}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                          </div>
                          <Badge variant="outline" className="text-xs glass-strong glow-subtle border-white/20">
                            {language === "en" ? doc.category : doc.categoryHi}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" className="glass-strong glow-subtle hover:glow-medium transition-all">
                        <Download className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="glass-ultra floating-element glow-medium border border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-premium flex items-center gap-3">
                    <Shield className="w-6 h-6 text-accent glow-subtle" />
                    {language === "en" ? "Personal Information" : "व्यक्तिगत जानकारी"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-premium">{language === "en" ? "Name" : "नाम"}</label>
                    <div className="text-base text-muted-foreground font-medium glass rounded-lg p-3">
                      {language === "en" ? mockUserData.name : mockUserData.nameHi}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-premium">{language === "en" ? "Email" : "ईमेल"}</label>
                    <div className="text-base text-muted-foreground font-medium glass rounded-lg p-3">
                      {mockUserData.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-premium">{language === "en" ? "Plan" : "योजना"}</label>
                    <div className="text-base text-muted-foreground font-medium glass rounded-lg p-3">
                      {language === "en" ? mockUserData.plan : mockUserData.planHi}
                    </div>
                  </div>
                  <Button className="mt-6 glass-strong glow-medium hover:glow-strong transition-all duration-300">
                    <Zap className="w-4 h-4 mr-2" />
                    {language === "en" ? "Edit Profile" : "प्रोफ़ाइल संपादित करें"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-ultra floating-element glow-medium border border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl text-premium flex items-center gap-3">
                    <Settings className="w-6 h-6 text-accent glow-subtle" />
                    {language === "en" ? "Preferences" : "प्राथमिकताएं"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-premium">{language === "en" ? "Language" : "भाषा"}</label>
                    <div className="text-base text-muted-foreground font-medium glass rounded-lg p-3">
                      {language === "en" ? "English" : "हिंदी"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-premium">
                      {language === "en" ? "Notifications" : "सूचनाएं"}
                    </label>
                    <div className="text-base text-muted-foreground font-medium glass rounded-lg p-3">
                      {language === "en" ? "Email & Push" : "ईमेल और पुश"}
                    </div>
                  </div>
                  <Button className="mt-6 glass-strong glow-medium hover:glow-strong transition-all duration-300">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {language === "en" ? "Update Preferences" : "प्राथमिकताएं अपडेट करें"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
