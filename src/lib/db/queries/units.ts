import { cache } from "react"
import { ageFromId, deriveUnitType } from "@/lib/game/classes"
import { deriveCounters } from "@/lib/game/combat"
import { civId } from "@/lib/game/ids"
import { parseHelpText } from "@/lib/game/text"
import type { Unit } from "@/lib/types"
import { queryRows } from "../connection"
import { parseClassPairs } from "./combat-pairs"
import {
  type ArmourClass,
  type ChargeType,
  getArmourClasses,
  getChargeTypes,
  getUnitTraits,
  type UnitTrait,
} from "./lookups"

interface UnitRow {
  id: number
  internal_name: string
  name: string | null
  help_text: string | null
  hp: number
  attack: number
  range: number
  min_range: number
  accuracy_percent: number
  attack_delay_seconds: number
  frame_delay: number
  blast_width: number
  max_charge: number
  recharge_rate: number
  recharge_duration: number
  charge_event: number
  charge_type: number
  trait: number
  trait_piece: number | null
  trait_piece_name: string | null
  garrison_capacity: number
  melee_armor: number
  pierce_armor: number
  line_of_sight: number
  speed: number
  reload_time: number
  train_time: number
  cost_food: number
  cost_wood: number
  cost_gold: number
  cost_stone: number
  image_path: string | null
  building_id: number | null
  upgrades_from_id: number | null
  min_age: number | null
  unique_civ: string | null
  civs: string | null
  armours: string | null
  attacks: string | null
  upgrade_tech_id: number | null
  upgrade_name: string | null
  upgrade_research_time: number | null
  upgrade_food: number | null
  upgrade_wood: number | null
  upgrade_gold: number | null
  upgrade_stone: number | null
}

const UNITS_SQL = `
  WITH unit_age AS (
    SELECT unit_id, MIN(age) AS min_age, string_agg(civ_name, ',') AS civs
    FROM civ_units GROUP BY unit_id
  ),
  unique_units AS (
    SELECT unit_id, MIN(civ_name) AS civ_name FROM (
      SELECT castle_age_unique_unit AS unit_id, civ_name FROM civ_uniques
      WHERE castle_age_unique_unit IS NOT NULL
      UNION ALL
      SELECT imperial_age_unique_unit AS unit_id, civ_name FROM civ_uniques
      WHERE imperial_age_unique_unit IS NOT NULL
    ) GROUP BY unit_id
  )
  SELECT
    u.id, u.internal_name, u.hp, u.attack, u.range, u.min_range, u.melee_armor, u.pierce_armor,
    u.accuracy_percent, u.attack_delay_seconds, u.frame_delay, u.blast_width, u.garrison_capacity,
    u.max_charge, u.recharge_rate, u.recharge_duration, u.charge_event, u.charge_type,
    u.trait, u.trait_piece,
    (SELECT n2.name FROM names n2
       WHERE n2.entity_id = u.trait_piece AND n2.entity_type IN ('building', 'unit')
       -- upstream resolves the piece against buildings first, then units
       ORDER BY CASE n2.entity_type WHEN 'building' THEN 0 ELSE 1 END
       LIMIT 1) AS trait_piece_name,
    u.line_of_sight, u.speed, u.reload_time, u.train_time,
    u.cost_food, u.cost_wood, u.cost_gold, u.cost_stone, u.image_path,
    n.name, s.text AS help_text,
    nt.building_id, nt.upgrades_from_id,
    a.min_age, a.civs, uu.civ_name AS unique_civ,
    up.tech_id AS upgrade_tech_id, up.internal_name AS upgrade_name,
    up.research_time AS upgrade_research_time, up.cost_food AS upgrade_food,
    up.cost_wood AS upgrade_wood, up.cost_gold AS upgrade_gold, up.cost_stone AS upgrade_stone,
    (SELECT string_agg(ua.armour_class || ':' || ua.amount, ',')
       FROM unit_armours ua WHERE ua.unit_id = u.id) AS armours,
    (SELECT string_agg(uat.attack_class || ':' || uat.amount, ',')
       FROM unit_attacks uat WHERE uat.unit_id = u.id) AS attacks
  FROM units u
  LEFT JOIN names n ON n.entity_type = 'unit' AND n.entity_id = u.id
  LEFT JOIN strings s ON s.id = u.language_help_id
  LEFT JOIN node_types nt ON nt.entity_type = 'unit' AND nt.entity_id = u.id
  LEFT JOIN unit_age a ON a.unit_id = u.id
  LEFT JOIN unique_units uu ON uu.unit_id = u.id
  LEFT JOIN unit_upgrades up ON up.unit_id = u.id
`

interface Lookups {
  armourClasses: Map<number, ArmourClass>
  chargeTypes: Map<number, ChargeType>
  traits: UnitTrait[]
}

/** Upstream renders a class with a qualifier as "Name (qualifier)". */
function className(classes: Map<number, ArmourClass>, id: number): string {
  const entry = classes.get(id)
  if (!entry) return `Class ${id}`
  return entry.note ? `${entry.name} (${entry.note})` : entry.name
}

