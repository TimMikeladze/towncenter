import type { Metadata } from "next"
import { SecondaryNav } from "@/components/secondary-nav"
import { JsonLd } from "@/components/seo/json-ld"
import { getAllTechnologies } from "@/lib/data"
import { ECO_TECH_CATEGORIES, MILITARY_TECH_CATEGORIES } from "@/lib/game/classes"
import { breadcrumbList, pageMetadata } from "@/lib/seo"
import { TechnologiesClient } from "./technologies-client"

const secondaryNavItems = [
  { label: "All", value: "all" },
  { label: "Economy", value: "eco" },
  { label: "Military", value: "military" },
  { label: "Unique", value: "Unique" },
]

export async function generateMetadata(): Promise<Metadata> {
  const technologies = await getAllTechnologies()
  return pageMetadata({
    title: "AoE2 technologies — cost, research time and effect",
    description: `All ${technologies.length} Age of Empires II: Definitive Edition technologies and upgrades: what they cost, how long they take to research, where they are researched and what they change.`,
    path: "/technologies",
    eyebrow: "Technologies",
    imageSubtitle: `All ${technologies.length} upgrades, by building and by age.`,
  })
}

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
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Technologies", path: "/technologies" },
        ])}
      />
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />
      <TechnologiesClient allTechs={technologies} filteredTechs={filteredTechs} />
    </>
  )
}
