import type React from "react"
import type { Metadata } from "next"
import { Inter, DM_Sans } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import { UserDataProvider } from "@/lib/user-data-service"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Nyay Sarthi - AI Legal Assistant for India",
  description:
    "Your personal AI legal assistant for Indian law. Get instant legal advice, document help, and expert guidance in English and Hindi.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable}`} suppressHydrationWarning={true}>
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          <LanguageProvider>
            <UserDataProvider>
              {children}
              <Toaster />
            </UserDataProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
