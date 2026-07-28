// Client-safe data exports that don't depend on DuckDB
import { buildOrders } from "@/data/build-orders"
import { maps } from "@/data/maps"
import { matchups } from "@/data/matchups"
import type { BuildOrder, GameMap, Matchup } from "./types"

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
