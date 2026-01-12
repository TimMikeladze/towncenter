"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SecondaryNav } from "@/components/secondary-nav"
import { DataViewer } from "@/components/data-viewer"
import type { DataViewerConfig } from "@/components/data-viewer"
import type { Civilization } from "@/lib/types"
import { Users, Crown, Swords } from "lucide-react"
import { getEntityImagePath } from "@/lib/utils/images"

const civTypes = ["all", "Archer", "Cavalry", "Infantry", "Defensive", "Naval", "Monk"] as const

const secondaryNavItems = [
  { label: "All Civs", value: "all" },
  { label: "Archer", value: "Archer" },
  { label: "Cavalry", value: "Cavalry" },
  { label: "Infantry", value: "Infantry" },
  { label: "Defensive", value: "Defensive" },
  { label: "Naval", value: "Naval" },
  { label: "Monk", value: "Monk" },
]

function CivilizationsContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("type") || "all"
  const [allCivs, setAllCivs] = useState<Civilization[]>([])

  useEffect(() => {
    import("@/lib/data").then(({ getAllCivilizations }) => {
      getAllCivilizations().then(setAllCivs)
    })
  }, [])

  const filteredCivs = activeTab === "all" ? allCivs : allCivs.filter((civ) => civ.type === activeTab)

  const config: DataViewerConfig<Civilization> = {
    itemName: "civilizations",
    searchFields: ["name", "type"],
    searchPlaceholder: "Search civilizations...",

    filters: [],

    sortOptions: [
      {
        key: "name",
        label: "Name",
        sortFn: (a, b) => a.name.localeCompare(b.name),
      },
      {
        key: "bonuses",
        label: "Bonus Count",
        sortFn: (a, b) => b.bonuses.length - a.bonuses.length,
      },
    ],

    cardTitle: (civ) => civ.name,
    cardDescription: (civ) => (
      <span className="px-2 py-0.5 text-[9px] font-bold border rounded uppercase tracking-wider">
        {civ.type} Civilization
      </span>
    ),
    cardHeader: (civ) => (
      <div className="relative h-32 bg-muted flex items-center justify-center border-b">
        <img
          src={getEntityImagePath(civ.image_path)}
          alt={civ.name}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute bottom-2 left-3">
          <Crown className="h-6 w-6" />
        </div>
      </div>
    ),
    cardContent: (civ) => (
      <>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1.5 font-bold flex items-center gap-1">
            <Users className="h-3 w-3" />
            Strengths
          </p>
          <div className="flex flex-wrap gap-1">
            {civ.strengths.slice(0, 3).map((strength) => (
              <span key={strength} className="px-2 py-0.5 text-[9px] font-bold border rounded uppercase tracking-wide">
                {strength}
              </span>
            ))}
          </div>
        </div>
        <div className="p-2 border">
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide mb-1">Team Bonus</p>
          <p className="text-[10px] leading-tight line-clamp-2">{civ.teamBonus}</p>
        </div>
      </>
    ),

    tableColumns: [
      {
        key: "name",
        header: "CIVILIZATION",
        sortable: true,
        render: (civ) => (
          <div>
            <div className="font-bold flex items-center gap-2 uppercase">
              <Crown className="h-3 w-3" />
              {civ.name}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              <span className="px-1.5 py-0.5 border rounded uppercase">{civ.type}</span>
            </div>
          </div>
        ),
      },
      {
        key: "strengths",
        header: "STRENGTHS",
        render: (civ) => (
          <div className="flex flex-wrap gap-1">
            {civ.strengths.slice(0, 3).map((strength) => (
              <span key={strength} className="px-1.5 py-0.5 text-[10px] border rounded uppercase tracking-wide">
                {strength}
              </span>
            ))}
          </div>
        ),
      },
      {
        key: "bonuses",
        header: "KEY BONUSES",
        render: (civ) => (
          <div className="text-[10px] space-y-0.5 font-mono">
            {civ.bonuses.slice(0, 2).map((bonus) => (
              <div key={bonus.id} className="text-muted-foreground">
                • {bonus.description.substring(0, 50)}...
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "unique",
        header: "UNIQUE",
        render: (civ) => (
          <div className="flex items-center gap-1">
            <Swords className="h-3 w-3" />
            <span className="text-[10px] font-bold font-mono">{civ.uniqueUnits.length}</span>
          </div>
        ),
      },
    ],

    itemLink: (civ) => `/civilizations/${civ.id}`,
  }

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h1 className="text-xl font-mono font-bold uppercase tracking-tight">Civilizations</h1>
                <p className="text-muted-foreground text-[10px] mt-0.5 uppercase tracking-wide">
                  Showing {filteredCivs.length} of {allCivs.length} civilizations
                </p>
              </div>
            </div>

            <DataViewer config={config} data={filteredCivs} defaultView="table" />
          </div>
        </div>
      </div>
    </>
  )
}

export default function CivilizationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CivilizationsContent />
    </Suspense>
  )
}
