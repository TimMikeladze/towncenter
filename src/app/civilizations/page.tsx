import { SecondaryNav } from "@/components/secondary-nav"
import { getAllCivilizations } from "@/lib/data"
import { CivilizationsClient } from "./civilizations-client"

const civTypes = ["all", "Archer", "Cavalry", "Infantry", "Defensive", "Naval", "Monk"] as const

const secondaryNavItems = [
  { label: "All Civs", value: "all" },
  { label: "Archer", value: "Archer" },
  { label: "Cavalry", value: "Cavalry" },
  { label: "Infantry", value: "Infantry" },
  { label: "Defensive", value: "Defensive" },
  { label: "Naval", value: "Naval" },
  { label: "Monk", value: "Monk" },
]

export default async function CivilizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const params = await searchParams
  const activeTab = params.type || "all"
  const allCivs = await getAllCivilizations()

  const filteredCivs = activeTab === "all" ? allCivs : allCivs.filter((civ) => civ.type === activeTab)

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />
      <CivilizationsClient allCivs={allCivs} filteredCivs={filteredCivs} />
    </>
  )
}