/** The trait bitfield, expanded exactly the way upstream expands it. */
function traitNames(row: UnitRow, traits: UnitTrait[]): string[] {
  if (!row.trait) return []
  return traits
    .filter((trait) => (row.trait & trait.bit) !== 0)
    .map((trait) => {
      if (trait.piece_kind) {
        return row.trait_piece_name ? `${trait.name}: ${row.trait_piece_name}` : trait.name
      }
      return trait.note ? `${trait.name} (${trait.note})` : trait.name
    })
}

function toUnit(row: UnitRow, lookups: Lookups): Unit {
  const armours = parseClassPairs(row.armours)
  const attacks = parseClassPairs(row.attacks)
  const help = parseHelpText(row.help_text)

  return {
    id: String(row.id),
    name: row.name || row.internal_name,
    type: deriveUnitType(
      row.building_id,
      armours.map((a) => a.key),
    ),
    age: ageFromId(row.min_age),
    cost: {
      food: row.cost_food || undefined,
      wood: row.cost_wood || undefined,
      gold: row.cost_gold || undefined,
      stone: row.cost_stone || undefined,
    },
    stats: {
      hp: row.hp,
      attack: row.attack,
      attackType: row.range > 0 ? "Pierce" : "Melee",
      meleeArmor: row.melee_armor,
      pierceArmor: row.pierce_armor,
      armorClasses: armours.map((a) => ({
        id: a.key,
        name: className(lookups.armourClasses, a.key),
        amount: a.amount,
      })),
      attackBonuses: attacks.map((a) => ({
        classId: a.key,
        class: className(lookups.armourClasses, a.key),
        bonus: a.amount,
      })),
      range: row.range > 0 ? row.range : undefined,
      minRange: row.min_range > 0 ? row.min_range : undefined,
      attackSpeed: row.reload_time,
      movementSpeed: row.speed,
      lineOfSight: row.line_of_sight,
      trainingTime: row.train_time,
      // Melee attacks never miss; the engine only rolls accuracy for projectiles.
      accuracy: row.range > 0 ? (row.accuracy_percent ?? 100) : 100,
      attackDelay: row.attack_delay_seconds ?? 0,
      frameDelay: row.frame_delay ?? 0,
      blastWidth: row.blast_width ?? 0,
      garrisonCapacity: row.garrison_capacity ?? 0,
      charge:
        row.max_charge > 0
          ? {
              name: lookups.chargeTypes.get(row.charge_type)?.name ?? `Charge type ${row.charge_type}`,
              max: row.max_charge,
              rechargeRate: row.recharge_rate,
              rechargeDuration: row.recharge_duration,
              type: row.charge_type,
              event: row.charge_event,
            }
          : undefined,
      traits: traitNames(row, lookups.traits),
    },
    description: help.description,
    effects: help.effects,
    counters: [],
    goodAgainst: [],
    upgrades: [],
    upgradesFrom: row.upgrades_from_id !== null ? String(row.upgrades_from_id) : undefined,
    upgradeResearch:
      row.upgrade_tech_id !== null
        ? {
            techId: row.upgrade_tech_id,
            name: row.upgrade_name ?? row.internal_name,
            cost: {
              food: row.upgrade_food || undefined,
              wood: row.upgrade_wood || undefined,
              gold: row.upgrade_gold || undefined,
              stone: row.upgrade_stone || undefined,
            },
            researchTime: row.upgrade_research_time ?? 0,
          }
        : undefined,
    civSpecific: row.unique_civ ? civId(row.unique_civ) : undefined,
    availableToCivs: row.civs ? row.civs.split(",").map(civId) : [],
    image_path: row.image_path,
  }
}

export const getAllUnits = cache(async (): Promise<Unit[]> => {
  const [rows, armourClasses, chargeTypes, traits] = await Promise.all([
    queryRows<UnitRow>(`${UNITS_SQL} ORDER BY COALESCE(n.name, u.internal_name)`),
    getArmourClasses(),
    getChargeTypes(),
    getUnitTraits(),
  ])
  const units = rows.map((row) => toUnit(row, { armourClasses, chargeTypes, traits }))

  // Forward upgrade links: A -> B -> C, from each unit's "upgrades from".
  const successors = new Map<string, string[]>()
  for (const unit of units) {
    if (!unit.upgradesFrom) continue
    successors.set(unit.upgradesFrom, [...(successors.get(unit.upgradesFrom) ?? []), unit.id])
  }
  for (const unit of units) {
    const chain: string[] = []
    let frontier = successors.get(unit.id) ?? []
    while (frontier.length > 0) {
      chain.push(...frontier)
      frontier = frontier.flatMap((id) => successors.get(id) ?? [])
    }
    unit.upgrades = chain
  }

  const counters = deriveCounters(units)
  for (const unit of units) {
    const derived = counters.get(unit.id)
    if (!derived) continue
    unit.goodAgainst = derived.goodAgainst
    unit.counters = derived.counters
  }

  return units
})

export const getUnitById = cache(async (id: string): Promise<Unit | null> => {
  const units = await getAllUnits()
  return units.find((unit) => unit.id === id) ?? null
})

export const getUnitsByType = cache(async (type: string): Promise<Unit[]> => {
  const units = await getAllUnits()
  if (type === "all") return units
  return units.filter((unit) => unit.type === type)
})

export const getUnitsByCiv = cache(async (civ: string): Promise<Unit[]> => {
  const units = await getAllUnits()
  return units.filter((unit) => unit.availableToCivs?.includes(civ))
})
