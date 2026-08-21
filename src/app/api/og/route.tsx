import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { GAME_NAME, SITE_NAME } from "@/lib/seo"

/**
 * The social card for every page, drawn on request rather than at build time —
 * ~530 entity pages is far too many images to bake. The output is immutable
 * for a given query string, so the CDN serves all but the first hit.
 */
export const revalidate = 604800 // a week

const SIZE = { width: 1200, height: 630 }

/** Long titles must wrap, not overflow — but a whole paragraph is not a card. */
function clamp(value: string | null, max: number): string {
  if (!value) return ""
  const trimmed = value.trim()
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const title = clamp(params.get("title"), 70) || SITE_NAME
  const subtitle = clamp(params.get("subtitle"), 150)
  const eyebrow = clamp(params.get("eyebrow"), 40) || GAME_NAME

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "linear-gradient(135deg, #0a0a0a 0%, #17140d 55%, #241d10 100%)",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      {/* A rule in the game's gold, so the card reads as one family across pages. */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 56, height: 6, background: "#d4a44c" }} />
        <div
          style={{
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#d4a44c",
          }}
        >
          {eyebrow}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: title.length > 34 ? 76 : 96, fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 32, lineHeight: 1.35, color: "#b8b2a7" }}>{subtitle}</div> : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 26 }}>
        <div style={{ color: "#fafafa", fontWeight: 600 }}>{SITE_NAME}</div>
        <div style={{ color: "#7d776c" }}>Age of Empires II: DE companion</div>
      </div>
    </div>,
    SIZE,
  )
}
