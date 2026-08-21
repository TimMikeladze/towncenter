import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Cinzel, Geist_Mono, Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

import { UmamiAnalytics } from "@/components/analytics/umami"
import { CommandPalette } from "@/components/command-palette"
import { AppHeader } from "@/components/layout/app-header"
import { MobileTabBar } from "@/components/layout/mobile-tab-bar"
import { RouteTransition } from "@/components/layout/route-transition"
import { ScrollMemory } from "@/components/layout/scroll-memory"
import { AppChrome } from "@/components/pwa/app-chrome"
import { ServiceWorker } from "@/components/pwa/service-worker"
import { TouchGestures } from "@/components/pwa/touch-gestures"
import { JsonLd } from "@/components/seo/json-ld"
import { ThemeProvider } from "@/components/theme-provider"
import { getSearchIndex } from "@/lib/db/queries/search-index"
import { REPO_URL } from "@/lib/navigation"
import {
  AUTHOR,
  absoluteUrl,
  GAME_NAME,
  GAME_REFERENCE,
  ogImageUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
// Cinzel reads as carved Roman capitals — the game's own headline voice.
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cinzel", display: "swap" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" })

export const metadata: Metadata = {
  // Every relative URL in this file and in every page's metadata — canonicals,
  // social cards, the manifest — is resolved against this. Without it Next
  // emits relative canonicals, which crawlers ignore.
  metadataBase: new URL(SITE_URL),
  title: {
    // Pages set only their own name; the suffix is added here so it can never
    // drift between routes or get doubled up.
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  authors: [AUTHOR],
  creator: AUTHOR.name,
  publisher: AUTHOR.name,
  category: "games",
  keywords: [
    "Age of Empires II",
    "AoE2",
    "AoE2 DE",
    "Age of Empires II Definitive Edition",
    "AoE2 unit stats",
    "AoE2 tech tree",
    "AoE2 civilizations",
    "AoE2 counters",
    "AoE2 build order reference",
    "Age of Empires 2 units",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Rich results and Discover need permission to show the full card art;
      // the defaults cap previews at a thumbnail.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: "en_US",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: ogImageUrl({ title: SITE_NAME, subtitle: SITE_DESCRIPTION, eyebrow: GAME_NAME }),
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [ogImageUrl({ title: SITE_NAME, subtitle: SITE_DESCRIPTION, eyebrow: GAME_NAME })],
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

/**
 * The site's own identity, stated once. Everything page-level (breadcrumbs, the
 * entity itself) is declared by the page; this is only the container they sit in.
 */
const SITE_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    alternateName: SITE_TITLE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    about: GAME_REFERENCE,
    author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    description: SITE_DESCRIPTION,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    codeRepository: REPO_URL,
    license: "https://opensource.org/licenses/MIT",
    author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
  },
]

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const searchIndex = await getSearchIndex()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable} ${geistMono.variable}`}>
        <JsonLd data={SITE_JSON_LD} />
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
          <UmamiAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
