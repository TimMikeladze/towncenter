export type ArmorClass =
  | "Infantry"
  | "Archer"
  | "Cavalry"
  | "Siege"
  | "Monk"
  | "Eagle Warrior"
  | "Camel"
  | "Ship"
  | "Building"
  | "Castle"
  | "Stone Defense"
  | "Ram"
  | "Unique Unit"
  | "Spearman"

export type AttackType = "Melee" | "Pierce"

export interface UnitStats {
  hp: number
  attack: number
  attackType: AttackType
  meleeArmor: number
  pierceArmor: number
  armorClasses: ArmorClass[]
  attackBonuses: { class: ArmorClass; bonus: number }[]
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

export type UnitType = "Infantry" | "Archer" | "Cavalry" | "Siege" | "Monk" | "Naval" | "Unique"

export type Age = "Dark" | "Feudal" | "Castle" | "Imperial"

export interface Unit {
  id: string
  name: string
  type: UnitType
  age: Age
  cost: UnitCost
  stats: UnitStats
  description: string
  counters: string[] // Unit IDs that counter this unit
  goodAgainst: string[] // Unit IDs this unit is good against
  upgrades?: string[] // Upgrade IDs
  civSpecific?: string // Civ ID if unique unit
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
  type: "Archer" | "Cavalry" | "Infantry" | "Defensive" | "Naval" | "Monk"
  bonuses: CivBonus[]
  uniqueUnits: string[] // Unit IDs
  uniqueTechs: { castle: string; imperial: string }
  teamBonus: string
  strengths: string[]
  weaknesses: string[]
  techTree: {
    missingUnits: string[]
    missingTechs: string[]
  }
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
}

export interface Technology {
  id: string
  name: string
  category:
    | "Town Center"
    | "Mill"
    | "Lumber"
    | "Mining"
    | "Market"
    | "Monastery"
    | "Dock"
    | "University"
    | "Blacksmith"
    | "Stable"
    | "Archery"
    | "Barracks"
    | "Castle"
    | "Unique"
  age: Age
  cost: UnitCost
  researchTime: number // in seconds
  description: string
  effects: string[]
  affectedUnits?: string[]
  affectedBuildings?: string[]
  civSpecific?: string
}

export interface Map {
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
