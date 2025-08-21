"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "hi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Navigation & Common
    "nav.home": "Home",
    "nav.features": "Features",
    "nav.about": "About",
    "nav.contact": "Contact",
    "common.tryFree": "Try for Free",
    "common.learnMore": "Learn More",
    "common.startConsultation": "Start Legal Consultation",
    "common.askQuestion": "Ask a Question",

    // Authentication
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.loginSubtitle": "Welcome back to Nyay Sarthi",
    "auth.signupSubtitle": "Join thousands of legal professionals",
    "auth.fullName": "Full Name",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.role": "Role",
    "auth.citizen": "Citizen",
    "auth.lawyer": "Lawyer",
    "auth.judge": "Judge",
    "auth.enterName": "Enter your full name",
    "auth.enterEmail": "Enter your email address",
    "auth.enterPassword": "Enter your password",
    "auth.processing": "Processing...",
    "auth.noAccount": "Don't have an account?",
    "auth.haveAccount": "Already have an account?",

    // Hero Section
    "hero.tagline": "AI Legal Assistant for India",
    "hero.title": "Nyay Sarthi",
    "hero.subtitle":
      "Your personal AI legal assistant for Indian law. Get instant legal advice, document help, and expert guidance in English and Hindi.",
    "hero.stats.queries": "Legal Queries Solved",
    "hero.stats.support": "Available Support",
    "hero.stats.accuracy": "Accuracy Rate",

    // Features
    "features.title": "Features of Legal AI",
    "features.subtitle":
      "Explore features that boost your productivity. From document automation to advanced research, we've got the best work covered.",
    "features.aiChat.title": "AI-Powered Legal Chat",
    "features.aiChat.desc": "Get instant answers to your legal questions with our advanced AI trained on Indian law.",
    "features.docAnalysis.title": "Document Analysis",
    "features.docAnalysis.desc": "Upload and analyze legal documents, contracts, and agreements for insights.",
    "features.availability.title": "24/7 Availability",
    "features.availability.desc": "Access legal assistance anytime, anywhere. No appointments needed.",
    "features.bilingual.title": "Bilingual Support",
    "features.bilingual.desc": "Communicate in English or Hindi - whatever you're comfortable with.",
    "features.privacy.title": "Privacy Protected",
    "features.privacy.desc": "Your legal consultations are completely confidential and secure.",
    "features.instant.title": "Instant Responses",
    "features.instant.desc": "Get comprehensive legal guidance in seconds, not days.",

    // Target Audience
    "audience.title": "Who is Nyay Sarthi for?",
    "audience.subtitle":
      "Whether you're a consumer, a student, a solo lawyer, or a law firm - Nyay Sarthi adapts to your legal needs and boosts your productivity.",
    "audience.consumers.title": "AI for Legal Consumers",
    "audience.consumers.desc":
      "Get instant legal guidance for personal matters, property disputes, and consumer rights.",
    "audience.lawyers.title": "AI for Lawyers",
    "audience.lawyers.desc": "Enhance your practice with AI-powered research, case analysis, and document drafting.",
    "audience.firms.title": "AI for Law Firms",
    "audience.firms.desc": "Streamline operations, improve client service, and increase efficiency across your firm.",
    "audience.students.title": "AI for Law Students",
    "audience.students.desc": "Learn faster with AI tutoring, case studies, and comprehensive legal education support.",

    // Advantages
    "advantages.title": "Why our AI in law is better?",
    "advantages.subtitle": "In contrast to others, our LegalTech software is quick, easy, and search-friendly.",
    "advantages.private.title": "Private",
    "advantages.private.desc": "Your legal consultations remain completely confidential and secure.",
    "advantages.fast.title": "Fast",
    "advantages.fast.desc": "Get legal answers in seconds, not hours or days.",
    "advantages.support.title": "24/7 Support",
    "advantages.support.desc": "Our AI legal assistant is always available to help you.",
    "advantages.cost.title": "90% Cost Reduction",
    "advantages.cost.desc": "Save significantly on legal consultation fees.",

    // Chat Interface
    "chat.title": "Ask Nyay Sarthi",
    "chat.greeting": "Hello! I'm your AI legal assistant. How can I help you with Indian law today?",
    "chat.propertyDispute": "Property Dispute Help",
    "chat.consumerRights": "Consumer Rights Query",
    "chat.familyLaw": "Family Law Guidance",
    "chat.placeholder": "Type your legal question...",
    "chat.disclaimer":
      "Nyay Sarthi provides general legal information. Consult a qualified lawyer for specific legal advice.",

    // Precedent Finder
    "precedent.title": "Precedent Finder",
    "precedent.subtitle": "Search through thousands of Indian legal precedents and case laws",
    "precedent.searchPlaceholder": "Search for cases, laws, or legal concepts...",
    "precedent.search": "Search",
    "precedent.searching": "Searching...",
    "precedent.categories": "Categories",
    "precedent.results": "Search Results",
    "precedent.relevant": "Relevant",
    "precedent.caseDetails": "Case Details",
    "precedent.parties": "Parties",
    "precedent.petitioner": "Petitioner",
    "precedent.respondent": "Respondent",
    "precedent.judges": "Judges",
    "precedent.keyPoints": "Key Points",
    "precedent.downloadFull": "Download Full Judgment",
    "precedent.selectCase": "Select a case to view details",
    "precedent.recentSearches": "Recent Searches",
    "precedent.trending": "Trending Cases",
  },
  hi: {
    // Navigation & Common
    "nav.home": "होम",
    "nav.features": "विशेषताएं",
    "nav.about": "हमारे बारे में",
    "nav.contact": "संपर्क",
    "common.tryFree": "मुफ्त में आज़माएं",
    "common.learnMore": "और जानें",
    "common.startConsultation": "कानूनी परामर्श शुरू करें",
    "common.askQuestion": "प्रश्न पूछें",

    // Authentication
    "auth.login": "लॉगिन",
    "auth.signup": "साइन अप",
    "auth.loginSubtitle": "न्याय सारथी में वापस स्वागत है",
    "auth.signupSubtitle": "हजारों कानूनी पेशेवरों से जुड़ें",
    "auth.fullName": "पूरा नाम",
    "auth.email": "ईमेल पता",
    "auth.password": "पासवर्ड",
    "auth.role": "भूमिका",
    "auth.citizen": "नागरिक",
    "auth.lawyer": "वकील",
    "auth.judge": "न्यायाधीश",
    "auth.enterName": "अपना पूरा नाम दर्ज करें",
    "auth.enterEmail": "अपना ईमेल पता दर्ज करें",
    "auth.enterPassword": "अपना पासवर्ड दर्ज करें",
    "auth.processing": "प्रसंस्करण...",
    "auth.noAccount": "कोई खाता नहीं है?",
    "auth.haveAccount": "पहले से खाता है?",

    // Hero Section
    "hero.tagline": "भारत के लिए AI कानूनी सहायक",
    "hero.title": "न्याय सारथी",
    "hero.subtitle":
      "भारतीय कानून के लिए आपका व्यक्तिगत AI कानूनी सहायक। अंग्रेजी और हिंदी में तत्काल कानूनी सलाह, दस्तावेज़ सहायता और विशेषज्ञ मार्गदर्शन प्राप्त करें।",
    "hero.stats.queries": "कानूनी प्रश्न हल किए गए",
    "hero.stats.support": "उपलब्ध सहायता",
    "hero.stats.accuracy": "सटीकता दर",

    // Features
    "features.title": "कानूनी AI की विशेषताएं",
    "features.subtitle":
      "उन विशेषताओं का अन्वेषण करें जो आपकी उत्पादकता बढ़ाती हैं। दस्तावेज़ स्वचालन से लेकर उन्नत अनुसंधान तक, हमारे पास सबसे अच्छा काम है।",
    "features.aiChat.title": "AI-संचालित कानूनी चैट",
    "features.aiChat.desc": "भारतीय कानून पर प्रशिक्षित हमारे उन्नत AI के साथ अपने कानूनी प्रश्नों के तुरंत उत्तर पाएं।",
    "features.docAnalysis.title": "दस्तावेज़ विश्लेषण",
    "features.docAnalysis.desc": "अंतर्दृष्टि के लिए कानूनी दस्तावेज़, अनुबंध और समझौतों को अपलोड और विश्लेषण करें।",
    "features.availability.title": "24/7 उपलब्धता",
    "features.availability.desc": "कभी भी, कहीं भी कानूनी सहायता प्राप्त करें। कोई अपॉइंटमेंट की आवश्यकता नहीं।",
    "features.bilingual.title": "द्विभाषी समर्थन",
    "features.bilingual.desc": "अंग्रेजी या हिंदी में संवाद करें - जो भी आपके लिए सुविधाजनक हो।",
    "features.privacy.title": "गोपनीयता सुरक्षित",
    "features.privacy.desc": "आपके कानूनी परामर्श पूर्णतः गोपनीय और सुरक्षित हैं।",
    "features.instant.title": "तत्काल प्रतिक्रिया",
    "features.instant.desc": "दिनों में नहीं, सेकंडों में व्यापक कानूनी मार्गदर्शन प्राप्त करें।",

    // Target Audience
    "audience.title": "न्याय सारथी किसके लिए है?",
    "audience.subtitle":
      "चाहे आप एक उपभोक्ता हों, एक छात्र हों, एक एकल वकील हों, या एक लॉ फर्म हों - न्याय सारथी आपकी कानूनी आवश्यकताओं के अनुकूल है और आपकी उत्पादकता बढ़ाता है।",
    "audience.consumers.title": "कानूनी उपभोक्ताओं के लिए AI",
    "audience.consumers.desc": "व्यक्तिगत मामलों, संपत्ति विवादों और उपभोक्ता अधिकारों के लिए तत्काल कानूनी मार्गदर्शन प्राप्त करें।",
    "audience.lawyers.title": "वकीलों के लिए AI",
    "audience.lawyers.desc": "AI-संचालित अनुसंधान, मामले के विश्लेषण और दस्तावेज़ मसौदा तैयार करने के साथ अपनी प्रैक्टिस को बढ़ाएं।",
    "audience.firms.title": "लॉ फर्मों के लिए AI",
    "audience.firms.desc": "अपनी फर्म में संचालन को सुव्यवस्थित करें, ग्राहक सेवा में सुधार करें और दक्षता बढ़ाएं।",
    "audience.students.title": "कानून के छात्रों के लिए AI",
    "audience.students.desc": "AI ट्यूटरिंग, केस स्टडी और व्यापक कानूनी शिक्षा सहायता के साथ तेजी से सीखें।",

    // Advantages
    "advantages.title": "हमारा कानूनी AI क्यों बेहतर है?",
    "advantages.subtitle": "दूसरों के विपरीत, हमारा LegalTech सॉफ्टवेयर तेज़, आसान और खोज-अनुकूल है।",
    "advantages.private.title": "निजी",
    "advantages.private.desc": "आपके कानूनी परामर्श पूर्णतः गोपनीय और सुरक्षित रहते हैं।",
    "advantages.fast.title": "तेज़",
    "advantages.fast.desc": "घंटों या दिनों में नहीं, सेकंडों में कानूनी उत्तर प्राप्त करें।",
    "advantages.support.title": "24/7 सहायता",
    "advantages.support.desc": "हमारा AI कानूनी सहायक आपकी मदद के लिए हमेशा उपलब्ध है।",
    "advantages.cost.title": "90% लागत में कमी",
    "advantages.cost.desc": "कानूनी परामर्श शुल्क पर काफी बचत करें।",

    // Chat Interface
    "chat.title": "न्याय सारथी से पूछें",
    "chat.greeting": "नमस्ते! मैं आपका AI कानूनी सहायक हूं। आज मैं भारतीय कानून के बारे में आपकी कैसे मदद कर सकता हूं?",
    "chat.propertyDispute": "संपत्ति विवाद सहायता",
    "chat.consumerRights": "उपभोक्ता अधिकार प्रश्न",
    "chat.familyLaw": "पारिवारिक कानून मार्गदर्शन",
    "chat.placeholder": "अपना कानूनी प्रश्न टाइप करें...",
    "chat.disclaimer": "न्याय सारथी सामान्य कानूनी जानकारी प्रदान करता है। विशिष्ट कानूनी सलाह के लिए एक योग्य वकील से सलाह लें।",

    // Precedent Finder
    "precedent.title": "पूर्व निर्णय खोजक",
    "precedent.subtitle": "हजारों भारतीय कानूनी पूर्व निर्णयों और मामले कानूनों में खोजें",
    "precedent.searchPlaceholder": "मामले, कानून, या कानूनी अवधारणाओं की खोज करें...",
    "precedent.search": "खोजें",
    "precedent.searching": "खोज रहे हैं...",
    "precedent.categories": "श्रेणियां",
    "precedent.results": "खोज परिणाम",
    "precedent.relevant": "प्रासंगिक",
    "precedent.caseDetails": "मामले का विवरण",
    "precedent.parties": "पक्षकार",
    "precedent.petitioner": "याचिकाकर्ता",
    "precedent.respondent": "प्रतिवादी",
    "precedent.judges": "न्यायाधीश",
    "precedent.keyPoints": "मुख्य बिंदु",
    "precedent.downloadFull": "पूर्ण निर्णय डाउनलोड करें",
    "precedent.selectCase": "विवरण देखने के लिए एक मामला चुनें",
    "precedent.recentSearches": "हाल की खोजें",
    "precedent.trending": "ट्रेंडिंग मामले",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const savedLanguage = localStorage.getItem("nyay-sarthi-language") as Language
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "hi")) {
        setLanguage(savedLanguage)
      }
    } catch (error) {
      console.warn("Failed to load language from localStorage:", error)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem("nyay-sarthi-language", lang)
      }
    } catch (error) {
      console.warn("Failed to save language to localStorage:", error)
    }
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  // Provide context even before mounted to prevent errors
  const contextValue = { language, setLanguage: handleSetLanguage, t }

  return (
    <LanguageContext.Provider value={contextValue}>
      {mounted ? children : (
        <div style={{ visibility: 'hidden' }}>
          {children}
        </div>
      )}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Return a fallback context instead of throwing an error
    return {
      language: "en" as Language,
      setLanguage: () => {},
      t: (key: string) => key
    }
  }
  return context
}
