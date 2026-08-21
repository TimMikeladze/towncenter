import type { Metadata } from "next"
import { SecondaryNav } from "@/components/secondary-nav"
import { JsonLd } from "@/components/seo/json-ld"
import { getAllCivilizations, getCivilizationTypes } from "@/lib/data"
import { breadcrumbList, pageMetadata } from "@/lib/seo"
import { CivilizationsClient } from "./civilizations-client"

export async function generateMetadata(): Promise<Metadata> {
  const civs = await getAllCivilizations()
  return pageMetadata({
    title: "AoE2 civilizations — bonuses, unique units and tech trees",
    description: `All ${civs.length} Age of Empires II: Definitive Edition civilizations with their bonuses, team bonus, unique units and unique technologies — and what each one is missing.`,
    path: "/civilizations",
    eyebrow: "Civilizations",
    imageSubtitle: `All ${civs.length} civilizations, their bonuses and their tech tree gaps.`,
  })
}

export default async function CivilizationsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams
  const activeTab = params.type || "all"
  const [allCivs, types] = await Promise.all([getAllCivilizations(), getCivilizationTypes()])

  // The focus list comes from the game's own civ descriptions, so every tab
  // returns results.
  const secondaryNavItems = [
    { label: "All Civs", value: "all" },
    ...types.map((type) => ({ label: type, value: type })),
  ]

  const filteredCivs = activeTab === "all" ? allCivs : allCivs.filter((civ) => civ.types.includes(activeTab))

  return (
    <>
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Civilizations", path: "/civilizations" },
        ])}
      />
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />
      <CivilizationsClient allCivs={allCivs} filteredCivs={filteredCivs} />
    </>
  )
}
