import type { MetadataRoute } from "next"

/**
 * Installed as a standalone app, Town Center drops the browser chrome and
 * leans on its own header and tab bar. The shortcuts are the four routes the
 * tab bar exposes, so a long-press on the home-screen icon lands in the same
 * places a tap inside the app would.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Town Center — AoE2:DE Companion",
    short_name: "Town Center",
    description:
      "Every Age of Empires II: Definitive Edition unit, civilization, building, technology and tech tree — read straight from the game files.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait",
    background_color: "#12100c",
    theme_color: "#12100c",
    categories: ["games", "reference", "utilities"],
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Units", short_name: "Units", url: "/units" },
      { name: "Civilizations", short_name: "Civs", url: "/civilizations" },
      { name: "Battle simulator", short_name: "Battle", url: "/battle" },
      { name: "Tech tree", short_name: "Tech Tree", url: "/tech-tree" },
    ],
  }
}
