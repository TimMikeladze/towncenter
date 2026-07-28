import type { BuildOrder, GameMap, Matchup } from "@/lib/types"

export {
  getAllBuildings,
  getBuildingById,
  getBuildingsByCiv,
  getBuildingsByType,
} from "./db/queries/buildings"
export {
  getAllCivilizations,
  getCivilizationById,
  getCivilizationTypes,
} from "./db/queries/civilizations"
export { compareCivilizations, getCivTechTree } from "./db/queries/tech-tree"
export {
  getAllTechnologies,
  getTechnologiesByCategory,
  getTechnologiesByCiv,
  getTechnologyById,
} from "./db/queries/technologies"
// DuckDB-backed queries
export {
  getAllUnits,
  getUnitById,
  getUnitsByCiv,
  getUnitsByType,
} from "./db/queries/units"

// Static content that has no upstream game-data equivalent
import { buildOrders } from "@/data/build-orders"
import { maps } from "@/data/maps"
import { matchups } from "@/data/matchups"

export function getAllBuildOrders(): BuildOrder[] {
  return buildOrders
}

export function getBuildOrdersByCiv(civId: string): BuildOrder[] {
  return buildOrders.filter((bo) => bo.civs.includes(civId))
}

export function getAllMatchups(): Matchup[] {
  return matchups
}

export function getMatchupsByCiv(civId: string): Matchup[] {
  return matchups.filter((m) => m.civA === civId || m.civB === civId)
}

export function getMatchup(civA: string, civB: string): Matchup | undefined {
  return matchups.find((m) => (m.civA === civA && m.civB === civB) || (m.civA === civB && m.civB === civA))
}

export function getAllMaps(): GameMap[] {
  return maps
}

export function getMapById(id: string): GameMap | undefined {
  return maps.find((m) => m.id === id)
}

export function getMapsByType(type: string): GameMap[] {
  if (type === "all") return maps
  return maps.filter((m) => m.type === type)
}
