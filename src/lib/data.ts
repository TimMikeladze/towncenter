import type { Unit, Civilization, BuildOrder, Matchup, Building, Technology, Map } from "@/lib/types"

// Import DuckDB queries
import { getAllUnits as dbGetAllUnits, getUnitById as dbGetUnitById, getUnitsByType as dbGetUnitsByType } from "./db/queries/units"
import { getAllCivilizations as dbGetAllCivilizations, getCivilizationById as dbGetCivilizationById } from "./db/queries/civilizations"
import { getAllBuildings as dbGetAllBuildings, getBuildingById as dbGetBuildingById, getBuildingsByType as dbGetBuildingsByType } from "./db/queries/buildings"
import { getAllTechnologies as dbGetAllTechnologies, getTechnologyById as dbGetTechnologyById, getTechnologiesByCategory as dbGetTechnologiesByCategory } from "./db/queries/technologies"

// Keep mock data for features not yet migrated
import { buildOrders } from "@/data/build-orders"
import { matchups } from "@/data/matchups"
import { maps } from "@/data/maps"

export async function getAllUnits(): Promise<Unit[]> {
  return await dbGetAllUnits()
}

export async function getUnitById(id: string): Promise<Unit | undefined> {
  return await dbGetUnitById(id) || undefined
}

export async function getUnitsByType(type: string): Promise<Unit[]> {
  return await dbGetUnitsByType(type)
}

export function getUnitsByCiv(civId: string): Unit[] {
  // TODO: Implement with DuckDB civ_units table
  return []
}

export async function getAllCivilizations(): Promise<Civilization[]> {
  return await dbGetAllCivilizations()
}

export async function getCivilizationById(id: string): Promise<Civilization | undefined> {
  return await dbGetCivilizationById(id) || undefined
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

export async function getAllBuildings(): Promise<Building[]> {
  return await dbGetAllBuildings()
}

export async function getBuildingById(id: string): Promise<Building | undefined> {
  return await dbGetBuildingById(id) || undefined
}

export async function getBuildingsByType(type: string): Promise<Building[]> {
  return await dbGetBuildingsByType(type)
}

export async function getAllTechnologies(): Promise<Technology[]> {
  return await dbGetAllTechnologies()
}

export async function getTechnologyById(id: string): Promise<Technology | undefined> {
  return await dbGetTechnologyById(id) || undefined
}

export async function getTechnologiesByCategory(category: string): Promise<Technology[]> {
  return await dbGetTechnologiesByCategory(category)
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
