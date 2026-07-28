import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Cinzel, Geist_Mono, Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

import { CommandPalette } from "@/components/command-palette"
import { AppHeader } from "@/components/layout/app-header"
import { MobileTabBar } from "@/components/layout/mobile-tab-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { getSearchIndex } from "@/lib/db/queries/search-index"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
// Cinzel reads as carved Roman capitals — the game's own headline voice.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cinzel", display: "swap" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })

export const metadata: Metadata = {
  title: "Town Center — AoE2:DE Companion",
  description:
    "Complete reference guide for Age of Empires II: Definitive Edition with unit stats, civilizations, tech trees, and competitive data",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2ebdd" },
    { media: "(prefers-color-scheme: dark)", color: "#12100c" },
  ],
  viewportFit: "cover",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const searchIndex = await getSearchIndex()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppHeader />
          <CommandPalette items={searchIndex} />
          {/* Bottom padding clears the phone tab bar. */}
          <main className="min-h-[calc(100svh-3.5rem)] pb-16 md:pb-0">{children}</main>
          <MobileTabBar />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
