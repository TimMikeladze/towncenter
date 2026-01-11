import { getConnection } from '../connection'
import type { Civilization } from '@/lib/types'

export async function getAllCivilizations(): Promise<Civilization[]> {
  const conn = await getConnection()

  const reader = await conn.runAndReadAll(`
    SELECT
      c.name,
      c.image_path,
      cu.castle_age_unique_unit,
      cu.imperial_age_unique_unit,
      cu.castle_age_unique_tech,
      cu.imperial_age_unique_tech
    FROM civilizations c
    LEFT JOIN civ_uniques cu ON c.name = cu.civ_name
    ORDER BY c.name
  `)

  const rows = reader.getRowObjects()

  // Transform database rows to application types
  // Note: This is a simplified mapping - you'll need to enrich with bonuses,
  // strengths, weaknesses, etc. from other tables or JSON data
  return rows.map((row: any) => ({
    id: row.name.toLowerCase().replace(/\s+/g, '-'),
    name: row.name,
    type: "Archer", // TODO: Derive from civ characteristics
    bonuses: [], // TODO: Query from additional tables or supplement
    uniqueUnits: [
      row.castle_age_unique_unit?.toString(),
      row.imperial_age_unique_unit?.toString()
    ].filter(Boolean),
    uniqueTechs: {
      castle: row.castle_age_unique_tech?.toString() || "",
      imperial: row.imperial_age_unique_tech?.toString() || ""
    },
    teamBonus: "", // TODO: Supplement from additional data
    strengths: [], // TODO: Supplement from additional data
    weaknesses: [], // TODO: Supplement from additional data
    techTree: {
      missingUnits: [],
      missingTechs: []
    }
  }))
}

export async function getCivilizationById(id: string): Promise<Civilization | null> {
  const civs = await getAllCivilizations()
  return civs.find(c => c.id === id) || null
}
