"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FileText,
  ImageIcon,
  File,
  Trash2,
  Eye,
  Download,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Scale,
  Shield,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import { incLocalStat } from "@/lib/local-stats"

interface UploadedDocument {
  id: string
  name: string
  type: string
  size: number
  uploadDate: Date
  status: "processing" | "completed" | "error"
  category?: string
  analysis?: string
  preview?: string
}

const mockDocuments: UploadedDocument[] = [
  {
    id: "1",
    name: "Property_Agreement_Draft.pdf",
    type: "application/pdf",
    size: 2456789,
    uploadDate: new Date(Date.now() - 86400000),
    status: "completed",
    category: "Property Law",
    analysis:
      "This property agreement contains standard clauses for property transfer. Key points reviewed include ownership transfer, payment terms, and legal compliance.",
    preview: "/images/document-preview.png",
  },
  {
    id: "2",
    name: "Consumer_Complaint_Form.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 1234567,
    uploadDate: new Date(Date.now() - 172800000),
    status: "completed",
    category: "Consumer Law",
    analysis:
      "Consumer complaint form is properly structured with all required fields. Suggestions provided for strengthening the complaint.",
  },
  {
    id: "3",
    name: "Legal_Notice_Template.pdf",
    type: "application/pdf",
    size: 987654,
    uploadDate: new Date(Date.now() - 259200000),
    status: "processing",
    category: "General",
  },
]

