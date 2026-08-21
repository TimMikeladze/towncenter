import type { Metadata } from "next"
import { SecondaryNav } from "@/components/secondary-nav"
import { JsonLd } from "@/components/seo/json-ld"
import { getAllBuildings } from "@/lib/data"
import { breadcrumbList, pageMetadata } from "@/lib/seo"
import { BuildingsClient } from "./buildings-client"

const secondaryNavItems = [
  { label: "All", value: "all" },
  { label: "Military", value: "Military" },
  { label: "Economic", value: "Eco" },
  { label: "Science", value: "Science" },
  { label: "Defense", value: "Tower" },
]

export async function generateMetadata(): Promise<Metadata> {
  const buildings = await getAllBuildings()
  return pageMetadata({
    title: "AoE2 buildings — hit points, cost and build time",
    description: `All ${buildings.length} Age of Empires II: Definitive Edition buildings with hit points, armor, cost, build time, and what each one trains and researches.`,
    path: "/buildings",
    eyebrow: "Buildings",
    imageSubtitle: `All ${buildings.length} buildings, from Town Center to Bombard Tower.`,
  })
}

export default async function BuildingsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams
  const activeTab = params.type || "all"
  const buildings = await getAllBuildings()

  const filteredBuildings = activeTab === "all" ? buildings : buildings.filter((b) => b.type === activeTab)

  return (
    <>
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Buildings", path: "/buildings" },
        ])}
      />
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />
      <BuildingsClient allBuildings={buildings} filteredBuildings={filteredBuildings} />
    </>
  )
}
