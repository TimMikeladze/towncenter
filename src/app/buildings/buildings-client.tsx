"use client"

import { Clock, Eye, Shield } from "lucide-react"
import type { DataViewerConfig } from "@/components/data-viewer"
import { DataViewer } from "@/components/data-viewer"
import { AgeBadge, Chip } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { EntityIcon } from "@/components/game/entity-icon"
import { PageHeader, PageShell } from "@/components/layout/page-shell"
import { buildingHref } from "@/lib/hrefs"
import type { Building } from "@/lib/types"

interface BuildingsClientProps {
  allBuildings: Building[]
  filteredBuildings: Building[]
}

export function BuildingsClient({ allBuildings, filteredBuildings }: BuildingsClientProps) {
  const config: DataViewerConfig<Building> = {
    itemName: "buildings",
    searchFields: ["name", "type", "description"],
    searchPlaceholder: "Search buildings…",

    filters: [
      {
        key: "age",
        label: "Age",
        options: [
          { label: "All", value: "all" },
          { label: "Dark", value: "Dark" },
          { label: "Feudal", value: "Feudal" },
          { label: "Castle", value: "Castle" },
          { label: "Imperial", value: "Imperial" },
        ],
        filterFn: (building, value) => value === "all" || building.age === value,
      },
    ],

    sortOptions: [
      { key: "name", label: "Name", sortFn: (a, b) => a.name.localeCompare(b.name) },
      { key: "hp", label: "Hit points", sortFn: (a, b) => b.hitPoints - a.hitPoints },
      { key: "buildTime", label: "Build time", sortFn: (a, b) => a.buildTime - b.buildTime },
    ],

    cardTitle: (building) => building.name,
    cardDescription: (building) => (
      <>
        <Chip tone="var(--type-economy)">{building.type}</Chip>
        <AgeBadge age={building.age} />
      </>
    ),
    cardMedia: (building) => (
      <EntityIcon
        src={building.image_path}
        alt={building.name}
        size="lg"
        className="border-0 bg-transparent max-md:h-14 max-md:w-14"
      />
    ),
    cardContent: (building) => (
      <>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-md border py-1.5" title="Hit points">
            <Shield className="mx-auto h-3 w-3 text-muted-foreground" aria-hidden />
            <p className="tabular font-mono text-sm font-semibold">{building.hitPoints}</p>
          </div>
          <div className="rounded-md border py-1.5" title="Line of sight">
            <Eye className="mx-auto h-3 w-3 text-muted-foreground" aria-hidden />
            <p className="tabular font-mono text-sm font-semibold">{building.lineOfSight}</p>
          </div>
          <div className="rounded-md border py-1.5" title="Build time">
            <Clock className="mx-auto h-3 w-3 text-muted-foreground" aria-hidden />
            <p className="tabular font-mono text-sm font-semibold">{building.buildTime}s</p>
          </div>
        </div>
        {building.description && (
          <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{building.description}</p>
        )}
        <div className="mt-auto pt-1">
          <CostChips cost={building.cost} />
        </div>
      </>
    ),

    tableColumns: [
      {
        key: "name",
        header: "Building",
        sortKey: "name",
        width: "minmax(220px, 2fr)",
        render: (building) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <EntityIcon src={building.image_path} alt="" size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium">{building.name}</p>
              <div className="mt-0.5 flex items-center gap-1">
                <Chip tone="var(--type-economy)">{building.type}</Chip>
                <AgeBadge age={building.age} />
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "stats",
        header: "Durability",
        sortKey: "hp",
        width: "minmax(160px, 1fr)",
        render: (building) => (
          <div className="tabular flex items-center gap-3 font-mono text-[13px]">
            <span className="flex items-center gap-1" title="Hit points">
              <Shield className="h-3 w-3 text-muted-foreground" aria-hidden />
              {building.hitPoints}
            </span>
            <span className="flex items-center gap-1" title="Melee / pierce armor">
              {building.meleeArmor}/{building.pierceArmor}
            </span>
            <span className="flex items-center gap-1" title="Line of sight">
              <Eye className="h-3 w-3 text-muted-foreground" aria-hidden />
              {building.lineOfSight}
            </span>
          </div>
        ),
      },
      {
        key: "cost",
        header: "Cost",
        width: "minmax(160px, 1fr)",
        render: (building) => <CostChips cost={building.cost} />,
      },
      {
        key: "buildTime",
        header: "Build",
        sortKey: "buildTime",
        width: "100px",
        render: (building) => (
          <span className="tabular font-mono text-[13px] text-muted-foreground">{building.buildTime}s</span>
        ),
      },
    ],

    itemLink: buildingHref,
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Reference"
        title="Buildings"
        description={`Costs, durability and production for all ${allBuildings.length} structures.`}
      />
      <DataViewer config={config} data={filteredBuildings} defaultView="cards" />
    </PageShell>
  )
}
