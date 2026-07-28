import { cache } from "react"
import { getAllBuildings } from "./buildings"
import { getAllCivilizations } from "./civilizations"
import { getAllTechnologies } from "./technologies"
import { getAllUnits } from "./units"

export interface SearchEntry {
  id: string
  name: string
  kind: "Unit" | "Civilization" | "Technology" | "Building"
  subtitle: string
  href: string
}

/** Flat index behind the ⌘K palette. */
export const getSearchIndex = cache(async (): Promise<SearchEntry[]> => {
  const [units, civs, techs, buildings] = await Promise.all([
    getAllUnits(),
    getAllCivilizations(),
    getAllTechnologies(),
    getAllBuildings(),
  ])

  return [
    ...units.map(
      (unit): SearchEntry => ({
        id: `unit-${unit.id}`,
        name: unit.name,
        kind: "Unit",
        subtitle: `${unit.type} • ${unit.age} Age`,
        href: `/units/${unit.id}`,
      }),
    ),
    ...civs.map(
      (civ): SearchEntry => ({
        id: `civ-${civ.id}`,
        name: civ.name,
        kind: "Civilization",
        subtitle: civ.types.join(" / "),
        href: `/civilizations/${civ.id}`,
      }),
    ),
    ...techs.map(
      (tech): SearchEntry => ({
        id: `tech-${tech.id}`,
        name: tech.name,
        kind: "Technology",
        subtitle: `${tech.category} • ${tech.age} Age`,
        href: `/technologies/${tech.id}`,
      }),
    ),
    ...buildings.map(
      (building): SearchEntry => ({
        id: `building-${building.id}`,
        name: building.name,
        kind: "Building",
        subtitle: `${building.type} • ${building.age} Age`,
        href: `/buildings/${building.id}`,
      }),
    ),
  ]
})
