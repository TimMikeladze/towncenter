/** Armour/attack class as carried by the game data, with its display name. */
export interface ArmorClassRef {
  id: number
  name: string
  amount: number
}

export type AttackType = "Melee" | "Pierce"

/**
 * A charged ability, as the game data models it: the unit banks `max` charge,
 * spends it on a special hit, and regains `rechargeRate` per second.
 */
export interface ChargeAbility {
  /** Upstream's name for this `charge_type`, e.g. "Projectile Dodging". */
  name: string
  max: number
  rechargeRate: number
  /** Seconds to refill from empty. */
  rechargeDuration: number
  type: number
  event: number
}

export interface UnitStats {
  hp: number
  attack: number
  attackType: AttackType
  meleeArmor: number
  pierceArmor: number
  armorClasses: ArmorClassRef[]
  attackBonuses: { classId: number; class: string; bonus: number }[]
  range?: number
  minRange?: number
  attackSpeed: number
  movementSpeed: number
  lineOfSight: number
  trainingTime: number
  /** Projectile hit chance, 0-100. Melee units are always 100. */
  accuracy: number
  /** Seconds between the attack animation starting and damage landing. */
  attackDelay: number
  /** Splash radius in tiles; 0 for single-target attacks. */
  blastWidth: number
  garrisonCapacity: number
  /** Animation frames before the projectile leaves; the raw form of attackDelay. */
  frameDelay: number
  /** Present only on the ~20 units with a charged ability. */
  charge?: ChargeAbility
  /** Engine trait bits, named upstream, e.g. "Scout Unit", "Builds: Donjon". */
  traits: string[]
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
  /** The research that unlocks this unit from the previous one in its line. */
  upgradeResearch?: { techId: number; name: string; cost: UnitCost; researchTime: number }
  civSpecific?: string // Civ ID if unique unit
  availableToCivs?: string[] // Civ IDs that can train this unit
  image_path?: string | null // Path to unit image
}

export interface CivBonus {
  id: string
  description: string
  category: "economic" | "military" | "defensive" | "team"
}

export type TechTreeKind = "unit" | "building" | "tech"

/**
 * One node of a civ's tech tree, with everything it unlocks nested underneath:
 * a building's units and technologies, and each upgrade under what it upgrades
 * from. Serializable so a server page can hand it straight to a client tree.
 */
export interface TechTreeNode {
  id: string
  kind: TechTreeKind
  name: string
  age: Age
  /** Secondary line: unit stats, building hit points, technology cost. */
  detail: string
  unique: boolean
  image_path: string | null
  children: TechTreeNode[]
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
  /** Defensive buildings only; 0 for everything that cannot shoot. */
  attack: number
  attackType: AttackType
  range?: number
  minRange?: number
  /** Seconds between shots; 0 when the building has no attack. */
  attackSpeed: number
  /** Projectile hit chance, 0-100. */
  accuracy: number
  armorClasses: ArmorClassRef[]
  attackBonuses: { classId: number; class: string; bonus: number }[]
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
