import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // `/offline` is a service-worker fallback with no content of its own,
        // and `/api` serves social cards, not pages.
        disallow: ["/offline", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  }
}
