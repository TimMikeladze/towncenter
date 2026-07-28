/** Armour/attack class as carried by the game data, with its display name. */
export interface ArmorClassRef {
  id: number
  name: string
  amount: number
}

export type AttackType = "Melee" | "Pierce"

export interface UnitStats {
  hp: number
  attack: number
  attackType: AttackType
  meleeArmor: number
  pierceArmor: number
  armorClasses: ArmorClassRef[]
  attackBonuses: { classId: number; class: string; bonus: number }[]
  range?: number
  attackSpeed: number
  movementSpeed: number
  lineOfSight: number
  trainingTime: number
}

export interface UnitCost {
  food?: number
  wood?: number
  gold?: number
  stone?: number
}

export type UnitType = "Infantry" | "Archer" | "Cavalry" | "Siege" | "Monk" | "Naval" | "Economy" | "Unique"

export type Age = "Dark" | "Feudal" | "Castle" | "Imperial"

export interface Unit {
  id: string
  name: string
  type: UnitType
  age: Age
  cost: UnitCost
  stats: UnitStats
  description: string
  effects: string[] // upgrade / behaviour notes from the game help text
  counters: string[] // Unit IDs that counter this unit
  goodAgainst: string[] // Unit IDs this unit is good against
  upgrades?: string[] // Unit IDs later in the upgrade line
  upgradesFrom?: string // Unit ID this unit upgrades from
  civSpecific?: string // Civ ID if unique unit
  availableToCivs?: string[] // Civ IDs that can train this unit
  image_path?: string | null // Path to unit image
}

export interface CivBonus {
  id: string
  description: string
  category: "economic" | "military" | "defensive" | "team"
}

export interface TechTreeNode {
  id: string
  type: "unit" | "tech" | "building"
  available: boolean
}

export interface Civilization {
  id: string
  name: string
  type: string // primary focus, e.g. "Infantry"
  types: string[] // every focus listed by the game, e.g. ["Infantry", "Naval"]
  bonuses: CivBonus[]
  uniqueUnits: string[] // Unit IDs
  uniqueTechs: { castle: string; imperial: string }
  teamBonus: string
  strengths: string[]
  uniqueTechDescriptions: string[]
  techTree: {
    missingUnits: string[]
    missingTechs: string[]
    missingBuildings: string[]
  }
  image_path?: string | null // Path to civilization image
}

export interface BuildOrder {
  id: string
  name: string
  description: string
  civs: string[] // Civ IDs this works for
  steps: {
    time: string
    action: string
    population: number
  }[]
}

export interface Matchup {
  civA: string
  civB: string
  winRate: number // 0-100, percentage for civA
  notes: string
}

export interface CounterRelationship {
  unitId: string
  counters: { unitId: string; effectiveness: "hard" | "soft" }[]
}

export interface Building {
  id: string
  name: string
  type: "Military" | "Eco" | "Science" | "Special" | "Tower" | "Wall" | "Gate"
  age: Age
  cost: UnitCost
  buildTime: number
  hitPoints: number
  meleeArmor: number
  pierceArmor: number
  lineOfSight: number
  garrisonCapacity?: number
  description: string
  trainsUnits?: string[] // Unit IDs
  researchesTechs?: string[] // Tech IDs
  upgrades?: string[]
  availableToCivs?: string[] // Civ IDs that can build this
  image_path?: string | null // Path to building image
}

export interface Technology {
  id: string
  name: string
  category: string // the building it is researched at, or "Unique"
  age: Age
  cost: UnitCost
  researchTime: number // in seconds
  description: string
  effects: string[]
  affectedUnits?: string[]
  affectedBuildings?: string[]
  civSpecific?: string
  availableToCivs?: string[]
  image_path?: string | null // Path to technology image
}

export interface GameMap {
  id: string
  name: string
  type: "Land" | "Water" | "Hybrid"
  size: "Tiny" | "Small" | "Medium" | "Normal" | "Large" | "Giant" | "Ludikris"
  description: string
  recommendedCivs: string[]
}

export interface EnhancedUnitStats extends UnitStats {
  frameDelay?: number
  accuracy?: number
  minRange?: number
  maxRange?: number
  reloadTime?: number
  projectileSpeed?: number
  blastRadius?: number
}
