import type { Age, Unit, UnitCost } from "@/lib/types"

/**
 * Blacksmith / University / Dock upgrades, applied to unit stats.
 *
 * The export carries no numeric tech effects — upstream only ships the tech's
 * cost, research time and help string. The deltas below are the game's own
 * published values, keyed by the real tech id so per-civ availability can be
 * read out of `civ_techs`.
 *
 * Which units a line touches is decided the way the engine decides it: by the
 * unit's armour classes, not by its name.
 */

export type UpgradeGroup =
  | "melee_attack"
  | "infantry_armour"
  | "cavalry_armour"
  | "archer_armour"
  | "archer_attack"
  | "gunpowder"
  | "siege"
  | "naval"

export interface StatDeltas {
  attack?: number
  range?: number
  meleeArmor?: number
  pierceArmor?: number
  /** Multiplier applied to movement speed, e.g. 1.1 for Husbandry. */
  speed?: number
}

export interface UpgradeTech {
  id: number
  name: string
  age: Exclude<Age, "Dark">
  building: string
  groups: UpgradeGroup[]
  cost: UnitCost
  researchTime: number
  deltas: StatDeltas
  /** Shown when the tech matters but changes no number we model. */
  note?: string
}

export const UPGRADE_TECHS: UpgradeTech[] = [
  // Blacksmith — melee attack
  {
    id: 67,
    name: "Forging",
    age: "Feudal",
    building: "Blacksmith",
    groups: ["melee_attack"],
    cost: { food: 150 },
    researchTime: 50,
    deltas: { attack: 1 },
  },
  {
    id: 68,
    name: "Iron Casting",
    age: "Castle",
    building: "Blacksmith",
    groups: ["melee_attack"],
    cost: { food: 220, gold: 120 },
    researchTime: 70,
    deltas: { attack: 1 },
  },
  {
    id: 75,
    name: "Blast Furnace",
    age: "Imperial",
    building: "Blacksmith",
    groups: ["melee_attack"],
    cost: { food: 275, gold: 225 },
    researchTime: 100,
    deltas: { attack: 2 },
  },

  // Blacksmith — infantry armour
  {
    id: 74,
    name: "Scale Mail Armor",
    age: "Feudal",
    building: "Blacksmith",
    groups: ["infantry_armour"],
    cost: { food: 100 },
    researchTime: 40,
    deltas: { meleeArmor: 1, pierceArmor: 1 },
  },
  {
    id: 76,
    name: "Chain Mail Armor",
    age: "Castle",
    building: "Blacksmith",
    groups: ["infantry_armour"],
    cost: { food: 200, gold: 100 },
    researchTime: 55,
    deltas: { meleeArmor: 1, pierceArmor: 1 },
  },
  {
    id: 77,
    name: "Plate Mail Armor",
    age: "Imperial",
    building: "Blacksmith",
    groups: ["infantry_armour"],
    cost: { food: 300, gold: 150 },
    researchTime: 70,
    deltas: { meleeArmor: 1, pierceArmor: 2 },
  },

  // Blacksmith — cavalry armour
  {
    id: 81,
    name: "Scale Barding Armor",
    age: "Feudal",
    building: "Blacksmith",
    groups: ["cavalry_armour"],
    cost: { food: 150 },
    researchTime: 45,
    deltas: { meleeArmor: 1, pierceArmor: 1 },
  },
  {
    id: 82,
    name: "Chain Barding Armor",
    age: "Castle",
    building: "Blacksmith",
    groups: ["cavalry_armour"],
    cost: { food: 250, gold: 150 },
    researchTime: 60,
    deltas: { meleeArmor: 1, pierceArmor: 1 },
  },
  {
    id: 80,
    name: "Plate Barding Armor",
    age: "Imperial",
    building: "Blacksmith",
    groups: ["cavalry_armour"],
    cost: { food: 350, gold: 200 },
    researchTime: 75,
    deltas: { meleeArmor: 1, pierceArmor: 2 },
  },

  // Blacksmith — archer armour
  {
    id: 211,
    name: "Padded Archer Armor",
    age: "Feudal",
    building: "Blacksmith",
    groups: ["archer_armour"],
    cost: { food: 100 },
    researchTime: 40,
    deltas: { meleeArmor: 1, pierceArmor: 1 },
  },
  {
    id: 212,
    name: "Leather Archer Armor",
    age: "Castle",
    building: "Blacksmith",
    groups: ["archer_armour"],
    cost: { food: 150, gold: 150 },
    researchTime: 55,
    deltas: { meleeArmor: 1, pierceArmor: 1 },
  },
  {
    id: 219,
    name: "Ring Archer Armor",
    age: "Imperial",
    building: "Blacksmith",
    groups: ["archer_armour"],
    cost: { food: 250, gold: 250 },
    researchTime: 70,
    deltas: { meleeArmor: 1, pierceArmor: 2 },
  },

  // Blacksmith — archer attack and range
  {
    id: 199,
    name: "Fletching",
    age: "Feudal",
    building: "Blacksmith",
    groups: ["archer_attack"],
    cost: { food: 100, gold: 50 },
    researchTime: 30,
    deltas: { attack: 1, range: 1 },
  },
  {
    id: 200,
    name: "Bodkin Arrow",
    age: "Castle",
    building: "Blacksmith",
    groups: ["archer_attack"],
    cost: { food: 200, gold: 100 },
    researchTime: 35,
    deltas: { attack: 1, range: 1 },
  },
  {
    id: 201,
    name: "Bracer",
    age: "Imperial",
    building: "Blacksmith",
    groups: ["archer_attack"],
    cost: { food: 300, gold: 200 },
    researchTime: 40,
    deltas: { attack: 1, range: 1 },
  },

  // University
  {
    id: 47,
    name: "Chemistry",
    age: "Imperial",
    building: "University",
    groups: ["archer_attack", "gunpowder"],
    cost: { food: 300, gold: 200 },
    researchTime: 100,
    deltas: { attack: 1 },
  },
  {
    id: 93,
    name: "Ballistics",
    age: "Castle",
    building: "University",
    groups: ["archer_attack", "gunpowder"],
    cost: { wood: 300, gold: 175 },
    researchTime: 60,
    deltas: {},
    note: "Projectiles lead moving targets — the single biggest real-world accuracy gain for archers.",
  },
  {
    id: 377,
    name: "Siege Engineers",
    age: "Imperial",
    building: "University",
    groups: ["siege"],
    cost: { food: 500, wood: 600 },
    researchTime: 45,
    deltas: { range: 1 },
    note: "Also +20% damage against buildings. Battering Rams gain neither.",
  },

  // Stable / Barracks movement
  {
    id: 39,
    name: "Husbandry",
    age: "Castle",
    building: "Stable",
    groups: ["cavalry_armour"],
    cost: { food: 150 },
    researchTime: 40,
    deltas: { speed: 1.1 },
  },
  {
    id: 215,
    name: "Squires",
    age: "Castle",
    building: "Barracks",
    groups: ["infantry_armour"],
    cost: { food: 100 },
    researchTime: 40,
    deltas: { speed: 1.1 },
  },

  // Dock
  {
    id: 374,
    name: "Careening",
    age: "Castle",
    building: "Dock",
    groups: ["naval"],
    cost: { food: 100, gold: 200 },
    researchTime: 50,
    deltas: { pierceArmor: 1 },
  },
  {
    id: 375,
    name: "Dry Dock",
    age: "Imperial",
    building: "Dock",
    groups: ["naval"],
    cost: { food: 200, gold: 400 },
    researchTime: 60,
    deltas: { speed: 1.15 },
  },
]

