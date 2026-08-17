import type { Age, Building, Unit, UnitCost } from "@/lib/types"

/**
 * Blacksmith / University / Dock / Monastery upgrades, applied to unit stats.
 *
 * The export carries no numeric tech effects — upstream only ships the tech's
 * cost, research time and help string. The deltas below are the effect values
 * the game's own data file records for each tech, keyed by the real tech id so
 * per-civ availability can be read out of `civ_techs`. Costs, research times
 * and ages come from the export itself, which is the current patch.
 *
 * Which units a line touches is decided the way the engine decides it: by the
 * unit's armour classes, not by its name. The handful of techs the engine
 * targets by unit id instead (Gambesons, Loom, Sappers) carry a `units` list.
 */

export type UpgradeGroup =
  | "melee_attack"
  | "infantry_armour"
  | "cavalry_armour"
  | "archer_armour"
  | "archer_attack"
  | "archer_line"
  | "cavalry_archer"
  | "gunpowder"
  | "siege"
  | "naval"
  | "monk"
  | "villager"

export interface StatDeltas {
  hp?: number
  attack?: number
  range?: number
  meleeArmor?: number
  pierceArmor?: number
  /** Multiplier applied to movement speed, e.g. 1.1 for Husbandry. */
  speed?: number
  /** Multiplier applied to reload time; below 1 means it fires faster. */
  reload?: number
  /** Sets projectile accuracy outright, as Thumb Ring does. */
  accuracy?: number
  lineOfSight?: number
}

export interface UpgradeTech {
  id: number
  name: string
  age: Age
  building: string
  groups: UpgradeGroup[]
  cost: UnitCost
  researchTime: number
  deltas: StatDeltas
  /**
   * Unit ids the engine targets directly. When present the tech only reaches
   * these units, regardless of which groups it lists.
   */
  units?: number[]
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
    researchTime: 75,
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

  // Stable / Archery Range / Barracks — the lines outside the blacksmith
  {
    id: 435,
    name: "Bloodlines",
    age: "Feudal",
    building: "Stable",
    groups: ["cavalry_armour"],
    cost: { food: 150, gold: 100 },
    researchTime: 50,
    deltas: { hp: 20 },
  },
  {
    id: 437,
    name: "Thumb Ring",
    age: "Castle",
    building: "Archery Range",
    // Ships shoot but the engine leaves them out of this one.
    groups: ["archer_line"],
    cost: { food: 300, wood: 250 },
    researchTime: 45,
    deltas: { accuracy: 100, reload: 0.85 },
  },
  {
    id: 436,
    name: "Parthian Tactics",
    age: "Imperial",
    building: "Archery Range",
    groups: ["cavalry_archer"],
    cost: { food: 200, gold: 250 },
    researchTime: 65,
    deltas: { meleeArmor: 1, pierceArmor: 2 },
    note: "Also +2 attack against spearmen.",
  },
  {
    id: 875,
    name: "Gambesons",
    age: "Castle",
    building: "Barracks",
    groups: ["infantry_armour"],
    // Militia line only — Militia through Champion, plus the Roman Legionary.
    units: [74, 75, 77, 473, 567, 1793],
    cost: { food: 50, gold: 100 },
    researchTime: 25,
    deltas: { pierceArmor: 1 },
  },
  {
    id: 602,
    name: "Arson",
    age: "Feudal",
    building: "Barracks",
    groups: ["infantry_armour"],
    cost: { food: 75, gold: 25 },
    researchTime: 25,
    deltas: {},
    note: "+2 attack against standard buildings.",
  },

  // Town Center / Castle — the villager lines
  {
    id: 22,
    name: "Loom",
    age: "Dark",
    building: "Town Center",
    groups: ["villager"],
    units: [83],
    cost: { gold: 50 },
    researchTime: 25,
    deltas: { hp: 15, meleeArmor: 1, pierceArmor: 2 },
  },
  {
    id: 321,
    name: "Sappers",
    age: "Imperial",
    building: "Castle",
    groups: ["villager"],
    units: [83],
    cost: { food: 400, wood: 200 },
    researchTime: 10,
    deltas: {},
    note: "+15 attack against buildings, +3 against rams.",
  },

