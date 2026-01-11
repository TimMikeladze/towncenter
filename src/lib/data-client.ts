// Client-safe data exports that don't depend on DuckDB
import { buildOrders } from "@/data/build-orders"
import { matchups } from "@/data/matchups"
import { maps } from "@/data/maps"
import type { BuildOrder, Matchup, Map } from "./types"

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
  return matchups.find(
    (m) => (m.civA === civA && m.civB === civB) || (m.civA === civB && m.civB === civA)
  )
}

export function getAllMaps(): Map[] {
  return maps
}

export function getMapById(id: string): Map | undefined {
  return maps.find((m) => m.id === id)
}

export function getMapsByType(type: string): Map[] {
  if (type === "all") return maps
  return maps.filter((m) => m.type === type)
}
