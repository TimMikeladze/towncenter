import { notFound } from "next/navigation"
import { getAllCivilizations, getCivTechTree } from "@/lib/data"
import { TechTreeClient } from "./tech-tree-client"

export default async function TechTreePage({
  searchParams,
}: {
  searchParams: Promise<{ civ?: string; age?: string }>
}) {
  const params = await searchParams
  const civs = await getAllCivilizations()
  if (civs.length === 0) notFound()

  // Default to a real civ from the data rather than a hardcoded id.
  const requested = params.civ && civs.some((civ) => civ.id === params.civ) ? params.civ : civs[0].id
  const tree = await getCivTechTree(requested)
  if (!tree) notFound()

  return (
    <TechTreeClient
      civs={civs.map((civ) => ({ id: civ.id, name: civ.name }))}
      civ={{
        id: tree.civ.id,
        name: tree.civ.name,
        types: tree.civ.types,
        teamBonus: tree.civ.teamBonus,
        bonuses: tree.civ.bonuses,
      }}
      roots={tree.roots}
      counts={{
        units: tree.units.length,
        buildings: tree.buildings.length,
        techs: tree.techs.length,
      }}
      selectedAge={params.age ?? "all"}
    />
  )
}
