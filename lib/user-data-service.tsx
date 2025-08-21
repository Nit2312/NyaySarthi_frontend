"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

export interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  category?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface UploadedDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  status: "processing" | "completed" | "failed"
  analysis?: {
    summary: string
    keyPoints: string[]
    riskLevel: "low" | "medium" | "high"
  }
}

export interface SearchHistory {
  id: string
  query: string
  type: "precedent" | "legal" | "document"
  results: number
  timestamp: Date
}

export interface UserActivity {
  id: string
  type: "chat" | "upload" | "search" | "login"
  description: string
  timestamp: Date
  metadata?: any
}

interface UserData {
  chatSessions: ChatSession[]
  uploadedDocuments: UploadedDocument[]
  searchHistory: SearchHistory[]
  recentActivity: UserActivity[]
  preferences: {
    language: "en" | "hi"
    notifications: boolean
    theme: "light" | "dark"
  }
}

interface UserDataContextType {
  userData: UserData
  addChatSession: (session: ChatSession) => void
  updateChatSession: (sessionId: string, messages: ChatMessage[]) => void
  addUploadedDocument: (document: UploadedDocument) => void
  updateDocumentStatus: (documentId: string, status: UploadedDocument["status"], analysis?: any) => void
  addSearchHistory: (search: SearchHistory) => void
  addActivity: (activity: Omit<UserActivity, "id" | "timestamp">) => void
  getRecentChats: () => ChatSession[]
  getRecentDocuments: () => UploadedDocument[]
  getRecentSearches: () => SearchHistory[]
  clearUserData: () => void
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined)

