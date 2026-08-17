import type { CivBonus } from "@/lib/types"

/** Strip the markup the game strings carry: tags, entities, ‹placeholders›. */
function stripMarkup(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/‹[^›]*›/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function lines(raw: string): string[] {
  return raw
    .split(/<br\s*\/?>|\n/)
    .map(stripMarkup)
    .filter(Boolean)
}

export interface HelpText {
  description: string
  effects: string[]
}

/**
 * Entity help strings look like:
 *   Create <b>Archer</b> (‹cost›)<br>
 *   All-purpose Foot Archer. Strong vs. …<br>
 *   <i>Upgrades: attack, range …</i>‹DEFAULT›<br>
 *   ‹hp› ‹attack› ‹armor›
 * The first line is the action verb, the second the actual description.
 */
export function parseHelpText(raw: string | null | undefined): HelpText {
  if (!raw) return { description: "", effects: [] }

  const body = lines(raw).filter((line) => !/^(Create|Build|Research|Train)\b/.test(line))
  const effects = body.filter((line) => /^Upgrades:/.test(line))
  const description = body.find((line) => !/^Upgrades:/.test(line)) ?? ""

  return { description, effects }
}

export interface CivHelpText {
  types: string[]
  bonuses: CivBonus[]
  teamBonus: string
  uniqueUnitNames: string[]
  uniqueTechDescriptions: string[]
}

const ECONOMIC_HINTS =
  /villager|farm|gold|wood|stone|food|resource|trade|market|economy|mining|lumber|fish|herdable|sheep|relic|caravan|cart|town center|age (costs|advances)/i
const DEFENSIVE_HINTS = /wall|tower|castle|keep|gate|building|fortif|donjon|krepost/i

function categorizeBonus(text: string): CivBonus["category"] {
  if (ECONOMIC_HINTS.test(text)) return "economic"
  if (DEFENSIVE_HINTS.test(text)) return "defensive"
  return "military"
}

/**
 * Civ help strings are a structured blob: a "<types> civilization" header, a
 * bulleted bonus list, unique unit and unique tech sections, then the team bonus.
 */
export function parseCivHelpText(raw: string | null | undefined, civName: string): CivHelpText {
  const empty: CivHelpText = {
    types: [],
    bonuses: [],
    teamBonus: "",
    uniqueUnitNames: [],
    uniqueTechDescriptions: [],
  }
  if (!raw) return empty

  const body = lines(raw)
  if (body.length === 0) return empty

  const header = body[0].replace(/\s*civilization\s*$/i, "")
  const types = header
    .split(/\s+and\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  let section: "bonuses" | "unit" | "tech" | "team" = "bonuses"
  const bonuses: CivBonus[] = []
  const uniqueUnitNames: string[] = []
  const uniqueTechDescriptions: string[] = []
  let teamBonus = ""

  for (const line of body.slice(1)) {
    if (/^Unique Units?:?$/i.test(line)) {
      section = "unit"
      continue
    }
    if (/^Unique Techs?:?$/i.test(line)) {
      section = "tech"
      continue
    }
    if (/^Team Bonus:?$/i.test(line)) {
      section = "team"
      continue
    }

    const text = line.replace(/^•\s*/, "").trim()
    if (!text) continue

    if (section === "bonuses") {
      bonuses.push({
        id: `${civName.toLowerCase()}-bonus-${bonuses.length + 1}`,
        description: text,
        category: categorizeBonus(text),
      })
    } else if (section === "unit") {
      uniqueUnitNames.push(...text.split(/,\s*(?![^(]*\))/).map((part) => part.trim()))
    } else if (section === "tech") {
      uniqueTechDescriptions.push(text)
    } else {
      teamBonus = teamBonus ? `${teamBonus} ${text}` : text
    }
  }

  if (teamBonus) {
    bonuses.push({
      id: `${civName.toLowerCase()}-team-bonus`,
      description: teamBonus,
      category: "team",
    })
  }

  return { types, bonuses, teamBonus, uniqueUnitNames, uniqueTechDescriptions }
}
