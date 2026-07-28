import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import type React from "react"
import "./globals.css"

import { Geist_Mono as V0_Font_Geist_Mono } from "next/font/google"
import { AppNav } from "@/components/app-nav"
import { CommandPalette } from "@/components/command-palette"
import { ThemeProvider } from "@/components/theme-provider"
import { getSearchIndex } from "@/lib/db/queries/search-index"

// Initialize fonts
const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "AoE2:DE Companion - Complete Reference Guide",
  description:
    "Complete reference guide for Age of Empires II: Definitive Edition with unit stats, civilizations, tech trees, and competitive data",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const searchIndex = await getSearchIndex()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppNav />
          <CommandPalette items={searchIndex} />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
