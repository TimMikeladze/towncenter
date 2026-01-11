import { getAllMaps } from "@/lib/data"
import { DataViewer } from "@/components/data-viewer/data-viewer"
import type { DataViewerConfig } from "@/components/data-viewer/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function MapsPage() {
  const maps = getAllMaps()

  const config: DataViewerConfig = {
    title: "Maps",
    description: "All maps in Age of Empires 2: Definitive Edition",
    data: maps.map((map) => ({
      id: map.id,
      name: map.name,
      subtitle: `${map.type} Map · ${map.size}`,
      image: `/placeholder.svg?height=120&width=160&query=${map.name} map`,
      primaryStats: [
        { label: "Type", value: map.type },
        { label: "Size", value: map.size },
      ],
      secondaryInfo: [
        {
          label: "Recommended",
          value: map.recommendedCivs.slice(0, 2).join(", "),
        },
      ],
      description: map.description,
      metadata: {
        type: map.type,
        size: map.size,
      },
    })),
    defaultView: "cards",
    filters: [
      {
        id: "type",
        label: "Type",
        options: [
          { value: "all", label: "All" },
          { value: "Land", label: "Land" },
          { value: "Water", label: "Water" },
          { value: "Hybrid", label: "Hybrid" },
        ],
      },
    ],
    sortOptions: [{ value: "name", label: "Name" }],
    tableColumns: [
      { key: "name", label: "Map", sortable: true },
      { key: "type", label: "Type", sortable: true },
      { key: "size", label: "Size", sortable: true },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="font-mono text-xs h-7 px-2">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Home
          </Button>
        </Link>
      </div>
      <DataViewer config={config} />
    </div>
  )
}