export function DocumentUploadInterface() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const [documents, setDocuments] = useState<UploadedDocument[]>(mockDocuments)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(async (file) => {
      const newDoc: UploadedDocument = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date(),
        status: "processing",
      }

      setDocuments((prev) => [newDoc, ...prev])
      setUploadProgress((prev) => ({ ...prev, [newDoc.id]: 10 }))

      // Real upload to Next.js proxy -> backend
      try {
        const form = new FormData()
        form.append('file', file)
        // Optional: pass a short description or goal
        form.append('description', 'Analyze and suggest legal improvements')

        const res = await fetch('/api/analyze-document', {
          method: 'POST',
          body: form,
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.success) {
          throw new Error(data?.detail || data?.error || `Upload failed (${res.status})`)
        }

        const advice = data.advice || {}
        const adviceSummary: string = advice.summary || 'Analysis complete.'
        const improvements: string[] = Array.isArray(advice.improvements) ? advice.improvements : []
        const issues: string[] = Array.isArray(advice.issues) ? advice.issues : []

        setUploadProgress((prev) => ({ ...prev, [newDoc.id]: 100 }))
        setDocuments((docs) =>
          docs.map((doc) =>
            doc.id === newDoc.id
              ? {
                  ...doc,
                  status: 'completed',
                  category: 'Analyzed',
                  analysis: [adviceSummary, ...improvements.map((i: string) => `• ${i}`), ...issues.map((i: string) => `! ${i}`)]
                    .filter(Boolean)
                    .join('\n'),
                }
              : doc,
          ),
        )
        try { incLocalStat(user?.id, 'docs') } catch {}
      } catch (e: any) {
        setDocuments((docs) =>
          docs.map((doc) =>
            doc.id === newDoc.id
              ? { ...doc, status: 'error', analysis: e?.message || 'Upload failed' }
              : doc,
          ),
        )
      }
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />
    if (type.includes("image")) return <ImageIcon className="w-8 h-8 text-blue-500" />
    if (type.includes("word") || type.includes("document")) return <FileText className="w-8 h-8 text-blue-600" />
    return <File className="w-8 h-8 text-gray-500" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[id]
      return newProgress
    })
  }

  return (
    <div className="space-y-6">
      <div className="glass-ultra rounded-3xl p-8 glow-medium border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-premium text-glow mb-4">
            {language === "en" ? "Document Upload & Analysis" : "दस्तावेज़ अपलोड और विश्लेषण"}
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            {language === "en"
              ? "Upload your legal documents for AI-powered analysis and insights"
              : "AI-संचालित विश्लेषण और अंतर्दृष्टि के लिए अपने कानूनी दस्तावेज़ अपलोड करें"}
          </p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? "border-primary bg-primary/5 glow-strong"
              : "border-white/20 glass hover:border-white/40 hover:glow-subtle"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center glow-medium floating-element">
              <Upload className="w-12 h-12 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-premium mb-2">
                {language === "en" ? "Drop your documents here" : "अपने दस्तावेज़ यहाँ छोड़ें"}
              </h3>
              <p className="text-muted-foreground font-medium mb-4">
                {language === "en" ? "or click to browse and select files" : "या फ़ाइलें ब्राउज़ करने और चुनने के लिए क्लिक करें"}
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="glass border-white/20">
                  PDF
                </Badge>
                <Badge variant="outline" className="glass border-white/20">
                  DOC
                </Badge>
                <Badge variant="outline" className="glass border-white/20">
                  DOCX
                </Badge>
                <Badge variant="outline" className="glass border-white/20">
                  TXT
                </Badge>
                <Badge variant="outline" className="glass border-white/20">
                  JPG
                </Badge>
                <Badge variant="outline" className="glass border-white/20">
                  PNG
                </Badge>
              </div>
            </div>
            <Button
              size="lg"
              className="glass-strong glow-medium hover:glow-strong transition-all duration-300 px-8 py-4"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="w-5 h-5 mr-2" />
              {language === "en" ? "Choose Files" : "फ़ाइलें चुनें"}
            </Button>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-ultra glow-subtle border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-medium">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-base mb-2 text-premium">
                {language === "en" ? "AI Analysis" : "AI विश्लेषण"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en"
                  ? "Advanced AI reviews your documents for legal insights"
                  : "उन्नत AI कानूनी अंतर्दृष्टि के लिए आपके दस्तावेज़ों की समीक्षा करता है"}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-ultra glow-subtle border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-medium">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-base mb-2 text-premium">
                {language === "en" ? "Secure Storage" : "सुरक्षित भंडारण"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en"
                  ? "Your documents are encrypted and stored securely"
                  : "आपके दस्तावेज़ एन्क्रिप्टेड और सुरक्षित रूप से संग्रहीत हैं"}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-ultra glow-subtle border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-medium">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-base mb-2 text-premium">
                {language === "en" ? "Legal Compliance" : "कानूनी अनुपालन"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en"
                  ? "Check compliance with Indian legal standards"
                  : "भारतीय कानूनी मानकों के साथ अनुपालन की जांच करें"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="glass-ultra p-2 h-auto glow-medium border border-white/20">
          <TabsTrigger value="all" className="flex items-center gap-3 px-6 py-3 text-base font-medium">
            <FileText className="w-5 h-5" />
            {language === "en" ? "All Documents" : "सभी दस्तावेज़"}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-3 px-6 py-3 text-base font-medium">
            <CheckCircle className="w-5 h-5" />
            {language === "en" ? "Analyzed" : "विश्लेषित"}
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-3 px-6 py-3 text-base font-medium">
            <Clock className="w-5 h-5" />
            {language === "en" ? "Processing" : "प्रसंस्करण"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="glass-ultra glow-medium border border-white/20 hover:glow-strong transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center glow-subtle">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-base text-premium">{doc.name}</h3>
                        {getStatusIcon(doc.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span>{doc.uploadDate.toLocaleDateString()}</span>
                        {doc.category && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs glass border-white/20">
                              {doc.category}
                            </Badge>
                          </>
                        )}
                      </div>
                      {uploadProgress[doc.id] !== undefined && uploadProgress[doc.id] < 100 && (
                        <div className="w-64">
                          <Progress value={uploadProgress[doc.id]} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {language === "en" ? "Uploading..." : "अपलोड हो रहा है..."} {uploadProgress[doc.id]}%
                          </p>
                        </div>
                      )}
                      {doc.analysis && <p className="text-sm text-muted-foreground max-w-2xl">{doc.analysis}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="glass glow-subtle hover:glow-medium transition-all"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="glass glow-subtle hover:glow-medium transition-all">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="glass glow-subtle hover:glow-medium transition-all text-red-400 hover:text-red-300"
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {documents
            .filter((doc) => doc.status === "completed")
            .map((doc) => (
              <Card
                key={doc.id}
                className="glass-ultra glow-medium border border-white/20 hover:glow-strong transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center glow-subtle">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-base text-premium">{doc.name}</h3>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{doc.uploadDate.toLocaleDateString()}</span>
                          {doc.category && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs glass border-white/20">
                                {doc.category}
                              </Badge>
                            </>
                          )}
                        </div>
                        {doc.analysis && <p className="text-sm text-muted-foreground max-w-2xl">{doc.analysis}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="glass glow-subtle hover:glow-medium transition-all"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="glass glow-subtle hover:glow-medium transition-all">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="glass glow-subtle hover:glow-medium transition-all text-red-400 hover:text-red-300"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          {documents
            .filter((doc) => doc.status === "processing")
            .map((doc) => (
              <Card
                key={doc.id}
                className="glass-ultra glow-medium border border-white/20 hover:glow-strong transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center glow-subtle">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-base text-premium">{doc.name}</h3>
                          <Clock className="w-5 h-5 text-yellow-500 animate-spin" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{doc.uploadDate.toLocaleDateString()}</span>
                        </div>
                        {uploadProgress[doc.id] !== undefined && uploadProgress[doc.id] < 100 && (
                          <div className="w-64">
                            <Progress value={uploadProgress[doc.id]} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {language === "en" ? "Processing..." : "प्रसंस्करण..."} {uploadProgress[doc.id]}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="glass glow-subtle hover:glow-medium transition-all text-red-400 hover:text-red-300"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
