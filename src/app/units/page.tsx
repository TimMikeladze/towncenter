import { SecondaryNav } from "@/components/secondary-nav"
import { getAllUnits } from "@/lib/data"
import { UnitsClient } from "./units-client"
import type { UnitType } from "@/lib/types"

const unitTypes: (UnitType | "all")[] = ["all", "Infantry", "Archer", "Cavalry", "Siege", "Monk", "Unique"]

const secondaryNavItems = [
  { label: "All Units", value: "all" },
  { label: "Infantry", value: "Infantry" },
  { label: "Archer", value: "Archer" },
  { label: "Cavalry", value: "Cavalry" },
  { label: "Siege", value: "Siege" },
  { label: "Monk", value: "Monk" },
  { label: "Unique", value: "Unique" },
]

export default async function UnitsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const params = await searchParams
  const activeTab = params.type || "all"
  const allUnits = await getAllUnits()

  const filteredUnits = activeTab === "all" ? allUnits : allUnits.filter((unit) => unit.type === activeTab)

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />
      <UnitsClient allUnits={allUnits} filteredUnits={filteredUnits} />
    </>
  )
}
