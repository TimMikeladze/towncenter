import type { Building, UnitType } from "@/lib/types"

/**
 * Classes that only exist to carry base damage, not a unit category.
 * Every other class id is named by the `armour_classes` table, which the sync
 * script generates from aoe2techtree's own source — see `queries/lookups.ts`.
 */
export const BASE_MELEE_CLASS = 4
export const BASE_PIERCE_CLASS = 3

/**
 * The categories below are this app's own taxonomy — the game files carry no
 * unit or building category field. They group entities for browsing and
 * filtering only; every number shown on a page comes from the export.
 *
 * Building ids that train units, mapped to the unit category they produce.
 */
const UNIT_TYPE_BY_TRAINING_BUILDING: Record<number, UnitType> = {
  12: "Infantry", // Barracks
  45: "Naval", // Dock
  49: "Siege", // Siege Workshop
  82: "Unique", // Castle
  84: "Economy", // Market (trade cart)
  87: "Archer", // Archery Range
  101: "Cavalry", // Stable
  104: "Monk", // Monastery
  109: "Economy", // Town Center (villager)
  1189: "Naval", // Harbor
  1251: "Unique", // Krepost
  1665: "Unique", // Donjon
  1806: "Unique", // Fortified Church
}

/**
 * Unit category, from the building that trains it. Units with no tech tree
 * node (packed siege, alternate-mode units) fall back to their armour classes.
 */
export function deriveUnitType(buildingId: number | null, armourClasses: number[]): UnitType {
  if (buildingId !== null && UNIT_TYPE_BY_TRAINING_BUILDING[buildingId]) {
    return UNIT_TYPE_BY_TRAINING_BUILDING[buildingId]
  }
  const classes = new Set(armourClasses)
  if (classes.has(16) || classes.has(60) || classes.has(34)) return "Naval"
  if (classes.has(20) || classes.has(17)) return "Siege"
  if (classes.has(25)) return "Monk"
  if (classes.has(28) || classes.has(15) || classes.has(38)) return "Archer"
  if (classes.has(8) || classes.has(30) || classes.has(5) || classes.has(39)) return "Cavalry"
  if (classes.has(1) || classes.has(27) || classes.has(29)) return "Infantry"
  return "Economy"
}

const BUILDING_TYPES: Record<number, Building["type"]> = {
  12: "Military", // Barracks
  45: "Military", // Dock
  49: "Military", // Siege Workshop
  82: "Military", // Castle
  87: "Military", // Archery Range
  101: "Military", // Stable
  1189: "Military", // Harbor
  1251: "Military", // Krepost
  1665: "Military", // Donjon
  50: "Eco", // Farm
  68: "Eco", // Mill
  70: "Eco", // House
  71: "Eco", // Town Center
  84: "Eco", // Market
  109: "Eco", // Town Center
  199: "Eco", // Fish Trap
  562: "Eco", // Lumber Camp
  584: "Eco", // Mining Camp
  621: "Eco", // Town Center
  1021: "Eco", // Feitoria
  1734: "Eco", // Folwark
  1754: "Eco", // Caravanserai
  1808: "Eco", // Mule Cart
  1889: "Eco", // Pasture
  2556: "Eco", // Settlement
  103: "Science", // Blacksmith
  104: "Science", // Monastery
  209: "Science", // University
  1806: "Science", // Fortified Church
  79: "Tower", // Watch Tower
  234: "Tower", // Guard Tower
  235: "Tower", // Keep
  236: "Tower", // Bombard Tower
  598: "Tower", // Outpost
  72: "Wall", // Palisade Wall
  117: "Wall", // Stone Wall
  155: "Wall", // Fortified Wall
  487: "Gate", // Gate
  792: "Gate", // Palisade Gate
  276: "Special", // Wonder
}

export function deriveBuildingType(buildingId: number): Building["type"] {
  return BUILDING_TYPES[buildingId] ?? "Special"
}

/**
 * Column order of the in-game tech tree: military first, then the economy,
 * then defences. Buildings outside this list sort last, by name.
 */
