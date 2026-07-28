import { cache } from "react"
import { ageFromId } from "@/lib/game/classes"
import { civId } from "@/lib/game/ids"
import { parseHelpText } from "@/lib/game/text"
import type { Technology } from "@/lib/types"
import { queryRows } from "../connection"

interface TechRow {
  id: number
  internal_name: string
  name: string | null
  help_text: string | null
  research_time: number
  cost_food: number
  cost_wood: number
  cost_gold: number
  cost_stone: number
  image_path: string | null
  min_age: number | null
  civs: string | null
  building_name: string | null
  unique_civ: string | null
}

const TECHS_SQL = `
  WITH tech_age AS (
    SELECT tech_id, MIN(age) AS min_age, string_agg(civ_name, ',') AS civs
    FROM civ_techs GROUP BY tech_id
  ),
  unique_techs AS (
    SELECT tech_id, MIN(civ_name) AS civ_name FROM (
      SELECT castle_age_unique_tech AS tech_id, civ_name FROM civ_uniques
      WHERE castle_age_unique_tech IS NOT NULL
      UNION ALL
      SELECT imperial_age_unique_tech AS tech_id, civ_name FROM civ_uniques
      WHERE imperial_age_unique_tech IS NOT NULL
    ) GROUP BY tech_id
  )
  SELECT
    t.id, t.internal_name, t.research_time, t.cost_food, t.cost_wood, t.cost_gold,
    t.cost_stone, t.image_path,
    n.name, s.text AS help_text, a.min_age, a.civs,
    bn.name AS building_name, ut.civ_name AS unique_civ
  FROM techs t
  LEFT JOIN names n ON n.entity_type = 'tech' AND n.entity_id = t.id
  LEFT JOIN strings s ON s.id = t.language_help_id
  LEFT JOIN node_types nt ON nt.entity_type = 'tech' AND nt.entity_id = t.id
  LEFT JOIN names bn ON bn.entity_type = 'building' AND bn.entity_id = nt.building_id
  LEFT JOIN tech_age a ON a.tech_id = t.id
  LEFT JOIN unique_techs ut ON ut.tech_id = t.id
`

function toTechnology(row: TechRow): Technology {
  const help = parseHelpText(row.help_text)
  return {
    id: String(row.id),
    name: row.name || row.internal_name,
    category: row.unique_civ ? "Unique" : (row.building_name ?? "Other"),
    age: ageFromId(row.min_age),
    cost: {
      food: row.cost_food || undefined,
      wood: row.cost_wood || undefined,
      gold: row.cost_gold || undefined,
      stone: row.cost_stone || undefined,
    },
    researchTime: row.research_time || 0,
    description: help.description,
    effects: help.effects,
    affectedUnits: [],
    affectedBuildings: [],
    civSpecific: row.unique_civ ? civId(row.unique_civ) : undefined,
    availableToCivs: row.civs ? row.civs.split(",").map(civId) : [],
    image_path: row.image_path,
  }
}

export const getAllTechnologies = cache(async (): Promise<Technology[]> => {
  const rows = await queryRows<TechRow>(`${TECHS_SQL} ORDER BY COALESCE(n.name, t.internal_name)`)
  return rows.map(toTechnology)
})

export const getTechnologyById = cache(async (id: string): Promise<Technology | null> => {
  if (!/^\d+$/.test(id)) return null
  const rows = await queryRows<TechRow>(`${TECHS_SQL} WHERE t.id = ${Number(id)}`)
  return rows.length > 0 ? toTechnology(rows[0]) : null
})

export const getTechnologiesByCategory = cache(async (category: string): Promise<Technology[]> => {
  const techs = await getAllTechnologies()
  if (category === "all") return techs
  return techs.filter((tech) => tech.category === category)
})

export const getTechnologiesByCiv = cache(async (civ: string): Promise<Technology[]> => {
  const techs = await getAllTechnologies()
  return techs.filter((tech) => tech.availableToCivs?.includes(civ))
})