  // Monastery
  {
    id: 231,
    name: "Sanctity",
    age: "Castle",
    building: "Monastery",
    groups: ["monk"],
    cost: { gold: 175 },
    researchTime: 60,
    deltas: { hp: 15 },
  },
  {
    id: 252,
    name: "Fervor",
    age: "Castle",
    building: "Monastery",
    groups: ["monk"],
    cost: { gold: 140 },
    researchTime: 50,
    deltas: { speed: 1.15 },
  },
  {
    id: 230,
    name: "Block Printing",
    age: "Imperial",
    building: "Monastery",
    groups: ["monk"],
    cost: { gold: 200 },
    researchTime: 55,
    deltas: { range: 3, lineOfSight: 3 },
  },
  {
    id: 233,
    name: "Illumination",
    age: "Imperial",
    building: "Monastery",
    groups: ["monk"],
    cost: { gold: 120 },
    researchTime: 65,
    deltas: {},
    note: "Faith regenerates faster after a conversion.",
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
const CLASS_CAVALRY_ARCHER = 28

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
  if (classes.has(CLASS_ARCHER) && !isGunpowder) {
    groups.add("archer_attack")
    // The blacksmith archer line reaches ships; the Archery Range one does not.
    if (!isShip) groups.add("archer_line")
  }
  if (classes.has(CLASS_CAVALRY_ARCHER)) groups.add("cavalry_archer")
  if (isGunpowder) groups.add("gunpowder")
  if (classes.has(CLASS_SIEGE)) groups.add("siege")
  if (isShip) {
    groups.add("naval")
    if (!isGunpowder && unit.stats.range) groups.add("archer_attack")
  }
  if (classes.has(CLASS_MONK)) {
    groups.clear()
    groups.add("monk")
  }
  if (unit.type === "Economy" && !isShip) groups.add("villager")

  return groups
}

/** Every upgrade that can ever touch this unit, in research order. */
export function upgradesForUnit(unit: Unit): UpgradeTech[] {
  const groups = upgradeGroups(unit)
  return UPGRADE_TECHS.filter((tech) => {
    // A tech the engine targets by unit id ignores the group model entirely.
    if (tech.units) return tech.units.includes(Number(unit.id))
    return tech.groups.some((group) => groups.has(group))
  })
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

  let hp = 0
  let attack = 0
  let range = 0
  let meleeArmor = 0
  let pierceArmor = 0
  let lineOfSight = 0
  let speed = 1
  let reload = 1
  let accuracy: number | undefined

  for (const tech of techs) {
    hp += tech.deltas.hp ?? 0
    attack += tech.deltas.attack ?? 0
    range += tech.deltas.range ?? 0
    meleeArmor += tech.deltas.meleeArmor ?? 0
    pierceArmor += tech.deltas.pierceArmor ?? 0
    lineOfSight += tech.deltas.lineOfSight ?? 0
    speed *= tech.deltas.speed ?? 1
    reload *= tech.deltas.reload ?? 1
    if (tech.deltas.accuracy !== undefined) accuracy = tech.deltas.accuracy
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
      hp: unit.stats.hp + hp,
      attack: unit.stats.attack + attack,
      attackBonuses,
      meleeArmor: unit.stats.meleeArmor + meleeArmor,
      pierceArmor: unit.stats.pierceArmor + pierceArmor,
      range: unit.stats.range ? unit.stats.range + range : unit.stats.range,
      lineOfSight: unit.stats.lineOfSight + lineOfSight,
      movementSpeed: Number((unit.stats.movementSpeed * speed).toFixed(3)),
      attackSpeed: Number((unit.stats.attackSpeed * reload).toFixed(3)),
      accuracy: accuracy ?? unit.stats.accuracy,
    },
  }
}

/**
 * The same idea for buildings. These techs never reach a unit, so they are kept
 * out of UPGRADE_TECHS; `appliesTo` is the building type the engine targets.
 */
