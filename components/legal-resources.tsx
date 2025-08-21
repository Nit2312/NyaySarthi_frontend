"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Scale, ArrowLeft, BookOpen, Gavel } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

const enhancedLegalResources = {
  acts: [
    {
      id: "1",
      title: "Indian Penal Code, 1860",
      titleHi: "भारतीय दंड संहिता, 1860",
      description:
        "The main criminal code of India covering all substantive aspects of criminal law including offenses against person, property, state, and public order.",
      descriptionHi:
        "भारत का मुख्य आपराधिक कोड जो व्यक्ति, संपत्ति, राज्य और सार्वजनिक व्यवस्था के खिलाफ अपराधों सहित आपराधिक कानून के सभी मूलभूत पहलुओं को कवर करता है।",
      category: "Criminal Law",
      categoryHi: "आपराधिक कानून",
      year: "1860",
      sections: "511 Sections",
      sectionsHi: "511 धाराएं",
      keyProvisions: "Murder (302), Theft (378), Rape (375), Dowry Death (304B)",
      keyProvisionsHi: "हत्या (302), चोरी (378), बलात्कार (375), दहेज मृत्यु (304B)",
    },
    {
      id: "2",
      title: "Consumer Protection Act, 2019",
      titleHi: "उपभोक्ता संरक्षण अधिनियम, 2019",
      description:
        "Comprehensive law for consumer protection with three-tier redressal mechanism and e-commerce regulations.",
      descriptionHi: "तीन-स्तरीय निवारण तंत्र और ई-कॉमर्स नियमों के साथ उपभोक्ता संरक्षण के लिए व्यापक कानून।",
      category: "Consumer Law",
      categoryHi: "उपभोक्ता कानून",
      year: "2019",
      sections: "107 Sections",
      sectionsHi: "107 धाराएं",
      keyProvisions: "Consumer Rights (2), Unfair Trade Practices (84), Product Liability (82)",
      keyProvisionsHi: "उपभोक्ता अधिकार (2), अनुचित व्यापार प्रथाएं (84), उत्पाद दायित्व (82)",
    },
    {
      id: "3",
      title: "Transfer of Property Act, 1882",
      titleHi: "संपत्ति हस्तांतरण अधिनियम, 1882",
      description: "Governs transfer of immovable property including sale, mortgage, lease, exchange, and gift.",
      descriptionHi: "बिक्री, बंधक, पट्टा, विनिमय और उपहार सहित अचल संपत्ति के हस्तांतरण को नियंत्रित करता है।",
      category: "Property Law",
      categoryHi: "संपत्ति कानून",
      year: "1882",
      sections: "137 Sections",
      sectionsHi: "137 धाराएं",
      keyProvisions: "Sale (54), Mortgage (58), Lease (105), Gift (122)",
      keyProvisionsHi: "बिक्री (54), बंधक (58), पट्टा (105), उपहार (122)",
    },
    {
      id: "4",
      title: "Code of Criminal Procedure, 1973",
      titleHi: "दंड प्रक्रिया संहिता, 1973",
      description: "Procedural law for criminal cases including investigation, trial, bail, and appeals.",
      descriptionHi: "जांच, मुकदमा, जमानत और अपील सहित आपराधिक मामलों के लिए प्रक्रियात्मक कानून।",
      category: "Criminal Law",
      categoryHi: "आपराधिक कानून",
      year: "1973",
      sections: "484 Sections",
      sectionsHi: "484 धाराएं",
      keyProvisions: "FIR (154), Arrest (41), Bail (436), Trial (225)",
      keyProvisionsHi: "FIR (154), गिरफ्तारी (41), जमानत (436), मुकदमा (225)",
    },
    {
      id: "5",
      title: "Right to Information Act, 2005",
      titleHi: "सूचना का अधिकार अधिनियम, 2005",
      description: "Empowers citizens to access information from public authorities to promote transparency.",
      descriptionHi: "पारदर्शिता को बढ़ावा देने के लिए नागरिकों को सार्वजनिक प्राधिकरणों से जानकारी प्राप्त करने का अधिकार देता है।",
      category: "Constitutional Law",
      categoryHi: "संवैधानिक कानून",
      year: "2005",
      sections: "31 Sections",
      sectionsHi: "31 धाराएं",
      keyProvisions: "Right to Information (3), Time Limits (7), Exemptions (8)",
      keyProvisionsHi: "सूचना का अधिकार (3), समय सीमा (7), छूट (8)",
    },
  ],
  caseLaws: [
    {
      id: "1",
      title: "Kesavananda Bharati v. State of Kerala",
      titleHi: "केशवानंद भारती बनाम केरल राज्य",
      description:
        "Landmark case establishing the basic structure doctrine - Parliament cannot amend the Constitution to destroy its basic features.",
      descriptionHi:
        "मूल ढांचे के सिद्धांत को स्थापित करने वाला ऐतिहासिक मामला - संसद संविधान की मूल विशेषताओं को नष्ट करने के लिए संविधान में संशोधन नहीं कर सकती।",
      court: "Supreme Court of India",
      courtHi: "भारत का सर्वोच्च न्यायालय",
      year: "1973",
      citation: "AIR 1973 SC 1461",
      significance: "Constitutional Law - Basic Structure Doctrine",
      significanceHi: "संवैधानिक कानून - मूल ढांचा सिद्धांत",
    },
    {
      id: "2",
      title: "Vishaka v. State of Rajasthan",
      titleHi: "विशाखा बनाम राजस्थान राज्य",
      description:
        "Established guidelines for prevention of sexual harassment at workplace until specific legislation was enacted.",
      descriptionHi: "विशिष्ट कानून बनने तक कार्यस्थल पर यौन उत्पीड़न की रोकथाम के लिए दिशानिर्देश स्थापित किए।",
      court: "Supreme Court of India",
      courtHi: "भारत का सर्वोच्च न्यायालय",
      year: "1997",
      citation: "AIR 1997 SC 3011",
      significance: "Women's Rights - Workplace Safety",
      significanceHi: "महिला अधिकार - कार्यस्थल सुरक्षा",
    },
    {
      id: "3",
      title: "Maneka Gandhi v. Union of India",
      titleHi: "मेनका गांधी बनाम भारत संघ",
      description:
        "Expanded Article 21 to include right to travel abroad and established that procedure must be fair, just and reasonable.",
      descriptionHi:
        "अनुच्छेद 21 का विस्तार करके विदेश यात्रा के अधिकार को शामिल किया और स्थापित किया कि प्रक्रिया निष्पक्ष, न्यायसंगत और उचित होनी चाहिए।",
      court: "Supreme Court of India",
      courtHi: "भारत का सर्वोच्च न्यायालय",
      year: "1978",
      citation: "AIR 1978 SC 597",
      significance: "Constitutional Law - Right to Life and Liberty",
      significanceHi: "संवैधानिक कानून - जीवन और स्वतंत्रता का अधिकार",
    },
    {
      id: "4",
      title: "Shah Bano v. Mohammed Ahmed Khan",
      titleHi: "शाह बानो बनाम मोहम्मद अहमद खान",
      description: "Landmark case on maintenance rights of Muslim women under Section 125 CrPC vs. personal law.",
      descriptionHi: "धारा 125 CrPC बनाम व्यक्तिगत कानून के तहत मुस्लिम महिलाओं के भरण-पोषण अधिकारों पर ऐतिहासिक मामला।",
      court: "Supreme Court of India",
      courtHi: "भारत का सर्वोच्च न्यायालय",
      year: "1985",
      citation: "AIR 1985 SC 945",
      significance: "Family Law - Women's Rights",
      significanceHi: "पारिवारिक कानून - महिला अधिकार",
    },
  ],
  guides: [
    {
      id: "1",
      title: "Complete Guide to Filing FIR in India",
      titleHi: "भारत में FIR दर्ज करने की पूर्ण गाइड",
      description:
        "Comprehensive step-by-step guide covering when, where, and how to file FIR, your rights, and what happens after filing.",
      descriptionHi: "कब, कहाँ और कैसे FIR दर्ज करें, आपके अधिकार, और दाखिल करने के बाद क्या होता है, इसकी व्यापक चरणबद्ध गाइड।",
      category: "Criminal Law",
      categoryHi: "आपराधिक कानून",
      readTime: "10 min read",
      readTimeHi: "10 मिनट पढ़ें",
      topics: "FIR Process, Police Rights, Legal Remedies, Online FIR",
      topicsHi: "FIR प्रक्रिया, पुलिस अधिकार, कानूनी उपाय, ऑनलाइन FIR",
    },
    {
      id: "2",
      title: "Property Registration in India: Complete Process",
      titleHi: "भारत में संपत्ति पंजीकरण: पूर्ण प्रक्रिया",
      description:
        "Detailed guide on property registration including documents required, stamp duty, registration fees, and state-wise variations.",
      descriptionHi: "आवश्यक दस्तावेज, स्टाम्प ड्यूटी, पंजीकरण शुल्क और राज्यवार भिन्नताओं सहित संपत्ति पंजीकरण पर विस्तृत गाइड।",
      category: "Property Law",
      categoryHi: "संपत्ति कानून",
      readTime: "15 min read",
      readTimeHi: "15 मिनट पढ़ें",
      topics: "Registration Process, Stamp Duty, Title Verification, Legal Documents",
      topicsHi: "पंजीकरण प्रक्रिया, स्टाम्प ड्यूटी, शीर्षक सत्यापन, कानूनी दस्तावेज",
    },
    {
      id: "3",
      title: "Consumer Rights and Complaint Process",
      titleHi: "उपभोक्ता अधिकार और शिकायत प्रक्रिया",
      description:
        "Know your consumer rights under the new Consumer Protection Act 2019 and how to file complaints effectively.",
      descriptionHi: "नए उपभोक्ता संरक्षण अधिनियम 2019 के तहत अपने उपभोक्ता अधिकारों को जानें और प्रभावी रूप से शिकायत कैसे दर्ज करें।",
      category: "Consumer Law",
      categoryHi: "उपभोक्ता कानून",
      readTime: "12 min read",
      readTimeHi: "12 मिनट पढ़ें",
      topics: "Consumer Rights, Filing Complaints, Redressal Forums, E-commerce Issues",
      topicsHi: "उपभोक्ता अधिकार, शिकायत दर्ज करना, निवारण फोरम, ई-कॉमर्स मुद्दे",
    },
    {
      id: "4",
      title: "Divorce Laws in India: Hindu Marriage Act Guide",
      titleHi: "भारत में तलाक कानून: हिंदू विवाह अधिनियम गाइड",
      description:
        "Complete guide to divorce under Hindu Marriage Act including grounds, procedure, alimony, and child custody.",
      descriptionHi: "आधार, प्रक्रिया, गुजारा भत्ता और बाल हिरासत सहित हिंदू विवाह अधिनियम के तहत तलाक की पूर्ण गाइड।",
      category: "Family Law",
      categoryHi: "पारिवारिक कानून",
      readTime: "18 min read",
      readTimeHi: "18 मिनट पढ़ें",
      topics: "Divorce Grounds, Court Procedure, Maintenance, Child Custody",
      topicsHi: "तलाक के आधार, न्यायालय प्रक्रिया, भरण-पोषण, बाल हिरासत",
    },
  ],
}

