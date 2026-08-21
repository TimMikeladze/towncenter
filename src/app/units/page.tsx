import type { Metadata } from "next"
import { SecondaryNav } from "@/components/secondary-nav"
import { JsonLd } from "@/components/seo/json-ld"
import { getAllUnits } from "@/lib/data"
import { breadcrumbList, pageMetadata } from "@/lib/seo"
import { UnitsClient } from "./units-client"

const secondaryNavItems = [
  { label: "All Units", value: "all" },
  { label: "Infantry", value: "Infantry" },
  { label: "Archer", value: "Archer" },
  { label: "Cavalry", value: "Cavalry" },
  { label: "Siege", value: "Siege" },
  { label: "Naval", value: "Naval" },
  { label: "Monk", value: "Monk" },
  { label: "Economy", value: "Economy" },
  { label: "Unique", value: "Unique" },
]

export async function generateMetadata(): Promise<Metadata> {
  const units = await getAllUnits()
  return pageMetadata({
    title: "AoE2 unit stats — every unit, cost and counter",
    description: `Hit points, attack, armor, range, speed and cost for all ${units.length} Age of Empires II: Definitive Edition units, with the matchups each one wins and loses.`,
    path: "/units",
    eyebrow: "Units",
    imageSubtitle: `All ${units.length} units, sortable by hit points, attack, cost and cost efficiency.`,
  })
}

export default async function UnitsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams
  const activeTab = params.type || "all"
  const allUnits = await getAllUnits()

  const filteredUnits = activeTab === "all" ? allUnits : allUnits.filter((unit) => unit.type === activeTab)

  return (
    <>
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Units", path: "/units" },
        ])}
      />
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />
      <UnitsClient allUnits={allUnits} filteredUnits={filteredUnits} />
    </>
  )
}