const TECH_TREE_COLUMNS = [
  12, // Barracks
  87, // Archery Range
  101, // Stable
  49, // Siege Workshop
  45, // Dock
  1189, // Harbor
  82, // Castle
  1251, // Krepost
  1665, // Donjon
  103, // Blacksmith
  209, // University
  104, // Monastery
  1806, // Fortified Church
  109, // Town Center
  621, // Town Center (post-Dark Age)
  70, // House
  68, // Mill
  50, // Farm
  1889, // Pasture
  562, // Lumber Camp
  584, // Mining Camp
  1808, // Mule Cart
  1734, // Folwark
  84, // Market
  1754, // Caravanserai
  1021, // Feitoria
  2556, // Settlement
  598, // Outpost
  79, // Watch Tower
  72, // Palisade Wall
  792, // Palisade Gate
  487, // Gate
  117, // Stone Wall
  276, // Wonder
]

export function techTreeColumnRank(buildingId: number): number {
  const index = TECH_TREE_COLUMNS.indexOf(buildingId)
  return index === -1 ? TECH_TREE_COLUMNS.length : index
}

/**
 * Buildings that stand in for each other across civs. `node_types` records a
 * single column per entity — whichever civ the sync script saw first — so the
 * Monk lands in the Armenians' Fortified Church and Double-Bit Axe in the
 * Georgians' Mule Cart. Everyone else needs the equivalent they do own.
 */
const COLUMN_EQUIVALENTS: Record<number, number[]> = {
  12: [1665], // Barracks -> Donjon
  45: [1189], // Dock -> Harbor
  50: [1734, 1889, 2556], // Farm -> Folwark, Pasture, Settlement
  68: [1734, 1889, 2556], // Mill -> Folwark, Pasture, Settlement
  82: [1251, 1665], // Castle -> Krepost, Donjon
  84: [1754], // Market -> Caravanserai
  104: [1806], // Monastery -> Fortified Church
  109: [2556], // Town Center -> Settlement
  562: [1808, 2556], // Lumber Camp -> Mule Cart, Settlement
  584: [1808, 2556], // Mining Camp -> Mule Cart, Settlement
  1189: [45], // Harbor -> Dock
  1251: [82], // Krepost -> Castle
  1665: [12, 82], // Donjon -> Barracks, Castle
  1734: [68], // Folwark -> Mill
  1754: [84], // Caravanserai -> Market
  1806: [104], // Fortified Church -> Monastery
  1808: [562, 584, 2556], // Mule Cart -> Lumber Camp, Mining Camp, Settlement
  1889: [68], // Pasture -> Mill
  2556: [109], // Settlement -> Town Center
}

/** Mule Cart techs that belong to the Mining Camp rather than the Lumber Camp. */
const MINING_CAMP_TECHS = new Set([55, 182, 278, 279])

/**
 * Columns an entity can hang off, best first: its own, then any stand-in the
 * civ might have instead.
 */
export function techTreeColumns(kind: string, entityId: number, buildingId: number | null): number[] {
  if (buildingId === null) return []
  const preferred = kind === "tech" && MINING_CAMP_TECHS.has(entityId) ? [584] : []
  return [...new Set([...preferred, buildingId, ...(COLUMN_EQUIVALENTS[buildingId] ?? [])])]
}

/** Technology categories are the building the tech is researched at. */
export const ECO_TECH_CATEGORIES = [
  "Town Center",
  "Mill",
  "Market",
  "Mule Cart",
  "Lumber Camp",
  "Mining Camp",
  "Folwark",
  "Pasture",
  "Caravanserai",
]

export const MILITARY_TECH_CATEGORIES = [
  "Barracks",
  "Archery Range",
  "Stable",
  "Siege Workshop",
  "Dock",
  "Harbor",
  "Blacksmith",
  "University",
  "Monastery",
  "Fortified Church",
  "Castle",
]

export const AGES = ["Dark", "Feudal", "Castle", "Imperial"] as const

export function ageFromId(ageId: number | null | undefined): (typeof AGES)[number] {
  return AGES[(ageId ?? 1) - 1] ?? "Dark"
}
