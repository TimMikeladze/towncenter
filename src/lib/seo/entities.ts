/**
 * The search-facing copy for the four entity pages. Titles and descriptions
 * are built from the game's own numbers rather than a template sentence, so no
 * two of the ~530 detail pages share a description — which is the difference
 * between being indexed and being filed as duplicate boilerplate.
 */
import { GAME_NAME } from "@/lib/seo"
import type { Building, Civilization, Technology, Unit, UnitCost } from "@/lib/types"

const RESOURCE_ORDER = ["food", "wood", "gold", "stone"] as const

/** "60 food, 75 gold" — the way a player would say it. */
export function costSentence(cost: UnitCost): string {
  const parts = RESOURCE_ORDER.filter((resource) => (cost[resource] ?? 0) > 0).map(
    (resource) => `${cost[resource]} ${resource}`,
  )
  return parts.length ? parts.join(", ") : "nothing"
}

/** Meta descriptions get truncated around 160 characters; say the useful part first. */
function clamp(text: string, max = 158): string {
  const collapsed = text.replace(/\s+/g, " ").trim()
  if (collapsed.length <= max) return collapsed
  return `${collapsed.slice(0, max - 1).replace(/[\s,.;:]+\S*$/, "")}…`
}

export interface EntitySeo {
  title: string
  description: string
  eyebrow: string
  /** Second line of the social card — shorter than the description. */
  cardSubtitle: string
  /** Stat pairs published as structured data. */
  properties: { name: string; value: string | number }[]
}

export function unitSeo(unit: Unit, uniqueCivName?: string | null): EntitySeo {
  const kind = uniqueCivName ? `${uniqueCivName} unique unit` : `${unit.type.toLowerCase()} unit`
  const range = unit.stats.range ? `, range ${unit.stats.range}` : ""

  return {
    title: `${unit.name} — AoE2 unit stats & counters`,
    description: clamp(
      `${unit.name} is a ${unit.age} Age ${kind} in ${GAME_NAME}. ${unit.stats.hp} HP, ${unit.stats.attack} attack, ${unit.stats.meleeArmor}/${unit.stats.pierceArmor} armor${range}, costs ${costSentence(unit.cost)}. Counters, upgrades and matchups.`,
    ),
    eyebrow: uniqueCivName ? `${uniqueCivName} unique unit` : `${unit.type} · ${unit.age} Age`,
    cardSubtitle: `${unit.stats.hp} HP · ${unit.stats.attack} attack · ${unit.stats.meleeArmor}/${unit.stats.pierceArmor} armor · ${costSentence(unit.cost)}`,
    properties: [
      { name: "Type", value: unit.type },
      { name: "Age", value: `${unit.age} Age` },
      { name: "Hit points", value: unit.stats.hp },
      { name: "Attack", value: `${unit.stats.attack} ${unit.stats.attackType.toLowerCase()}` },
      { name: "Melee armor", value: unit.stats.meleeArmor },
      { name: "Pierce armor", value: unit.stats.pierceArmor },
      ...(unit.stats.range ? [{ name: "Range", value: unit.stats.range }] : []),
      { name: "Movement speed", value: unit.stats.movementSpeed },
      { name: "Training time", value: `${unit.stats.trainingTime}s` },
      { name: "Cost", value: costSentence(unit.cost) },
    ],
  }
}

export function civilizationSeo(civ: Civilization, uniqueUnitNames: string[]): EntitySeo {
  const focus = civ.types.join(" and ").toLowerCase()
  // The unique unit is the thing people search this civ by, so it goes ahead of
  // the counts rather than after them where a 160-character cut would eat it.
  const unique = uniqueUnitNames.length ? ` Unique unit: ${uniqueUnitNames.join(", ")}.` : ""

  return {
    title: `${civ.name} — AoE2 civilization guide`,
    description: clamp(
      `The ${civ.name} are a ${focus} civilization in ${GAME_NAME}.${unique} ${civ.bonuses.length} civilization bonuses, unique techs and the full tech tree.`,
    ),
    eyebrow: `${civ.types.join(" / ")} civilization`,
    cardSubtitle: civ.bonuses[0]?.description ?? `${focus} civilization`,
    properties: [
      { name: "Focus", value: civ.types.join(", ") },
      { name: "Civilization bonuses", value: civ.bonuses.length },
      { name: "Team bonus", value: civ.teamBonus || "None" },
      ...(uniqueUnitNames.length ? [{ name: "Unique units", value: uniqueUnitNames.join(", ") }] : []),
      { name: "Missing units", value: civ.techTree.missingUnits.length },
      { name: "Missing technologies", value: civ.techTree.missingTechs.length },
    ],
  }
}

export function buildingSeo(building: Building): EntitySeo {
  const attack = building.attack > 0 ? `, ${building.attack} attack` : ""

  return {
    title: `${building.name} — AoE2 building stats`,
    description: clamp(
      `${building.name} is a ${building.age} Age building in ${GAME_NAME}. ${building.hitPoints} HP, ${building.meleeArmor}/${building.pierceArmor} armor${attack}, costs ${costSentence(building.cost)} and takes ${building.buildTime}s to build.`,
    ),
    eyebrow: `${building.type} building · ${building.age} Age`,
    cardSubtitle: `${building.hitPoints} HP · ${building.meleeArmor}/${building.pierceArmor} armor · ${costSentence(building.cost)}`,
    properties: [
      { name: "Type", value: building.type },
      { name: "Age", value: `${building.age} Age` },
      { name: "Hit points", value: building.hitPoints },
      { name: "Melee armor", value: building.meleeArmor },
      { name: "Pierce armor", value: building.pierceArmor },
      ...(building.attack > 0 ? [{ name: "Attack", value: building.attack }] : []),
      { name: "Build time", value: `${building.buildTime}s` },
      { name: "Cost", value: costSentence(building.cost) },
    ],
  }
}

export function technologySeo(tech: Technology): EntitySeo {
  const where = tech.category === "Unique" ? "unique technology" : `${tech.category} technology`

  return {
    title: `${tech.name} — AoE2 technology`,
    description: clamp(
      `${tech.name} is a ${tech.age} Age ${where} in ${GAME_NAME}. Costs ${costSentence(tech.cost)} and ${tech.researchTime}s to research. ${tech.description}`,
    ),
    eyebrow: `${where} · ${tech.age} Age`,
    cardSubtitle: `${costSentence(tech.cost)} · ${tech.researchTime}s research`,
    properties: [
      { name: "Researched at", value: tech.category },
      { name: "Age", value: `${tech.age} Age` },
      { name: "Cost", value: costSentence(tech.cost) },
      { name: "Research time", value: `${tech.researchTime}s` },
    ],
  }
}
