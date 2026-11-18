import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import sharp from "sharp"
import { GAME_NAME, SITE_NAME } from "@/lib/seo"
import { isSocialCardSection, SOCIAL_CARD_SIZE, type SocialCardSection } from "@/lib/seo/social-card"

type CardTheme = { ink: string; accent: string; glyph?: string }

const themes: Record<SocialCardSection, CardTheme> = {
  home: { ink: "#282621", accent: "#e5c795" },
  units: { ink: "#352624", accent: "#e6aa90", glyph: "M4 3v5l12 12m0-5-5 5m3-3 5 5m1-19v5l-6 6M7 15l5 5m-2-3-5 5" },
  civilizations: { ink: "#222d39", accent: "#b6cce6", glyph: "M6 22V3m0 1h14l-3 4 3 4H6" },
  buildings: { ink: "#352d20", accent: "#e3c28d", glyph: "M3 21V7h3v3h3V5h6v5h3V7h3v14H3Zm7 0v-6h4v6" },
  technologies: {
    ink: "#302838",
    accent: "#d3bcdb",
    glyph: "M5 4h11a3 3 0 0 1 3 3v13H8V7a3 3 0 1 0-6 0v1h6m3 3h5m-5 4h5",
  },
  "tech-tree": { ink: "#23322d", accent: "#a9d5ba", glyph: "M9 3h6v5H9zM3 16h6v5H3zm12 0h6v5h-6zM12 8v4m-6 4v-4h12v4" },
  counters: { ink: "#312824", accent: "#e7bb94", glyph: "M12 3a9 9 0 1 0 9 9m-9-4a4 4 0 1 0 4 4m-4 0 9-9m-4 0h4v4" },
  compare: { ink: "#253234", accent: "#a5d2d3", glyph: "M3 5h7v14H3zm11 0h7v14h-7zM5 9h3m8 0h3M5 13h3m8 0h3" },
  "compare-civilizations": { ink: "#2a2d3d", accent: "#c1c7e9", glyph: "M4 20V4h7L9 7l2 3H4m12 10V4h7l-2 3 2 3h-7" },
  battle: { ink: "#3a2427", accent: "#e8acb0", glyph: "M12 2 4 5v7c0 4 3 7 8 10 5-3 8-6 8-10V5l-8-3Zm0 5v10m-4-5h8" },
  changes: { ink: "#323426", accent: "#d6d8a5", glyph: "M5 3h10l4 4v14H5zM14 3v5h5M8 12h8m-8 4h6" },
  about: {
    ink: "#292b28",
    accent: "#d0cebf",
    glyph: "M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2v15",
  },
  offline: {
    ink: "#292c30",
    accent: "#c9d0db",
    glyph:
      "m3 3 18 18M3 9a15 15 0 0 1 4-2m4-1a15 15 0 0 1 10 3M6 13a10 10 0 0 1 5-2m4 0 3 2m-9 4a5 5 0 0 1 6 0m-3 4h.01",
  },
}

function clamp(value: string | null, max: number): string {
  const text = Array.from(value?.replace(/\s+/g, " ").trim() ?? "")
  if (text.length <= max) return text.join("")

  const prefix = text.slice(0, max - 1).join("")
  const lastSpace = prefix.lastIndexOf(" ")
  const endsMidWord = !/\s/.test(text[max - 1]) && lastSpace >= prefix.length - 12
  return `${(endsMidWord ? prefix.slice(0, lastSpace) : prefix).trimEnd()}…`
}

