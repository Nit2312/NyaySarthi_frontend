"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { Search, BookOpen, Scale, Calendar, MapPin, User, Download, Eye, Star } from "lucide-react"

interface PrecedentCase {
  id: string
  title: string
  court: string
  date: string
  judges: string[]
  citation: string
  category: string
  relevanceScore: number
  summary: string
  keyPoints: string[]
  parties: {
    petitioner: string
    respondent: string
  }
}

export function PrecedentFinderInterface() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<PrecedentCase[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCase, setSelectedCase] = useState<PrecedentCase | null>(null)

  // Mock precedent cases data
  const mockCases: PrecedentCase[] = [
    {
      id: "1",
      title: "Vishaka v. State of Rajasthan",
      court: "Supreme Court of India",
      date: "1997-08-13",
      judges: ["Justice J.S. Verma", "Justice Sujata V. Manohar", "Justice B.N. Kirpal"],
      citation: "(1997) 6 SCC 241",
      category: "Constitutional Law",
      relevanceScore: 95,
      summary: "Landmark judgment establishing guidelines for prevention of sexual harassment at workplace.",
      keyPoints: [
        "Established Vishaka Guidelines for workplace harassment",
        "Recognized fundamental right to work with dignity",
        "Mandated formation of complaint committees",
      ],
      parties: {
        petitioner: "Vishaka and Others",
        respondent: "State of Rajasthan and Others",
      },
    },
    {
      id: "2",
      title: "K.S. Puttaswamy v. Union of India",
      court: "Supreme Court of India",
      date: "2017-08-24",
      judges: ["Justice J.S. Khehar", "Justice J. Chelameswar", "Justice S.A. Bobde"],
      citation: "(2017) 10 SCC 1",
      category: "Privacy Rights",
      relevanceScore: 92,
      summary: "Historic judgment recognizing privacy as a fundamental right under Article 21.",
      keyPoints: [
        "Privacy declared as fundamental right",
        "Four-fold test for privacy restrictions",
        "Impact on Aadhaar and data protection",
      ],
      parties: {
        petitioner: "Justice K.S. Puttaswamy (Retd.)",
        respondent: "Union of India",
      },
    },
    {
      id: "3",
      title: "Maneka Gandhi v. Union of India",
      court: "Supreme Court of India",
      date: "1978-01-25",
      judges: ["Justice P.N. Bhagwati", "Justice V.R. Krishna Iyer", "Justice N.L. Untwalia"],
      citation: "(1978) 1 SCC 248",
      category: "Constitutional Law",
      relevanceScore: 89,
      summary: "Expanded interpretation of Article 21 - Right to Life and Personal Liberty.",
      keyPoints: [
        "Expanded scope of Article 21",
        "Procedure established by law must be fair and reasonable",
        "Interconnectedness of fundamental rights",
      ],
      parties: {
        petitioner: "Maneka Gandhi",
        respondent: "Union of India",
      },
    },
  ]

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      const filteredCases = mockCases.filter(
        (case_) =>
          case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          case_.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          case_.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(filteredCases)
      setIsSearching(false)
    }, 1500)
  }

  const categories = [
    "Constitutional Law",
    "Criminal Law",
    "Civil Law",
    "Corporate Law",
    "Family Law",
    "Tax Law",
    "Labour Law",
    "Property Law",
  ]
  const courts = ["Supreme Court of India", "High Court", "District Court", "Tribunal"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white/3 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white/4 rounded-full blur-2xl animate-float"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-xl flex items-center justify-center glass-card">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                {t("precedent.title")}
              </h1>
              <p className="text-gray-400 mt-1">{t("precedent.subtitle")}</p>
            </div>
          </div>
        </div>

        <Card className="glass-card border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder={t("precedent.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 h-12"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-black border-white/20 h-12 px-8"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t("precedent.searching")}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    {t("precedent.search")}
                  </div>
                )}
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">{t("precedent.categories")}</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="cursor-pointer border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
                      onClick={() => {
                        setSelectedFilters((prev) =>
                          prev.includes(category) ? prev.filter((f) => f !== category) : [...prev, category],
                        )
                      }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {searchResults.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Results List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">
                {t("precedent.results")} ({searchResults.length})
              </h2>
              {searchResults.map((case_) => (
                <Card
                  key={case_.id}
                  className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedCase(case_)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-gray-200 transition-colors">
                          {case_.title}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">{case_.citation}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {case_.relevanceScore}% {t("precedent.relevant")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4" />
                        {case_.court}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        {new Date(case_.date).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{case_.summary}</p>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-white/20 text-gray-300">
                        {case_.category}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Case Details Sidebar */}
            <div className="lg:col-span-1">
              {selectedCase ? (
                <Card className="glass-card border-white/10 sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{t("precedent.caseDetails")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">{selectedCase.title}</h4>
                      <p className="text-gray-400 text-sm">{selectedCase.summary}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">{t("precedent.parties")}</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-400">{t("precedent.petitioner")}: </span>
                          <span className="text-white">{selectedCase.parties.petitioner}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{t("precedent.respondent")}: </span>
                          <span className="text-white">{selectedCase.parties.respondent}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">{t("precedent.judges")}</h4>
                      <div className="space-y-1">
                        {selectedCase.judges.map((judge, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                            <User className="w-3 h-3" />
                            {judge}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-2">{t("precedent.keyPoints")}</h4>
                      <ul className="space-y-1">
                        {selectedCase.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                            <div className="w-1 h-1 bg-white rounded-full mt-2 flex-shrink-0"></div>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <Button className="w-full bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        {t("precedent.downloadFull")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">{t("precedent.selectCase")}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {searchResults.length === 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t("precedent.recentSearches")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Constitutional Law Cases", "Privacy Rights", "Workplace Harassment", "Fundamental Rights"].map(
                  (search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span className="text-gray-300">{search}</span>
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  {t("precedent.trending")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockCases.slice(0, 3).map((case_, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <h4 className="text-white text-sm font-medium mb-1">{case_.title}</h4>
                    <p className="text-gray-400 text-xs">
                      {case_.court} • {new Date(case_.date).getFullYear()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
