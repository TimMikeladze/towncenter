import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Cinzel, Geist_Mono, Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

import { CommandPalette } from "@/components/command-palette"
import { AppHeader } from "@/components/layout/app-header"
import { MobileTabBar } from "@/components/layout/mobile-tab-bar"
import { RouteTransition } from "@/components/layout/route-transition"
import { ScrollMemory } from "@/components/layout/scroll-memory"
import { AppChrome } from "@/components/pwa/app-chrome"
import { ServiceWorker } from "@/components/pwa/service-worker"
import { TouchGestures } from "@/components/pwa/touch-gestures"
import { ThemeProvider } from "@/components/theme-provider"
import { getSearchIndex } from "@/lib/db/queries/search-index"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
// Cinzel reads as carved Roman capitals — the game's own headline voice.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cinzel", display: "swap" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })

const DESCRIPTION =
  "Complete reference guide for Age of Empires II: Definitive Edition with unit stats, civilizations, tech trees, and competitive data"

export const metadata: Metadata = {
  title: "Town Center — AoE2:DE Companion",
  description: DESCRIPTION,
  applicationName: "Town Center",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Town Center",
    // Translucent lets the page background run under the status bar instead
    // of leaving a strip of the wrong shade above the header.
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    // Unit stats are full of numbers; without this iOS turns them into phone links.
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  openGraph: {
    type: "website",
    siteName: "Town Center",
    title: "Town Center — AoE2:DE Companion",
    description: DESCRIPTION,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The layout is built for the phone's own width. Zooming it only ever means
  // the layout failed, and a zoomed page misplaces every fixed element.
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  viewportFit: "cover",
  // The on-screen keyboard shrinks the layout viewport, so sheets and their
  // inputs stay above it instead of hiding behind it.
  interactiveWidget: "resizes-content",
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
          <AppChrome />
          <ServiceWorker />
          {/*
            The app shell: a full-height column that cannot scroll. The header
            and the tab bar are flow children of it rather than fixed overlays,
            so they hold their edges without depending on iOS agreeing with us
            about where the viewport is. Only the pane between them scrolls.
          */}
          <div className="flex h-full flex-col overflow-hidden">
            <AppHeader />
            {/*
              The viewport clips the pane, which the gestures slide around
              inside it, and gives the pull-to-refresh indicator something
              stationary to hide behind.
            */}
            <div className="app-viewport">
              <TouchGestures targetId="app-scroll" />
              <main id="app-scroll" className="app-scroll px-safe">
                <RouteTransition>{children}</RouteTransition>
              </main>
            </div>
            <MobileTabBar />
          </div>
          <ScrollMemory targetId="app-scroll" />
          <CommandPalette items={searchIndex} />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
