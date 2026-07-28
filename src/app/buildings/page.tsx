import { SecondaryNav } from "@/components/secondary-nav"
import { getAllBuildings } from "@/lib/data"
import { BuildingsClient } from "./buildings-client"

const secondaryNavItems = [
  { label: "All", value: "all" },
  { label: "Military", value: "Military" },
  { label: "Economic", value: "Eco" },
  { label: "Science", value: "Science" },
  { label: "Defense", value: "Tower" },
]

export default async function BuildingsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams
  const activeTab = params.type || "all"
  const buildings = await getAllBuildings()

  const filteredBuildings = activeTab === "all" ? buildings : buildings.filter((b) => b.type === activeTab)

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />
      <BuildingsClient allBuildings={buildings} filteredBuildings={filteredBuildings} />
    </>
  )
}
