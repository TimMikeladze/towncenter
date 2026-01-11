import { units } from "@/data/units"
import { civilizations } from "@/data/civilizations"
import { buildOrders } from "@/data/build-orders"
import { matchups } from "@/data/matchups"
import { buildings } from "@/data/buildings"
import { technologies } from "@/data/technologies"
import { maps } from "@/data/maps"
import type { Unit, Civilization, BuildOrder, Matchup, Building, Technology, Map } from "@/lib/types"

export function getAllUnits(): Unit[] {
  return units
}

export function getUnitById(id: string): Unit | undefined {
  return units.find((u) => u.id === id)
}

export function getUnitsByType(type: string): Unit[] {
  if (type === "all") return units
  return units.filter((u) => u.type === type)
}

export function getUnitsByCiv(civId: string): Unit[] {
  return units.filter((u) => !u.civSpecific || u.civSpecific === civId)
}

export function getAllCivilizations(): Civilization[] {
  return civilizations
}

export function getCivilizationById(id: string): Civilization | undefined {
  return civilizations.find((c) => c.id === id)
}

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

export function getAllBuildings(): Building[] {
  return buildings
}

export function getBuildingById(id: string): Building | undefined {
  return buildings.find((b) => b.id === id)
}

export function getBuildingsByType(type: string): Building[] {
  if (type === "all") return buildings
  return buildings.filter((b) => b.type === type)
}

export function getAllTechnologies(): Technology[] {
  return technologies
}

export function getTechnologyById(id: string): Technology | undefined {
  return technologies.find((t) => t.id === id)
}

export function getTechnologiesByCategory(category: string): Technology[] {
  if (category === "all") return technologies
  return technologies.filter((t) => t.category === category)
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
