export const SOCIAL_CARD_SIZE = { width: 1200, height: 630 }

export const SOCIAL_CARD_TITLES = {
  home: "Town Center",
  units: "Units",
  civilizations: "Civilizations",
  buildings: "Buildings",
  technologies: "Technologies",
  "tech-tree": "Tech tree",
  counters: "Counters",
  compare: "Compare units",
  "compare-civilizations": "Compare civilizations",
  battle: "Battle simulator",
  changes: "Patch changes",
  about: "About",
  offline: "Offline",
} as const

export type SocialCardSection = keyof typeof SOCIAL_CARD_TITLES

export function isSocialCardSection(value: string | null | undefined): value is SocialCardSection {
  return typeof value === "string" && Object.hasOwn(SOCIAL_CARD_TITLES, value)
}

export function socialCardSection(path: string): SocialCardSection | undefined {
  if (path === "/civilizations/compare") return "compare-civilizations"
  const section = path.split("/")[1]
  return isSocialCardSection(section) ? section : undefined
}
