import { SecondaryNav } from "@/components/secondary-nav"
import { getAllTechnologies } from "@/lib/data"
import { ECO_TECH_CATEGORIES, MILITARY_TECH_CATEGORIES } from "@/lib/game/classes"
import { TechnologiesClient } from "./technologies-client"

const secondaryNavItems = [
  { label: "All", value: "all" },
  { label: "Economy", value: "eco" },
  { label: "Military", value: "military" },
  { label: "Unique", value: "Unique" },
]

export default async function TechnologiesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams
  const activeTab = params.type || "all"
  const technologies = await getAllTechnologies()

  const filteredTechs =
    activeTab === "all"
      ? technologies
      : activeTab === "eco"
        ? technologies.filter((t) => ECO_TECH_CATEGORIES.includes(t.category))
        : activeTab === "military"
          ? technologies.filter((t) => MILITARY_TECH_CATEGORIES.includes(t.category))
          : technologies.filter((t) => t.category === activeTab)

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />
      <TechnologiesClient allTechs={technologies} filteredTechs={filteredTechs} />
    </>
  )
}
