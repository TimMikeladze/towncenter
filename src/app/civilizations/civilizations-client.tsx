"use client"

import { Swords, Users } from "lucide-react"
import type { DataViewerConfig } from "@/components/data-viewer"
import { DataViewer } from "@/components/data-viewer"
import { Chip } from "@/components/game/badges"
import { EntityIcon } from "@/components/game/entity-icon"
import { PageHeader, PageShell } from "@/components/layout/page-shell"
import type { Civilization } from "@/lib/types"

interface CivilizationsClientProps {
  allCivs: Civilization[]
  filteredCivs: Civilization[]
}

export function CivilizationsClient({ allCivs, filteredCivs }: CivilizationsClientProps) {
  const config: DataViewerConfig<Civilization> = {
    itemName: "civilizations",
    searchFields: ["name", "type", "teamBonus"],
    searchPlaceholder: "Search civilizations or team bonuses…",

    sortOptions: [
      { key: "name", label: "Name", sortFn: (a, b) => a.name.localeCompare(b.name) },
      { key: "focus", label: "Focus", sortFn: (a, b) => a.type.localeCompare(b.type) },
      { key: "bonuses", label: "Bonus count", sortFn: (a, b) => b.bonuses.length - a.bonuses.length },
    ],

    cardTitle: (civ) => civ.name,
    cardDescription: (civ) =>
      civ.types.map((type) => (
        <Chip key={type} tone="var(--primary)">
          {type}
        </Chip>
      )),
    cardHeader: (civ) => (
      <div className="flex items-center justify-center border-b bg-muted/40 py-4">
        <EntityIcon src={civ.image_path} alt={civ.name} size="lg" className="border-0 bg-transparent" />
      </div>
    ),
    cardContent: (civ) => (
      <>
        <ul className="space-y-1 text-[13px] leading-snug text-muted-foreground">
          {civ.bonuses
            .filter((bonus) => bonus.category !== "team")
            .slice(0, 3)
            .map((bonus) => (
              <li key={bonus.id} className="flex gap-1.5">
                <span className="text-primary">•</span>
                <span className="line-clamp-2">{bonus.description}</span>
              </li>
            ))}
        </ul>
        <div className="mt-auto rounded-md border bg-muted/30 p-2">
          <p className="label-caps flex items-center gap-1">
            <Users className="h-3 w-3" aria-hidden />
            Team bonus
          </p>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug">{civ.teamBonus || "—"}</p>
        </div>
      </>
    ),

    tableColumns: [
      {
        key: "name",
        header: "Civilization",
        sortKey: "name",
        width: "minmax(200px, 1.2fr)",
        render: (civ) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <EntityIcon src={civ.image_path} alt="" size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium">{civ.name}</p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {civ.types.map((type) => (
                  <Chip key={type} tone="var(--primary)">
                    {type}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "bonuses",
        header: "Key bonuses",
        width: "minmax(260px, 2.2fr)",
        render: (civ) => (
          <ul className="space-y-0.5 text-[13px] leading-snug text-muted-foreground">
            {civ.bonuses
              .filter((bonus) => bonus.category !== "team")
              .slice(0, 2)
              .map((bonus) => (
                <li key={bonus.id} className="line-clamp-1">
                  • {bonus.description}
                </li>
              ))}
          </ul>
        ),
      },
      {
        key: "teamBonus",
        header: "Team bonus",
        width: "minmax(200px, 1.6fr)",
        render: (civ) => (
          <span className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{civ.teamBonus || "—"}</span>
        ),
      },
      {
        key: "unique",
        header: "UU",
        width: "72px",
        render: (civ) => (
          <span className="tabular flex items-center gap-1 font-mono text-[13px]">
            <Swords className="h-3 w-3 text-muted-foreground" aria-hidden />
            {civ.uniqueUnits.length}
          </span>
        ),
      },
    ],

    itemLink: (civ) => `/civilizations/${civ.id}`,
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Reference"
        title="Civilizations"
        description={`Bonuses, unique units and tech tree gaps for all ${allCivs.length} civilizations.`}
      />
      <DataViewer config={config} data={filteredCivs} defaultView="cards" />
    </PageShell>
  )
}
