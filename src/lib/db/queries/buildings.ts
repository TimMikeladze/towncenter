import { cache } from "react"
import { ageFromId, deriveBuildingType } from "@/lib/game/classes"
import { civId } from "@/lib/game/ids"
import { parseHelpText } from "@/lib/game/text"
import type { Building } from "@/lib/types"
import { queryRows } from "../connection"
import { parseClassPairs } from "./combat-pairs"
import { type ArmourClass, getArmourClasses } from "./lookups"

interface BuildingRow {
  id: number
  internal_name: string
  name: string | null
  help_text: string | null
  hp: number
  attack: number
  range: number
  min_range: number
  reload_time: number
  accuracy_percent: number
  melee_armor: number
  pierce_armor: number
  line_of_sight: number
  garrison_capacity: number
  train_time: number
  cost_food: number
  cost_wood: number
  cost_gold: number
  cost_stone: number
  image_path: string | null
  min_age: number | null
  civs: string | null
  trains_units: string | null
  researches_techs: string | null
  armours: string | null
  attacks: string | null
}

const BUILDINGS_SQL = `
  WITH building_age AS (
    SELECT building_id, MIN(age) AS min_age, string_agg(civ_name, ',') AS civs
    FROM civ_buildings GROUP BY building_id
  )
  SELECT
    b.id, b.internal_name, b.hp, b.attack, b.range, b.min_range, b.reload_time,
    b.accuracy_percent, b.melee_armor, b.pierce_armor, b.line_of_sight,
    b.garrison_capacity, b.train_time, b.cost_food, b.cost_wood, b.cost_gold,
    b.cost_stone, b.image_path,
    n.name, s.text AS help_text, a.min_age, a.civs,
    (SELECT string_agg(nt.entity_id, ',')
       FROM node_types nt WHERE nt.entity_type = 'unit' AND nt.building_id = b.id) AS trains_units,
    (SELECT string_agg(nt.entity_id, ',')
       FROM node_types nt WHERE nt.entity_type = 'tech' AND nt.building_id = b.id) AS researches_techs,
    (SELECT string_agg(ba.armour_class || ':' || ba.amount, ',')
       FROM building_armours ba WHERE ba.building_id = b.id) AS armours,
    (SELECT string_agg(bat.attack_class || ':' || bat.amount, ',')
       FROM building_attacks bat WHERE bat.building_id = b.id) AS attacks
  FROM buildings b
  LEFT JOIN names n ON n.entity_type = 'building' AND n.entity_id = b.id
  LEFT JOIN strings s ON s.id = b.language_help_id
  LEFT JOIN building_age a ON a.building_id = b.id
`

function idList(raw: string | null): string[] {
  return raw ? raw.split(",").filter(Boolean) : []
}

/** Upstream renders a class with a qualifier as "Name (qualifier)". */
function className(classes: Map<number, ArmourClass>, id: number): string {
  const entry = classes.get(id)
  if (!entry) return `Class ${id}`
  return entry.note ? `${entry.name} (${entry.note})` : entry.name
}

function toBuilding(row: BuildingRow, armourClasses: Map<number, ArmourClass>): Building {
  const help = parseHelpText(row.help_text)
  const armours = parseClassPairs(row.armours)
  const attacks = parseClassPairs(row.attacks)
  return {
    id: String(row.id),
    name: row.name || row.internal_name,
    type: deriveBuildingType(row.id),
    age: ageFromId(row.min_age),
    cost: {
      food: row.cost_food || undefined,
      wood: row.cost_wood || undefined,
      gold: row.cost_gold || undefined,
      stone: row.cost_stone || undefined,
    },
    buildTime: row.train_time || 0,
    hitPoints: row.hp,
    meleeArmor: row.melee_armor,
    pierceArmor: row.pierce_armor,
    lineOfSight: row.line_of_sight,
    garrisonCapacity: row.garrison_capacity || undefined,
    attack: row.attack ?? 0,
    // Every building that shoots does so with a projectile.
    attackType: "Pierce",
    range: row.range > 0 ? row.range : undefined,
    minRange: row.min_range > 0 ? row.min_range : undefined,
    attackSpeed: row.reload_time ?? 0,
    accuracy: row.accuracy_percent ?? 100,
    armorClasses: armours.map((armour) => ({
      id: armour.key,
      name: className(armourClasses, armour.key),
      amount: armour.amount,
    })),
    attackBonuses: attacks.map((attack) => ({
      classId: attack.key,
      class: className(armourClasses, attack.key),
      bonus: attack.amount,
    })),
    description: help.description,
    trainsUnits: idList(row.trains_units),
    researchesTechs: idList(row.researches_techs),
    upgrades: [],
    availableToCivs: row.civs ? row.civs.split(",").map(civId) : [],
    image_path: row.image_path,
  }
}

export const getAllBuildings = cache(async (): Promise<Building[]> => {
  const [rows, armourClasses] = await Promise.all([
    queryRows<BuildingRow>(`${BUILDINGS_SQL} ORDER BY COALESCE(n.name, b.internal_name)`),
    getArmourClasses(),
  ])
  return rows.map((row) => toBuilding(row, armourClasses))
})

export const getBuildingById = cache(async (id: string): Promise<Building | null> => {
  if (!/^\d+$/.test(id)) return null
  const [rows, armourClasses] = await Promise.all([
    queryRows<BuildingRow>(`${BUILDINGS_SQL} WHERE b.id = ${Number(id)}`),
    getArmourClasses(),
  ])
  return rows.length > 0 ? toBuilding(rows[0], armourClasses) : null
})

export const getBuildingsByType = cache(async (type: string): Promise<Building[]> => {
  const buildings = await getAllBuildings()
  if (type === "all") return buildings
  return buildings.filter((building) => building.type === type)
})

export const getBuildingsByCiv = cache(async (civ: string): Promise<Building[]> => {
  const buildings = await getAllBuildings()
  return buildings.filter((building) => building.availableToCivs?.includes(civ))
})