export interface BuildingUpgradeTech {
  id: number
  name: string
  age: Age
  building: string
  appliesTo: Building["type"][]
  cost: UnitCost
  researchTime: number
  deltas: {
    /** Multiplier applied to hit points, e.g. 1.1 for Masonry. */
    hp?: number
    attack?: number
    meleeArmor?: number
    pierceArmor?: number
    lineOfSight?: number
    /** Murder Holes drops the minimum range to zero. */
    minRange?: number
  }
  note?: string
}

const DEFENSIVE: Building["type"][] = ["Tower", "Military"]
const ALL_BUILDINGS: Building["type"][] = ["Military", "Eco", "Science", "Special", "Tower", "Wall", "Gate"]

export const BUILDING_UPGRADE_TECHS: BuildingUpgradeTech[] = [
  {
    id: 50,
    name: "Masonry",
    age: "Castle",
    building: "University",
    appliesTo: ALL_BUILDINGS,
    cost: { food: 150, wood: 175 },
    researchTime: 50,
    deltas: { hp: 1.1, meleeArmor: 1, pierceArmor: 1 },
    note: "Also +3 armour against the bonus damage siege does to buildings.",
  },
  {
    id: 51,
    name: "Architecture",
    age: "Imperial",
    building: "University",
    appliesTo: ALL_BUILDINGS,
    cost: { food: 300, wood: 200 },
    researchTime: 70,
    deltas: { hp: 1.1, meleeArmor: 1, pierceArmor: 1 },
    note: "Also +3 armour against the bonus damage siege does to buildings.",
  },
  {
    id: 322,
    name: "Murder Holes",
    age: "Castle",
    building: "University",
    appliesTo: DEFENSIVE,
    cost: { food: 200, stone: 100 },
    researchTime: 35,
    deltas: { minRange: 0 },
  },
  {
    id: 608,
    name: "Arrowslits",
    age: "Imperial",
    building: "University",
    appliesTo: ["Tower"],
    cost: { food: 250, wood: 250 },
    researchTime: 25,
    deltas: { attack: 1 },
  },
  {
    id: 380,
    name: "Heated Shot",
    age: "Castle",
    building: "University",
    appliesTo: DEFENSIVE,
    cost: { food: 350, gold: 100 },
    researchTime: 30,
    deltas: {},
    note: "Attack against ships is multiplied by 2.25.",
  },
  {
    id: 379,
    name: "Hoardings",
    age: "Imperial",
    building: "Castle",
    appliesTo: ["Military"],
    cost: { food: 400, wood: 400 },
    researchTime: 75,
    deltas: {},
    note: "Castle hit points +21%; Krepost +38.5%, Donjon +44.4%.",
  },
  {
    id: 8,
    name: "Town Watch",
    age: "Feudal",
    building: "Town Center",
    appliesTo: ALL_BUILDINGS,
    cost: { food: 75 },
    researchTime: 25,
    deltas: { lineOfSight: 4 },
  },
  {
    id: 280,
    name: "Town Patrol",
    age: "Castle",
    building: "Town Center",
    appliesTo: ALL_BUILDINGS,
    cost: { food: 300, gold: 100 },
    researchTime: 40,
    deltas: { lineOfSight: 4 },
  },
]

export const BUILDING_UPGRADE_TECH_IDS = BUILDING_UPGRADE_TECHS.map((tech) => tech.id)

/** Every building upgrade that can ever touch this building. */
export function upgradesForBuilding(building: Building): BuildingUpgradeTech[] {
  return BUILDING_UPGRADE_TECHS.filter((tech) => {
    if (!tech.appliesTo.includes(building.type)) return false
    // Attack-only techs are pointless on a building that cannot shoot.
    if (tech.deltas.attack && building.attack === 0) return false
    if (tech.deltas.minRange !== undefined && !building.minRange) return false
    return true
  })
}

/** Total resource outlay of a set of upgrades, for "is it worth it" answers. */
export function upgradeCost(techs: { cost: UnitCost }[]): UnitCost {
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
