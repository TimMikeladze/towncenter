"use client"

import { Crown, Swords } from "lucide-react"
import Image from "next/image"
import type { DataViewerConfig } from "@/components/data-viewer"
import { DataViewer } from "@/components/data-viewer"
import type { Civilization } from "@/lib/types"
import { getEntityImagePath } from "@/lib/utils/images"

interface CivilizationsClientProps {
  allCivs: Civilization[]
  filteredCivs: Civilization[]
}

export function CivilizationsClient({ allCivs, filteredCivs }: CivilizationsClientProps) {
  const config: DataViewerConfig<Civilization> = {
    itemName: "civilizations",
    searchFields: ["name", "type", "teamBonus"],
    searchPlaceholder: "Search civilizations...",

    sortOptions: [
      { key: "name", label: "Name", sortFn: (a, b) => a.name.localeCompare(b.name) },
      { key: "focus", label: "Focus", sortFn: (a, b) => a.type.localeCompare(b.type) },
      { key: "bonuses", label: "Bonus count", sortFn: (a, b) => b.bonuses.length - a.bonuses.length },
    ],

    cardTitle: (civ) => civ.name,
    cardDescription: (civ) => (
      <span className="px-2 py-0.5 text-[9px] font-bold border rounded uppercase tracking-wider">
        {civ.types.join(" / ")}
      </span>
    ),
    cardHeader: (civ) => (
      <div className="relative h-24 bg-muted flex items-center justify-center border-b">
        <Image
          src={getEntityImagePath(civ.image_path)}
          alt={civ.name}
          width={64}
          height={64}
          className="h-16 w-16 object-contain"
        />
        <div className="absolute bottom-2 left-3">
          <Crown className="h-4 w-4" />
        </div>
      </div>
    ),
    cardContent: (civ) => (
      <>
        <div className="space-y-1">
          {civ.bonuses
            .filter((bonus) => bonus.category !== "team")
            .slice(0, 3)
            .map((bonus) => (
              <p key={bonus.id} className="text-[10px] leading-tight text-muted-foreground">
                • {bonus.description}
              </p>
            ))}
        </div>
        <div className="p-2 border">
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide mb-1">Team Bonus</p>
          <p className="text-[10px] leading-tight line-clamp-2">{civ.teamBonus || "—"}</p>
        </div>
      </>
    ),

    tableColumns: [
      {
        key: "name",
        header: "CIVILIZATION",
        sortKey: "name",
        width: "1.4fr",
        render: (civ) => (
          <div className="flex items-center gap-2">
            <Image
              src={getEntityImagePath(civ.image_path)}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain shrink-0"
            />
            <div>
              <div className="font-bold uppercase">{civ.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                <span className="px-1.5 py-0.5 border rounded uppercase">{civ.types.join(" / ")}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "bonuses",
        header: "KEY BONUSES",
        width: "2.5fr",
        render: (civ) => (
          <div className="text-[10px] space-y-0.5">
            {civ.bonuses
              .filter((bonus) => bonus.category !== "team")
              .slice(0, 2)
              .map((bonus) => (
                <div key={bonus.id} className="text-muted-foreground">
                  • {bonus.description}
                </div>
              ))}
          </div>
        ),
      },
      {
        key: "teamBonus",
        header: "TEAM BONUS",
        width: "1.6fr",
        render: (civ) => <span className="text-[10px] text-muted-foreground">{civ.teamBonus || "—"}</span>,
      },
      {
        key: "unique",
        header: "UU",
        width: "60px",
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
  )
}
