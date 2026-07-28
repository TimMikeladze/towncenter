"use client"

import { Gauge, Heart, Shield, Swords, Target } from "lucide-react"
import type { DataViewerConfig } from "@/components/data-viewer"
import { DataViewer } from "@/components/data-viewer"
import { AgeBadge, Chip, TypeBadge } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { EntityIcon } from "@/components/game/entity-icon"
import { PageHeader, PageShell } from "@/components/layout/page-shell"
import { costEfficiency, resourceCost } from "@/lib/game/combat"
import type { Unit } from "@/lib/types"

interface UnitsClientProps {
  allUnits: Unit[]
  filteredUnits: Unit[]
}

export function UnitsClient({ allUnits, filteredUnits }: UnitsClientProps) {
  const config: DataViewerConfig<Unit> = {
    itemName: "units",
    searchFields: ["name", "type", "age", "description"],
    searchPlaceholder: "Search units by name, type or text…",

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
        filterFn: (unit, value) => value === "all" || unit.age === value,
      },
    ],

    sortOptions: [
      { key: "name", label: "Name", sortFn: (a, b) => a.name.localeCompare(b.name) },
      { key: "hp", label: "Hit points", sortFn: (a, b) => b.stats.hp - a.stats.hp },
      { key: "attack", label: "Attack", sortFn: (a, b) => b.stats.attack - a.stats.attack },
      { key: "cost", label: "Cost", sortFn: (a, b) => resourceCost(a) - resourceCost(b) },
      { key: "efficiency", label: "Cost efficiency", sortFn: (a, b) => costEfficiency(b) - costEfficiency(a) },
    ],

    cardTitle: (unit) => unit.name,
    cardDescription: (unit) => (
      <>
        <TypeBadge type={unit.type} />
        <AgeBadge age={unit.age} />
        {unit.civSpecific && unit.type !== "Unique" && <Chip tone="var(--type-unique)">Unique</Chip>}
      </>
    ),
    cardHeader: (unit) => (
      <div className="flex items-center justify-center border-b bg-muted/40 py-4">
        <EntityIcon src={unit.image_path} alt={unit.name} size="lg" className="border-0 bg-transparent" />
      </div>
    ),
    cardContent: (unit) => (
      <>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-md border py-1.5" title="Hit points">
            <Heart className="mx-auto h-3 w-3 text-muted-foreground" aria-hidden />
            <p className="tabular font-mono text-sm font-semibold">{unit.stats.hp}</p>
          </div>
          <div className="rounded-md border py-1.5" title="Attack">
            <Swords className="mx-auto h-3 w-3 text-muted-foreground" aria-hidden />
            <p className="tabular font-mono text-sm font-semibold">{unit.stats.attack}</p>
          </div>
          <div className="rounded-md border py-1.5" title="Melee / pierce armor">
            <Shield className="mx-auto h-3 w-3 text-muted-foreground" aria-hidden />
            <p className="tabular font-mono text-sm font-semibold">
              {unit.stats.meleeArmor}/{unit.stats.pierceArmor}
            </p>
          </div>
        </div>
        {unit.description && (
          <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{unit.description}</p>
        )}
        <div className="mt-auto pt-1">
          <CostChips cost={unit.cost} />
        </div>
      </>
    ),

    tableColumns: [
      {
        key: "name",
        header: "Unit",
        sortKey: "name",
        width: "minmax(220px, 2fr)",
        render: (unit) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <EntityIcon src={unit.image_path} alt="" size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium">{unit.name}</p>
              <div className="mt-0.5 flex items-center gap-1">
                <TypeBadge type={unit.type} />
                <AgeBadge age={unit.age} />
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "stats",
        header: "Combat",
        sortKey: "hp",
        width: "minmax(160px, 1fr)",
        render: (unit) => (
          <div className="tabular flex items-center gap-3 font-mono text-[13px]">
            <span className="flex items-center gap-1" title="Hit points">
              <Heart className="h-3 w-3 text-muted-foreground" aria-hidden />
              {unit.stats.hp}
            </span>
            <span className="flex items-center gap-1" title="Attack">
              <Swords className="h-3 w-3 text-muted-foreground" aria-hidden />
              {unit.stats.attack}
            </span>
            <span className="flex items-center gap-1" title="Melee / pierce armor">
              <Shield className="h-3 w-3 text-muted-foreground" aria-hidden />
              {unit.stats.meleeArmor}/{unit.stats.pierceArmor}
            </span>
          </div>
        ),
      },
      {
        key: "cost",
        header: "Cost",
        sortKey: "cost",
        width: "minmax(160px, 1fr)",
        render: (unit) => <CostChips cost={unit.cost} />,
      },
      {
        key: "mobility",
        header: "Mobility",
        width: "minmax(150px, 0.8fr)",
        render: (unit) => (
          <div className="tabular flex items-center gap-3 font-mono text-[13px] text-muted-foreground">
            {unit.stats.range ? (
              <span className="flex items-center gap-1" title="Range">
                <Target className="h-3 w-3" aria-hidden />
                {unit.stats.range}
              </span>
            ) : null}
            <span className="flex items-center gap-1" title="Movement speed">
              <Gauge className="h-3 w-3" aria-hidden />
              {unit.stats.movementSpeed}
            </span>
          </div>
        ),
      },
    ],

    itemLink: (unit) => `/units/${unit.id}`,
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Reference"
        title="Units"
        description={`Combat stats, costs and matchups for all ${allUnits.length} units in the game.`}
      />
      <DataViewer config={config} data={filteredUnits} defaultView="cards" />
    </PageShell>
  )
}