export const UPGRADE_TECH_IDS = UPGRADE_TECHS.map((tech) => tech.id)

const TECH_BY_ID = new Map(UPGRADE_TECHS.map((tech) => [tech.id, tech]))

export function upgradeTech(id: number): UpgradeTech | undefined {
  return TECH_BY_ID.get(id)
}

// Armour class ids that decide which upgrade lines reach a unit.
const CLASS_INFANTRY = 1
const CLASS_CAVALRY = 8
const CLASS_ARCHER = 15
const CLASS_SHIP = 16
const CLASS_WARSHIP = 60
const CLASS_SIEGE = 20
const CLASS_GUNPOWDER = 23
const CLASS_MONK = 25
const CLASS_ELEPHANT = 5
const CLASS_CAMEL = 30

/**
 * Which upgrade lines apply to a unit, read off its armour classes exactly
 * like the engine does.
 */
export function upgradeGroups(unit: Unit): Set<UpgradeGroup> {
  const classes = new Set(unit.stats.armorClasses.map((armour) => armour.id))
  const groups = new Set<UpgradeGroup>()

  const isGunpowder = classes.has(CLASS_GUNPOWDER)
  const isShip = classes.has(CLASS_SHIP) || classes.has(CLASS_WARSHIP)
  const isCavalry = classes.has(CLASS_CAVALRY) || classes.has(CLASS_CAMEL) || classes.has(CLASS_ELEPHANT)

  if (classes.has(CLASS_INFANTRY)) {
    groups.add("infantry_armour")
    groups.add("melee_attack")
  }
  if (isCavalry) {
    groups.add("cavalry_armour")
    // Mounted archers carry the cavalry class on some units but shoot; the
    // forging line only helps units whose damage is melee.
    if (!unit.stats.range) groups.add("melee_attack")
  }
  if (classes.has(CLASS_ARCHER)) groups.add("archer_armour")
  if (classes.has(CLASS_ARCHER) && !isGunpowder) groups.add("archer_attack")
  if (isGunpowder) groups.add("gunpowder")
  if (classes.has(CLASS_SIEGE)) groups.add("siege")
  if (isShip) {
    groups.add("naval")
    if (!isGunpowder && unit.stats.range) groups.add("archer_attack")
  }
  if (classes.has(CLASS_MONK)) groups.clear()

  return groups
}

