import { SecondaryNav } from "@/components/secondary-nav"
import { getAllCivilizations, getCivilizationTypes } from "@/lib/data"
import { CivilizationsClient } from "./civilizations-client"

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
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />
      <CivilizationsClient allCivs={allCivs} filteredCivs={filteredCivs} />
    </>
  )
}