async function readArtwork(path: string | null): Promise<string | undefined> {
  if (!path || !/^img\/(?:Buildings|Civs|Techs|Units)\/[a-z0-9_-]+\.webp$/i.test(path)) return

  try {
    const image = await readFile(join(process.cwd(), "public", path))
    const png = await sharp(image).resize(172, 172, { fit: "inside", kernel: "nearest" }).png().toBuffer()
    return `data:image/png;base64,${png.toString("base64")}`
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const section = params.get("section")
  const theme = themes[isSocialCardSection(section) ? section : "home"]
  const title = clamp(params.get("title"), 70) || SITE_NAME
  const subtitle = clamp(params.get("subtitle"), 132).replace(/(\d) (?=\p{L})/gu, "$1\u00a0")
  const eyebrow = clamp(params.get("eyebrow"), 48)
  const showEyebrow = eyebrow && !title.toLowerCase().includes(eyebrow.toLowerCase())
  const [cinzel, inter, artwork] = await Promise.all([
    readFile(join(process.cwd(), "src/app/api/og/Cinzel-SemiBold.ttf")),
    readFile(join(process.cwd(), "src/app/api/og/Inter-Regular.ttf")),
    readArtwork(params.get("artwork")),
  ])

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        padding: "65px 68px",
        gap: 44,
        color: "#26231e",
        fontFamily: "Inter",
        background: "linear-gradient(135deg, #f8f3e7, #e9decb)",
      }}
    >
      <div style={{ position: "absolute", top: 23, left: 23, width: 1154, height: 584, border: "1px solid #cfc1a9" }} />

      <div style={{ width: 650, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: theme.ink }}>
          <div
            style={{
              display: "flex",
              width: 42,
              height: 42,
              borderRadius: 9,
              background: theme.ink,
              color: "#fff5e4",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Cinzel",
              fontSize: 24,
            }}
          >
            II
          </div>
          <div style={{ fontSize: 19, letterSpacing: 2.1, textTransform: "uppercase" }}>
            {title === SITE_NAME ? GAME_NAME : SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", gap: 19 }}>
          {showEyebrow ? (
            <div style={{ fontSize: 20, color: "#625644", letterSpacing: 1.8, textTransform: "uppercase" }}>
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: "Cinzel",
              fontSize: title.length > 54 ? 44 : title.length > 34 ? 54 : title.length > 20 ? 66 : 83,
              letterSpacing: -1.9,
              lineHeight: 1.08,
              wordBreak: "break-word",
              lineClamp: 3,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                maxWidth: 580,
                fontSize: subtitle.length > 100 ? 25 : 28,
                lineHeight: 1.36,
                lineClamp: 3,
                color: "#5c5245",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {title !== SITE_NAME ? (
          <div style={{ fontSize: 18, letterSpacing: 1.2, color: "#625644" }}>{GAME_NAME}</div>
        ) : null}
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          width: 370,
          height: "100%",
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          background: `radial-gradient(circle at 50% 45%, ${theme.accent}44, transparent 76%), ${theme.ink}`,
          color: theme.accent,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 13,
            left: 13,
            width: 344,
            height: 474,
            border: `1px solid ${theme.accent}44`,
            borderRadius: 8,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 272,
            height: 272,
            border: `1px solid ${theme.accent}55`,
            borderRadius: 136,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 246,
            height: 246,
            border: `1px solid ${theme.accent}33`,
            borderRadius: 123,
          }}
        />
        {artwork ? (
          // ImageResponse needs a plain img with embedded bytes.
          // biome-ignore lint/performance/noImgElement: The card is rasterized on the server.
          <img src={artwork} width={172} height={172} style={{ borderRadius: 12, objectFit: "contain" }} alt="" />
        ) : theme.glyph ? (
          <svg width={128} height={128} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d={theme.glyph}
              stroke={theme.accent}
              strokeWidth={1.15}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div style={{ fontFamily: "Cinzel", fontSize: 160, lineHeight: 1 }}>II</div>
        )}
      </div>
    </div>,
    {
      ...SOCIAL_CARD_SIZE,
      fonts: [
        { name: "Cinzel", data: cinzel, weight: 600 },
        { name: "Inter", data: inter, weight: 400 },
      ],
      headers: { "Cache-Control": "public, max-age=0, s-maxage=604800, stale-while-revalidate=86400" },
    },
  )
}
