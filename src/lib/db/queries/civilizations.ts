import { cache } from "react"
import { civId } from "@/lib/game/ids"
import { parseCivHelpText } from "@/lib/game/text"
import type { Civilization } from "@/lib/types"
import { queryRows } from "../connection"
import { getAllBuildings } from "./buildings"
import { getAllTechnologies } from "./technologies"
import { getAllUnits } from "./units"

interface CivRow {
  name: string
  image_path: string | null
  help_text: string | null
  castle_age_unique_unit: number | null
  imperial_age_unique_unit: number | null
  castle_age_unique_tech: number | null
  imperial_age_unique_tech: number | null
}

const CIVS_SQL = `
  SELECT
    c.name, c.image_path, s.text AS help_text,
    cu.castle_age_unique_unit, cu.imperial_age_unique_unit,
    cu.castle_age_unique_tech, cu.imperial_age_unique_tech
  FROM civilizations c
  LEFT JOIN civ_uniques cu ON c.name = cu.civ_name
  LEFT JOIN civ_helptexts h ON h.name = c.name
  LEFT JOIN strings s ON s.id = h.string_id
  ORDER BY c.name
`

export const getAllCivilizations = cache(async (): Promise<Civilization[]> => {
  const [rows, units, techs, buildings] = await Promise.all([
    queryRows<CivRow>(CIVS_SQL),
    getAllUnits(),
    getAllTechnologies(),
    getAllBuildings(),
  ])

  // Anything shared by more than one civ is something a civ can be missing;
  // another civ's unique unit is not.
  const sharedUnits = units.filter((u) => !u.civSpecific && (u.availableToCivs?.length ?? 0) > 1)
  const sharedTechs = techs.filter((t) => !t.civSpecific && (t.availableToCivs?.length ?? 0) > 1)
  const sharedBuildings = buildings.filter((b) => (b.availableToCivs?.length ?? 0) > 1)

  return rows.map((row) => {
    const id = civId(row.name)
    const help = parseCivHelpText(row.help_text, row.name)

    return {
      id,
      name: row.name,
      type: help.types[0] ?? "Unknown",
      types: help.types,
      bonuses: help.bonuses,
      uniqueUnits: [row.castle_age_unique_unit, row.imperial_age_unique_unit]
        .filter((unitId): unitId is number => unitId !== null)
        .map(String),
      uniqueTechs: {
        castle: row.castle_age_unique_tech !== null ? String(row.castle_age_unique_tech) : "",
        imperial: row.imperial_age_unique_tech !== null ? String(row.imperial_age_unique_tech) : "",
      },
      teamBonus: help.teamBonus,
      strengths: help.types,
      uniqueTechDescriptions: help.uniqueTechDescriptions,
      techTree: {
        missingUnits: sharedUnits.filter((u) => !u.availableToCivs?.includes(id)).map((u) => u.id),
        missingTechs: sharedTechs.filter((t) => !t.availableToCivs?.includes(id)).map((t) => t.id),
        missingBuildings: sharedBuildings.filter((b) => !b.availableToCivs?.includes(id)).map((b) => b.id),
      },
      image_path: row.image_path,
    }
  })
})

export const getCivilizationById = cache(async (id: string): Promise<Civilization | null> => {
  const civs = await getAllCivilizations()
  return civs.find((civ) => civ.id === id) ?? null
})

/** Every civ focus the game data mentions, e.g. Infantry, Naval, Gunpowder. */
export const getCivilizationTypes = cache(async (): Promise<string[]> => {
  const civs = await getAllCivilizations()
  return [...new Set(civs.flatMap((civ) => civ.types))].sort()
})
