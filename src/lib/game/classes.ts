import type { Building, UnitType } from "@/lib/types"

/**
 * Armour/attack class ids as used by the game data. Names are not shipped
 * upstream; these were verified against the units carrying each class.
 */
const ARMOUR_CLASS_NAMES: Record<number, string> = {
  1: "Infantry",
  2: "Turtle Ship",
  3: "Base Pierce",
  4: "Base Melee",
  5: "War Elephant",
  8: "Cavalry",
  11: "All Buildings",
  13: "Stone Defense",
  14: "Predator Animal",
  15: "Archer",
  16: "Ship",
  17: "Ram",
  18: "Tree",
  19: "Unique Unit",
  20: "Siege Weapon",
  21: "Standard Building",
  22: "Wall and Gate",
  23: "Gunpowder Unit",
  25: "Monk",
  26: "Castle",
  27: "Spearman",
  28: "Cavalry Archer",
  29: "Eagle Warrior",
  30: "Camel",
  31: "Anti-Leitis",
  32: "Condottiero",
  34: "Fishing Ship",
  35: "Mameluke",
  36: "Hero and King",
  37: "Armored Elephant",
  38: "Skirmisher",
  39: "Camel Rider",
  41: "Fire Ship",
  60: "Warship",
}

/** Classes that only exist to carry base damage, not a unit category. */
export const BASE_MELEE_CLASS = 4
export const BASE_PIERCE_CLASS = 3

export function armourClassName(id: number): string {
  return ARMOUR_CLASS_NAMES[id] ?? `Class ${id}`
}

/** Building ids that train units, mapped to the unit category they produce. */
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