/** Every upgrade that can ever touch this unit, in research order. */
export function upgradesForUnit(unit: Unit): UpgradeTech[] {
  const groups = upgradeGroups(unit)
  return UPGRADE_TECHS.filter((tech) => tech.groups.some((group) => groups.has(group)))
}

const AGE_ORDER: Record<Age, number> = { Dark: 1, Feudal: 2, Castle: 3, Imperial: 4 }

/**
 * The upgrades a unit actually has at a given age, optionally narrowed to what
 * one civilization can research.
 */
export function resolveUpgrades(
  unit: Unit,
  age: Age,
  civTechIds?: ReadonlySet<number>,
): { applied: UpgradeTech[]; missing: UpgradeTech[] } {
  const applied: UpgradeTech[] = []
  const missing: UpgradeTech[] = []

  for (const tech of upgradesForUnit(unit)) {
    if (AGE_ORDER[tech.age] > AGE_ORDER[age]) continue
    if (civTechIds && !civTechIds.has(tech.id)) missing.push(tech)
    else applied.push(tech)
  }

  return { applied, missing }
}

/** A unit with the given upgrades folded into its stats. */
export function applyUpgrades(unit: Unit, techs: UpgradeTech[]): Unit {
  if (techs.length === 0) return unit

  let attack = 0
  let range = 0
  let meleeArmor = 0
  let pierceArmor = 0
  let speed = 1

  for (const tech of techs) {
    attack += tech.deltas.attack ?? 0
    range += tech.deltas.range ?? 0
    meleeArmor += tech.deltas.meleeArmor ?? 0
    pierceArmor += tech.deltas.pierceArmor ?? 0
    speed *= tech.deltas.speed ?? 1
  }

  // Bonus damage is unaffected; the upgrade lands on the unit's base damage
  // class, which is what the engine adds it to.
  const baseClass = unit.stats.range ? 3 : 4
  const attackBonuses = unit.stats.attackBonuses.map((bonus) =>
    bonus.classId === baseClass ? { ...bonus, bonus: bonus.bonus + attack } : bonus,
  )

  return {
    ...unit,
    stats: {
      ...unit.stats,
      attack: unit.stats.attack + attack,
      attackBonuses,
      meleeArmor: unit.stats.meleeArmor + meleeArmor,
      pierceArmor: unit.stats.pierceArmor + pierceArmor,
      range: unit.stats.range ? unit.stats.range + range : unit.stats.range,
      movementSpeed: Number((unit.stats.movementSpeed * speed).toFixed(3)),
    },
  }
}

/** Total resource outlay of a set of upgrades, for "is it worth it" answers. */
export function upgradeCost(techs: UpgradeTech[]): UnitCost {
  const total: Required<UnitCost> = { food: 0, wood: 0, gold: 0, stone: 0 }
  for (const tech of techs) {
    total.food += tech.cost.food ?? 0
    total.wood += tech.cost.wood ?? 0
    total.gold += tech.cost.gold ?? 0
    total.stone += tech.cost.stone ?? 0
  }
  return {
    food: total.food || undefined,
    wood: total.wood || undefined,
    gold: total.gold || undefined,
    stone: total.stone || undefined,
  }
}
