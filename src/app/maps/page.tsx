"use client"

import { MapPin, Users } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import type { DataViewerConfig } from "@/components/data-viewer"
import { DataViewer } from "@/components/data-viewer"
import { SecondaryNav } from "@/components/secondary-nav"
import { getAllMaps } from "@/lib/data-client"
import type { GameMap } from "@/lib/types"

const secondaryNavItems = [
  { label: "All Maps", value: "all" },
  { label: "Land", value: "Land" },
  { label: "Water", value: "Water" },
  { label: "Hybrid", value: "Hybrid" },
]

function MapsContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("type") || "all"
  const allMaps = getAllMaps()

  const filteredMaps = activeTab === "all" ? allMaps : allMaps.filter((map) => map.type === activeTab)

  const config: DataViewerConfig<GameMap> = {
    itemName: "maps",
    searchFields: ["name", "type", "description"],
    searchPlaceholder: "Search maps...",

    filters: [],

    sortOptions: [
      {
        key: "name",
        label: "Name",
        sortFn: (a: GameMap, b: GameMap) => a.name.localeCompare(b.name),
      },
      {
        key: "type",
        label: "Type",
        sortFn: (a: GameMap, b: GameMap) => a.type.localeCompare(b.type),
      },
    ],

    cardTitle: (map: GameMap) => map.name,
    cardDescription: (map: GameMap) => (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 text-[9px] font-bold border rounded uppercase tracking-wider">{map.type}</span>
        <span className="text-[9px]">•</span>
        <span className="text-[9px] font-bold uppercase tracking-wider">{map.size}</span>
      </div>
    ),
    cardHeader: (_map: GameMap) => (
      <div className="relative h-16 bg-muted flex items-center justify-center border-b">
        <MapPin className="h-6 w-6 text-muted-foreground" />
      </div>
    ),
    cardContent: (map: GameMap) => (
      <>
        <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{map.description}</p>
        {map.recommendedCivs.length > 0 && (
          <div className="space-y-1 text-[10px] border-t pt-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span className="font-bold uppercase text-[9px]">Recommended Civs:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {map.recommendedCivs.slice(0, 3).map((civId) => (
                <span key={civId} className="px-1.5 py-0.5 text-[9px] border rounded capitalize">
                  {civId.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </>
    ),

    tableColumns: [
      {
        key: "name",
        header: "MAP",
        sortKey: "name",
        render: (map: GameMap) => (
          <div>
            <div className="font-bold uppercase flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              {map.name}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
              <span className="px-1.5 py-0.5 border rounded uppercase">{map.type}</span>
              <span className="uppercase">{map.size}</span>
            </div>
          </div>
        ),
      },
      {
        key: "description",
        header: "DESCRIPTION",
        render: (map: GameMap) => (
          <p className="text-[10px] text-muted-foreground line-clamp-2 max-w-xs">{map.description}</p>
        ),
      },
      {
        key: "recommended",
        header: "RECOMMENDED CIVS",
        render: (map: GameMap) => (
          <div className="flex flex-wrap gap-1">
            {map.recommendedCivs.slice(0, 3).map((civId) => (
              <span key={civId} className="px-1.5 py-0.5 text-[10px] border rounded capitalize">
                {civId.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        ),
      },
    ],
  }

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h1 className="text-xl font-mono font-bold uppercase tracking-tight">GameMap Database</h1>
                <p className="text-muted-foreground text-[10px] mt-0.5 uppercase tracking-wide">
                  Showing {filteredMaps.length} of {allMaps.length} maps
                </p>
              </div>
            </div>

            <DataViewer config={config} data={filteredMaps} defaultView="cards" />
          </div>
        </div>
      </div>
    </>
  )
}

export default function MapsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MapsContent />
    </Suspense>
  )
}
