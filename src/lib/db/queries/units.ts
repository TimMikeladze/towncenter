import { cache } from "react"
import { ageFromId, armourClassName, deriveUnitType } from "@/lib/game/classes"
import { deriveCounters } from "@/lib/game/combat"
import { civId } from "@/lib/game/ids"
import { parseHelpText } from "@/lib/game/text"
import type { Unit } from "@/lib/types"
import { queryRows } from "../connection"

interface UnitRow {
  id: number
  internal_name: string
  name: string | null
  help_text: string | null
  hp: number
  attack: number
  range: number
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
    u.id, u.internal_name, u.hp, u.attack, u.range, u.melee_armor, u.pierce_armor,
    u.line_of_sight, u.speed, u.reload_time, u.train_time,
    u.cost_food, u.cost_wood, u.cost_gold, u.cost_stone, u.image_path,
    n.name, s.text AS help_text,
    nt.building_id, nt.upgrades_from_id,
    a.min_age, a.civs, uu.civ_name AS unique_civ,
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
`

function parsePairs(raw: string | null): { key: number; amount: number }[] {
  if (!raw) return []
  const seen = new Map<number, number>()
  for (const entry of raw.split(",")) {
    const [key, amount] = entry.split(":")
    const id = Number(key)
    if (Number.isNaN(id) || seen.has(id)) continue
    seen.set(id, Number(amount))
  }
  return [...seen].map(([key, amount]) => ({ key, amount }))
}

function toUnit(row: UnitRow): Unit {
  const armours = parsePairs(row.armours)
  const attacks = parsePairs(row.attacks)
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
      armorClasses: armours.map((a) => ({ id: a.key, name: armourClassName(a.key), amount: a.amount })),
      attackBonuses: attacks.map((a) => ({
        classId: a.key,
        class: armourClassName(a.key),
        bonus: a.amount,
      })),
      range: row.range > 0 ? row.range : undefined,
      attackSpeed: row.reload_time,
      movementSpeed: row.speed,
      lineOfSight: row.line_of_sight,
      trainingTime: row.train_time,
    },
    description: help.description,
    effects: help.effects,
    counters: [],
    goodAgainst: [],
    upgrades: [],
    upgradesFrom: row.upgrades_from_id !== null ? String(row.upgrades_from_id) : undefined,
    civSpecific: row.unique_civ ? civId(row.unique_civ) : undefined,
    availableToCivs: row.civs ? row.civs.split(",").map(civId) : [],
    image_path: row.image_path,
  }
}

export const getAllUnits = cache(async (): Promise<Unit[]> => {
  const rows = await queryRows<UnitRow>(`${UNITS_SQL} ORDER BY COALESCE(n.name, u.internal_name)`)
  const units = rows.map(toUnit)

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