export function LegalResources() {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("acts")

  const filterResources = (resources: any[]) => {
    if (!searchQuery) return resources
    return resources.filter(
      (resource) =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.titleHi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.descriptionHi?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-8 floating-element">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="glass">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-dm-sans">
                  {language === "en" ? "Indian Legal Resources" : "भारतीय कानूनी संसाधन"}
                </h1>
                <p className="text-muted-foreground">
                  {language === "en"
                    ? "Comprehensive collection of Indian laws, landmark cases, and legal guides"
                    : "भारतीय कानूनों, ऐतिहासिक मामलों और कानूनी गाइडों का व्यापक संग्रह"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === "en" ? "Search Indian legal resources..." : "भारतीय कानूनी संसाधन खोजें..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass border-border/20"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass p-1 h-auto">
          <TabsTrigger value="acts" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            {language === "en" ? "Indian Acts & Laws" : "भारतीय अधिनियम और कानून"}
          </TabsTrigger>
          <TabsTrigger value="cases" className="flex items-center gap-2">
            <Gavel className="w-4 h-4" />
            {language === "en" ? "Landmark Cases" : "ऐतिहासिक मामले"}
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {language === "en" ? "Legal Guides" : "कानूनी गाइड"}
          </TabsTrigger>
        </TabsList>

        {/* Acts & Laws Tab */}
        {activeTab === "acts" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filterResources(enhancedLegalResources.acts).map((act) => (
              <div key={act.id} className="glass rounded-xl p-6 floating-element hover:scale-105 transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {language === "en" ? act.category : act.categoryHi}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2 font-dm-sans">
                  {language === "en" ? act.title : act.titleHi}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {language === "en" ? act.description : act.descriptionHi}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "en" ? "Year:" : "वर्ष:"}</span>
                    <span className="font-medium">{act.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "en" ? "Sections:" : "धाराएं:"}</span>
                    <span className="font-medium">{language === "en" ? act.sections : act.sectionsHi}</span>
                  </div>
                  <div className="pt-2 border-t border-border/20">
                    <p className="text-muted-foreground mb-1">
                      {language === "en" ? "Key Provisions:" : "मुख्य प्रावधान:"}
                    </p>
                    <p className="text-xs">{language === "en" ? act.keyProvisions : act.keyProvisionsHi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Case Laws Tab */}
        {activeTab === "cases" && (
          <div className="grid gap-6 md:grid-cols-2">
            {filterResources(enhancedLegalResources.caseLaws).map((caseItem) => (
              <div
                key={caseItem.id}
                className="glass rounded-xl p-6 floating-element hover:scale-105 transition-transform"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Gavel className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full">{caseItem.year}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2 font-dm-sans">
                  {language === "en" ? caseItem.title : caseItem.titleHi}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {language === "en" ? caseItem.description : caseItem.descriptionHi}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "en" ? "Court:" : "न्यायालय:"}</span>
                    <span className="font-medium">{language === "en" ? caseItem.court : caseItem.courtHi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "en" ? "Citation:" : "उद्धरण:"}</span>
                    <span className="font-medium font-mono">{caseItem.citation}</span>
                  </div>
                  <div className="pt-2 border-t border-border/20">
                    <p className="text-muted-foreground mb-1">{language === "en" ? "Significance:" : "महत्व:"}</p>
                    <p className="text-xs">{language === "en" ? caseItem.significance : caseItem.significanceHi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legal Guides Tab */}
        {activeTab === "guides" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filterResources(enhancedLegalResources.guides).map((guide) => (
              <div
                key={guide.id}
                className="glass rounded-xl p-6 floating-element hover:scale-105 transition-transform"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                    {language === "en" ? guide.readTime : guide.readTimeHi}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2 font-dm-sans">
                  {language === "en" ? guide.title : guide.titleHi}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {language === "en" ? guide.description : guide.descriptionHi}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "en" ? "Category:" : "श्रेणी:"}</span>
                    <span className="font-medium">{language === "en" ? guide.category : guide.categoryHi}</span>
                  </div>
                  <div className="pt-2 border-t border-border/20">
                    <p className="text-muted-foreground mb-1">
                      {language === "en" ? "Topics Covered:" : "कवर किए गए विषय:"}
                    </p>
                    <p className="text-xs">{language === "en" ? guide.topics : guide.topicsHi}</p>
                  </div>
                </div>
                <Button className="w-full mt-4 floating-element" size="sm">
                  {language === "en" ? "Read Guide" : "गाइड पढ़ें"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Tabs>

      {/* No Results */}
      {searchQuery &&
        ((activeTab === "acts" && filterResources(enhancedLegalResources.acts).length === 0) ||
          (activeTab === "cases" && filterResources(enhancedLegalResources.caseLaws).length === 0) ||
          (activeTab === "guides" && filterResources(enhancedLegalResources.guides).length === 0)) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {language === "en" ? "No results found" : "कोई परिणाम नहीं मिला"}
            </h3>
            <p className="text-muted-foreground">
              {language === "en"
                ? "Try adjusting your search terms or browse different categories"
                : "अपने खोज शब्दों को समायोजित करने या विभिन्न श्रेणियों को ब्राउज़ करने का प्रयास करें"}
            </p>
          </div>
        )}
    </div>
  )
}
