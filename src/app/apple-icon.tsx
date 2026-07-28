import { ImageResponse } from "next/og"

// iOS will not take an SVG for a home-screen icon, so the one PNG the platform
// needs is generated here rather than checked in as a binary. Next injects the
// <link rel="apple-touch-icon"> automatically.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  const bar = { backgroundColor: "#fafafa", borderRadius: 2 }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        // Opaque: iOS composites home-screen icons on white otherwise.
        background: "linear-gradient(180deg, #1c1c1c 0%, #050505 100%)",
      }}
    >
      {[0, 1].map((column) => (
        <div
          key={column}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 30,
          }}
        >
          <div style={{ ...bar, width: 30, height: 8 }} />
          <div style={{ ...bar, width: 14, height: 60 }} />
          <div style={{ ...bar, width: 30, height: 8 }} />
        </div>
      ))}
    </div>,
    size,
  )
}
