import { cache } from "react"
import { ageFromId } from "@/lib/game/classes"
import type { Age, Building, Civilization, Technology, Unit } from "@/lib/types"
import { queryRows } from "../connection"
import { getAllBuildings } from "./buildings"
import { getCivilizationById } from "./civilizations"
import { getAllTechnologies } from "./technologies"
import { getAllUnits } from "./units"

interface CivEntityRow {
  entity_type: string
  entity_id: number
  age: number
}

/** Everything one civ can train, build and research, with the age it unlocks. */
export interface CivTechTree {
  civ: Civilization
  units: { entity: Unit; age: Age }[]
  buildings: { entity: Building; age: Age }[]
  techs: { entity: Technology; age: Age }[]
}

const CIV_ENTITIES_SQL = (civName: string) => `
  SELECT 'unit' AS entity_type, unit_id AS entity_id, age FROM civ_units WHERE civ_name = '${civName}'
  UNION ALL
  SELECT 'building', building_id, age FROM civ_buildings WHERE civ_name = '${civName}'
  UNION ALL
  SELECT 'tech', tech_id, age FROM civ_techs WHERE civ_name = '${civName}'
`

export const getCivTechTree = cache(async (id: string): Promise<CivTechTree | null> => {
  const civ = await getCivilizationById(id)
  if (!civ) return null

  const rows = await queryRows<CivEntityRow>(CIV_ENTITIES_SQL(civ.name.replace(/'/g, "''")))
  const [units, buildings, techs] = await Promise.all([getAllUnits(), getAllBuildings(), getAllTechnologies()])

  const ages = new Map(rows.map((row) => [`${row.entity_type}:${row.entity_id}`, ageFromId(row.age)]))
  const pick = <T extends { id: string }>(items: T[], kind: string) =>
    items
      .filter((item) => ages.has(`${kind}:${item.id}`))
      .map((entity) => ({ entity, age: ages.get(`${kind}:${entity.id}`) as Age }))

  return {
    civ,
    units: pick(units, "unit"),
    buildings: pick(buildings, "building"),
    techs: pick(techs, "tech"),
  }
})

export interface CivComparison {
  a: Civilization
  b: Civilization
  onlyA: { units: Unit[]; techs: Technology[]; buildings: Building[] }
  onlyB: { units: Unit[]; techs: Technology[]; buildings: Building[] }
}

/** Set difference between two civs' tech trees. */
export const compareCivilizations = cache(async (idA: string, idB: string): Promise<CivComparison | null> => {
  const [treeA, treeB] = await Promise.all([getCivTechTree(idA), getCivTechTree(idB)])
  if (!treeA || !treeB) return null

  const idsOf = (tree: CivTechTree, kind: keyof Omit<CivTechTree, "civ">) =>
    new Set(tree[kind].map((item) => item.entity.id))

  const diff = <T extends { id: string }>(from: { entity: T }[], other: Set<string>) =>
    from.filter((item) => !other.has(item.entity.id)).map((item) => item.entity)

  return {
    a: treeA.civ,
    b: treeB.civ,
    onlyA: {
      units: diff(treeA.units, idsOf(treeB, "units")),
      techs: diff(treeA.techs, idsOf(treeB, "techs")),
      buildings: diff(treeA.buildings, idsOf(treeB, "buildings")),
    },
    onlyB: {
      units: diff(treeB.units, idsOf(treeA, "units")),
      techs: diff(treeB.techs, idsOf(treeA, "techs")),
      buildings: diff(treeB.buildings, idsOf(treeA, "buildings")),
    },
  }
})
