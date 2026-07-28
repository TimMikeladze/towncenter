import { cache } from "react"
import { ageFromId, deriveBuildingType } from "@/lib/game/classes"
import { civId } from "@/lib/game/ids"
import { parseHelpText } from "@/lib/game/text"
import type { Building } from "@/lib/types"
import { queryRows } from "../connection"

interface BuildingRow {
  id: number
  internal_name: string
  name: string | null
  help_text: string | null
  hp: number
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
}

const BUILDINGS_SQL = `
  WITH building_age AS (
    SELECT building_id, MIN(age) AS min_age, string_agg(civ_name, ',') AS civs
    FROM civ_buildings GROUP BY building_id
  )
  SELECT
    b.id, b.internal_name, b.hp, b.melee_armor, b.pierce_armor, b.line_of_sight,
    b.garrison_capacity, b.train_time, b.cost_food, b.cost_wood, b.cost_gold,
    b.cost_stone, b.image_path,
    n.name, s.text AS help_text, a.min_age, a.civs,
    (SELECT string_agg(nt.entity_id, ',')
       FROM node_types nt WHERE nt.entity_type = 'unit' AND nt.building_id = b.id) AS trains_units,
    (SELECT string_agg(nt.entity_id, ',')
       FROM node_types nt WHERE nt.entity_type = 'tech' AND nt.building_id = b.id) AS researches_techs
  FROM buildings b
  LEFT JOIN names n ON n.entity_type = 'building' AND n.entity_id = b.id
  LEFT JOIN strings s ON s.id = b.language_help_id
  LEFT JOIN building_age a ON a.building_id = b.id
`

function idList(raw: string | null): string[] {
  return raw ? raw.split(",").filter(Boolean) : []
}

function toBuilding(row: BuildingRow): Building {
  const help = parseHelpText(row.help_text)
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
    description: help.description,
    trainsUnits: idList(row.trains_units),
    researchesTechs: idList(row.researches_techs),
    upgrades: [],
    availableToCivs: row.civs ? row.civs.split(",").map(civId) : [],
    image_path: row.image_path,
  }
}

export const getAllBuildings = cache(async (): Promise<Building[]> => {
  const rows = await queryRows<BuildingRow>(`${BUILDINGS_SQL} ORDER BY COALESCE(n.name, b.internal_name)`)
  return rows.map(toBuilding)
})

export const getBuildingById = cache(async (id: string): Promise<Building | null> => {
  if (!/^\d+$/.test(id)) return null
  const rows = await queryRows<BuildingRow>(`${BUILDINGS_SQL} WHERE b.id = ${Number(id)}`)
  return rows.length > 0 ? toBuilding(rows[0]) : null
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
