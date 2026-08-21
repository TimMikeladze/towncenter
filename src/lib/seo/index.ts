/**
 * Everything the crawler-facing surface of the app shares: where the site
 * lives, what it calls itself, and the two builders — page metadata and
 * JSON-LD — that every route reaches for instead of hand-rolling its own tags.
 */
import type { Metadata } from "next"

const FALLBACK_SITE_URL = "https://towncenter-zeta.vercel.app"

/**
 * Canonical URLs, `metadataBase`, the sitemap and robots.txt all need one
 * absolute origin, and getting it wrong makes every canonical point at the
 * wrong host. `NEXT_PUBLIC_SITE_URL` wins so a custom domain can be pointed at
 * without a code change; Vercel's own production hostname covers the deploy
 * that has not been given one yet. Preview deployments deliberately resolve to
 * the production origin — a preview must never advertise itself as canonical.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, "")

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (production) return `https://${production.replace(/\/+$/, "")}`

  return FALLBACK_SITE_URL
}

export const SITE_URL = resolveSiteUrl()

export const SITE_NAME = "Town Center"

/** The game, spelled the way people search for it. */
export const GAME_NAME = "Age of Empires II: Definitive Edition"

export const SITE_TITLE = "Town Center — Age of Empires II: DE Companion"

export const SITE_DESCRIPTION =
  "Every Age of Empires II: Definitive Edition unit, civilization, building and technology with full stats — plus tech trees, computed counters, a battle simulator and patch-to-patch changes."

export const AUTHOR = { name: "Tim Mikeladze", url: "https://linesofcode.dev" }

/** Resolve an app path against the site origin. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString()
}

/**
 * Social cards are drawn on demand by `/api/og` rather than baked at build
 * time: there are ~530 entity pages, and rendering an image for each one would
 * cost more build minutes than the cards are worth. The CDN caches them.
 */
export function ogImageUrl(params: { title: string; subtitle?: string; eyebrow?: string }): string {
  const query = new URLSearchParams({ title: params.title })
  if (params.subtitle) query.set("subtitle", params.subtitle)
  if (params.eyebrow) query.set("eyebrow", params.eyebrow)
  return absoluteUrl(`/api/og?${query.toString()}`)
}

export interface PageMetadataInput {
  /** Page title without the site suffix — the layout's template adds it. */
  title: string
  description: string
  /** App-relative path, used for the canonical URL. */
  path: string
  /** Overrides the generated social card. */
  image?: string
  /** Card eyebrow, e.g. "Unit" or "Civilization". */
  eyebrow?: string
  /** Card headline; defaults to the page title. Detail pages pass the bare
   *  entity name, because the keyword tail that helps in a SERP only clutters
   *  a social card. */
  imageTitle?: string
  /** Card second line; defaults to the description. */
  imageSubtitle?: string
  noIndex?: boolean
}

/**
 * One page's worth of tags. Every route gets a canonical URL from this, which
 * is the whole point: the list pages carry filter state in the query string,
 * and without a canonical each `?type=Cavalry` view is a duplicate of the page
 * it filters.
 */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const url = absoluteUrl(input.path)
  const image =
    input.image ??
    ogImageUrl({
      title: input.imageTitle ?? input.title,
      subtitle: input.imageSubtitle ?? input.description,
      eyebrow: input.eyebrow,
    })

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title: input.title,
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  }
}

/** Google shows breadcrumbs in place of the URL, so every page below the root has them. */
export function breadcrumbList(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}

/** The game itself, referenced by every entity page as the thing it is part of. */
export const GAME_REFERENCE = {
  "@type": "VideoGame",
  name: GAME_NAME,
  alternateName: "AoE2: DE",
  gamePlatform: ["PC", "Xbox", "PlayStation"],
  applicationCategory: "Game",
  publisher: { "@type": "Organization", name: "Xbox Game Studios" },
}

/**
 * A game unit is not a product, an article or a person, and schema.org has no
 * type for it. `Thing` with the stats as `additionalProperty` is the honest
 * mapping: it says what the page is about and hands over the numbers without
 * claiming a shape the data does not have.
 */
export function entityThing(input: {
  name: string
  description: string
  path: string
  image?: string | null
  category?: string
  properties?: { name: string; value: string | number }[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    ...(input.category ? { additionalType: input.category } : {}),
    isPartOf: GAME_REFERENCE,
    ...(input.properties?.length
      ? {
          additionalProperty: input.properties.map((property) => ({
            "@type": "PropertyValue",
            name: property.name,
            value: property.value,
          })),
        }
      : {}),
  }
}