const defaultUserData: UserData = {
  chatSessions: [],
  uploadedDocuments: [],
  searchHistory: [],
  recentActivity: [],
  preferences: {
    language: "en",
    notifications: true,
    theme: "dark",
  },
}

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData>(defaultUserData)

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      const storedData = localStorage.getItem(`nyay-sarthi-data-${user.id}`)
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        // Convert date strings back to Date objects
        parsedData.chatSessions =
          parsedData.chatSessions?.map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages?.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          })) || []
        parsedData.uploadedDocuments =
          parsedData.uploadedDocuments?.map((doc: any) => ({
            ...doc,
            uploadedAt: new Date(doc.uploadedAt),
          })) || []
        parsedData.searchHistory =
          parsedData.searchHistory?.map((search: any) => ({
            ...search,
            timestamp: new Date(search.timestamp),
          })) || []
        parsedData.recentActivity =
          parsedData.recentActivity?.map((activity: any) => ({
            ...activity,
            timestamp: new Date(activity.timestamp),
          })) || []

        setUserData({ ...defaultUserData, ...parsedData })
      } else {
        // Initialize with some mock data for new users
        const mockData = generateMockUserData(user)
        setUserData(mockData)
        localStorage.setItem(`nyay-sarthi-data-${user.id}`, JSON.stringify(mockData))
      }
    } else {
      setUserData(defaultUserData)
    }
  }, [user])

  // Save user data whenever it changes
  useEffect(() => {
    if (user && userData !== defaultUserData) {
      localStorage.setItem(`nyay-sarthi-data-${user.id}`, JSON.stringify(userData))
    }
  }, [userData, user])

  const addChatSession = (session: ChatSession) => {
    setUserData((prev) => ({
      ...prev,
      chatSessions: [session, ...prev.chatSessions],
    }))
    addActivity({
      type: "chat",
      description: `Started new chat: ${session.title}`,
      metadata: { sessionId: session.id },
    })
  }

  const updateChatSession = (sessionId: string, messages: ChatMessage[]) => {
    setUserData((prev) => ({
      ...prev,
      chatSessions: prev.chatSessions.map((session) =>
        session.id === sessionId ? { ...session, messages, updatedAt: new Date() } : session,
      ),
    }))
  }

  const addUploadedDocument = (document: UploadedDocument) => {
    setUserData((prev) => ({
      ...prev,
      uploadedDocuments: [document, ...prev.uploadedDocuments],
    }))
    addActivity({
      type: "upload",
      description: `Uploaded document: ${document.name}`,
      metadata: { documentId: document.id },
    })
  }

  const updateDocumentStatus = (documentId: string, status: UploadedDocument["status"], analysis?: any) => {
    setUserData((prev) => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.map((doc) =>
        doc.id === documentId ? { ...doc, status, analysis } : doc,
      ),
    }))
  }

  const addSearchHistory = (search: SearchHistory) => {
    setUserData((prev) => ({
      ...prev,
      searchHistory: [search, ...prev.searchHistory.slice(0, 49)], // Keep last 50 searches
    }))
    addActivity({
      type: "search",
      description: `Searched for: ${search.query}`,
      metadata: { searchId: search.id, type: search.type },
    })
  }

  const addActivity = (activity: Omit<UserActivity, "id" | "timestamp">) => {
    const newActivity: UserActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setUserData((prev) => ({
      ...prev,
      recentActivity: [newActivity, ...prev.recentActivity.slice(0, 99)], // Keep last 100 activities
    }))
  }

  const getRecentChats = () => userData.chatSessions.slice(0, 5)
  const getRecentDocuments = () => userData.uploadedDocuments.slice(0, 5)
  const getRecentSearches = () => userData.searchHistory.slice(0, 5)

  const clearUserData = () => {
    if (user) {
      localStorage.removeItem(`nyay-sarthi-data-${user.id}`)
      setUserData(defaultUserData)
    }
  }

  return (
    <UserDataContext.Provider
      value={{
        userData,
        addChatSession,
        updateChatSession,
        addUploadedDocument,
        updateDocumentStatus,
        addSearchHistory,
        addActivity,
        getRecentChats,
        getRecentDocuments,
        getRecentSearches,
        clearUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const context = useContext(UserDataContext)
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider")
  }
  return context
}

// Generate mock data for new users
function generateMockUserData(user: any): UserData {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return {
    chatSessions: [
      {
        id: "1",
        title: "Property Dispute Query",
        createdAt: yesterday,
        updatedAt: yesterday,
        messages: [
          {
            id: "1",
            content: "I have a property dispute with my neighbor. What are my legal options?",
            isUser: true,
            timestamp: yesterday,
            category: "property",
          },
          {
            id: "2",
            content:
              "Based on Indian property law, you have several options including mediation, filing a civil suit, or approaching the local authorities. Let me explain each option in detail...",
            isUser: false,
            timestamp: yesterday,
          },
        ],
      },
      {
        id: "2",
        title: "Consumer Rights Question",
        createdAt: lastWeek,
        updatedAt: lastWeek,
        messages: [
          {
            id: "3",
            content: "What are my rights if a product I bought online is defective?",
            isUser: true,
            timestamp: lastWeek,
            category: "consumer",
          },
          {
            id: "4",
            content:
              "Under the Consumer Protection Act 2019, you have the right to seek replacement, refund, or compensation for defective products...",
            isUser: false,
            timestamp: lastWeek,
          },
        ],
      },
    ],
    uploadedDocuments: [
      {
        id: "1",
        name: "Property_Agreement.pdf",
        type: "application/pdf",
        size: 2048576,
        uploadedAt: yesterday,
        status: "completed",
        analysis: {
          summary: "Property purchase agreement with standard terms and conditions",
          keyPoints: [
            "Purchase price: ₹50,00,000",
            "Registration required within 30 days",
            "No legal disputes mentioned",
          ],
          riskLevel: "low",
        },
      },
      {
        id: "2",
        name: "Employment_Contract.docx",
        type: "application/docx",
        size: 1024768,
        uploadedAt: lastWeek,
        status: "completed",
        analysis: {
          summary: "Employment contract with competitive salary and benefits",
          keyPoints: ["6-month probation period", "Non-compete clause for 1 year", "Standard termination clauses"],
          riskLevel: "medium",
        },
      },
    ],
    searchHistory: [
      {
        id: "1",
        query: "Property dispute resolution",
        type: "precedent",
        results: 15,
        timestamp: yesterday,
      },
      {
        id: "2",
        query: "Consumer protection act 2019",
        type: "legal",
        results: 8,
        timestamp: lastWeek,
      },
    ],
    recentActivity: [
      {
        id: "1",
        type: "login",
        description: "Logged into Nyay Sarthi",
        timestamp: now,
      },
      {
        id: "2",
        type: "chat",
        description: "Started new chat: Property Dispute Query",
        timestamp: yesterday,
      },
      {
        id: "3",
        type: "upload",
        description: "Uploaded document: Property_Agreement.pdf",
        timestamp: yesterday,
      },
    ],
    preferences: {
      language: "en",
      notifications: true,
      theme: "dark",
    },
  }
}
