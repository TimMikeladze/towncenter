"use client"

import { useState } from "react"
import { getAllMaps } from "@/lib/data"
import { DataViewer } from "@/components/data-viewer"
import type { DataViewerConfig } from "@/components/data-viewer"
import type { Map } from "@/lib/types"
import { SecondaryNav } from "@/components/secondary-nav"
import { MapPin, Users } from "lucide-react"

const secondaryNavItems = [
  { label: "All Maps", value: "all" },
  { label: "Land", value: "Land" },
  { label: "Water", value: "Water" },
  { label: "Hybrid", value: "Hybrid" },
]

export default function MapsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const allMaps = getAllMaps()

  const filteredMaps = activeTab === "all" ? allMaps : allMaps.filter((map) => map.type === activeTab)

  const config: DataViewerConfig<Map> = {
    itemName: "maps",
    searchFields: ["name", "type", "description"],
    searchPlaceholder: "Search maps...",

    filters: [],

    sortOptions: [
      {
        key: "name",
        label: "Name",
        sortFn: (a: Map, b: Map) => a.name.localeCompare(b.name),
      },
      {
        key: "type",
        label: "Type",
        sortFn: (a: Map, b: Map) => a.type.localeCompare(b.type),
      },
    ],

    cardTitle: (map: Map) => map.name,
    cardDescription: (map: Map) => (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 text-[9px] font-bold border rounded uppercase tracking-wider">{map.type}</span>
        <span className="text-[9px]">•</span>
        <span className="text-[9px] font-bold uppercase tracking-wider">{map.size}</span>
      </div>
    ),
    cardHeader: (map: Map) => (
      <div className="relative h-24 bg-muted flex items-center justify-center border-b">
        <img
          src={`/.jpg?height=96&width=200&query=${encodeURIComponent(map.name + " map terrain")}`}
          alt={map.name}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute bottom-2 left-3">
          <MapPin className="h-5 w-5" />
        </div>
      </div>
    ),
    cardContent: (map: Map) => (
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
        sortable: true,
        render: (map: Map) => (
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
        render: (map: Map) => (
          <p className="text-[10px] text-muted-foreground line-clamp-2 max-w-xs">{map.description}</p>
        ),
      },
      {
        key: "recommended",
        header: "RECOMMENDED CIVS",
        render: (map: Map) => (
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
      <SecondaryNav items={secondaryNavItems} defaultValue="all" onValueChange={setActiveTab} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h1 className="text-xl font-mono font-bold uppercase tracking-tight">Map Database</h1>
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
