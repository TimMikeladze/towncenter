"use client"

import { Map as MapIcon, Users } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import type { DataViewerConfig } from "@/components/data-viewer"
import { DataViewer } from "@/components/data-viewer"
import { Chip } from "@/components/game/badges"
import { PageHeader, PageShell } from "@/components/layout/page-shell"
import { SecondaryNav } from "@/components/secondary-nav"
import { getAllMaps } from "@/lib/data-client"
import type { GameMap } from "@/lib/types"

const secondaryNavItems = [
  { label: "All Maps", value: "all" },
  { label: "Land", value: "Land" },
  { label: "Water", value: "Water" },
  { label: "Hybrid", value: "Hybrid" },
]

const TYPE_TONE: Record<string, string> = {
  Land: "var(--type-economy)",
  Water: "var(--type-naval)",
  Hybrid: "var(--type-monk)",
}

function MapsContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("type") || "all"
  const allMaps = getAllMaps()

  const filteredMaps = activeTab === "all" ? allMaps : allMaps.filter((map) => map.type === activeTab)

  const config: DataViewerConfig<GameMap> = {
    itemName: "maps",
    searchFields: ["name", "type", "description"],
    searchPlaceholder: "Search maps…",

    sortOptions: [
      { key: "name", label: "Name", sortFn: (a, b) => a.name.localeCompare(b.name) },
      { key: "type", label: "Type", sortFn: (a, b) => a.type.localeCompare(b.type) },
    ],

    cardTitle: (map) => map.name,
    cardDescription: (map) => (
      <>
        <Chip tone={TYPE_TONE[map.type]}>{map.type}</Chip>
        <Chip>{map.size}</Chip>
      </>
    ),
    cardContent: (map) => (
      <>
        <p className="line-clamp-3 text-[13px] leading-snug text-muted-foreground">{map.description}</p>
        {map.recommendedCivs.length > 0 && (
          <div className="mt-auto space-y-1.5 border-t pt-2">
            <p className="label-caps flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden />
              Recommended civs
            </p>
            <div className="flex flex-wrap gap-1">
              {map.recommendedCivs.slice(0, 4).map((civId) => (
                <Chip key={civId} className="capitalize">
                  {civId.replace(/-/g, " ")}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </>
    ),

    tableColumns: [
      {
        key: "name",
        header: "Map",
        sortKey: "name",
        width: "minmax(200px, 1.2fr)",
        render: (map) => (
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-medium">
              <MapIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              {map.name}
            </p>
            <div className="mt-0.5 flex items-center gap-1">
              <Chip tone={TYPE_TONE[map.type]}>{map.type}</Chip>
              <Chip>{map.size}</Chip>
            </div>
          </div>
        ),
      },
      {
        key: "description",
        header: "Description",
        width: "minmax(280px, 2fr)",
        render: (map) => (
          <span className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{map.description}</span>
        ),
      },
      {
        key: "recommended",
        header: "Recommended civs",
        width: "minmax(200px, 1.2fr)",
        render: (map) => (
          <div className="flex flex-wrap gap-1">
            {map.recommendedCivs.slice(0, 3).map((civId) => (
              <Chip key={civId} className="capitalize">
                {civId.replace(/-/g, " ")}
              </Chip>
            ))}
          </div>
        ),
      },
    ],
  }

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />
      <PageShell>
        <PageHeader
          eyebrow="Reference"
          title="Maps"
          description={`Terrain, size and civ recommendations across ${allMaps.length} maps.`}
        />
        <DataViewer config={config} data={filteredMaps} defaultView="cards" />
      </PageShell>
    </>
  )
}

export default function MapsPage() {
  return (
    <Suspense fallback={null}>
      <MapsContent />
    </Suspense>
  )
}
