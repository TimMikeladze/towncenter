"use client"

import { Clock } from "lucide-react"
import type { DataViewerConfig } from "@/components/data-viewer"
import { DataViewer } from "@/components/data-viewer"
import { AgeBadge, Chip } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { EntityIcon } from "@/components/game/entity-icon"
import { PageHeader, PageShell } from "@/components/layout/page-shell"
import type { Technology } from "@/lib/types"

interface TechnologiesClientProps {
  allTechs: Technology[]
  filteredTechs: Technology[]
}

export function TechnologiesClient({ allTechs, filteredTechs }: TechnologiesClientProps) {
  const config: DataViewerConfig<Technology> = {
    itemName: "technologies",
    searchFields: ["name", "category", "description"],
    searchPlaceholder: "Search technologies…",

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
        filterFn: (tech, value) => value === "all" || tech.age === value,
      },
    ],

    sortOptions: [
      { key: "name", label: "Name", sortFn: (a, b) => a.name.localeCompare(b.name) },
      { key: "researchTime", label: "Research time", sortFn: (a, b) => a.researchTime - b.researchTime },
      { key: "category", label: "Researched at", sortFn: (a, b) => a.category.localeCompare(b.category) },
    ],

    cardTitle: (tech) => tech.name,
    cardDescription: (tech) => (
      <>
        <Chip tone="var(--type-monk)">{tech.category}</Chip>
        <AgeBadge age={tech.age} />
      </>
    ),
    cardHeader: (tech) => (
      <div className="flex items-center justify-center border-b bg-muted/40 py-4">
        <EntityIcon src={tech.image_path} alt={tech.name} size="lg" className="border-0 bg-transparent" />
      </div>
    ),
    cardContent: (tech) => (
      <>
        {tech.description && (
          <p className="line-clamp-3 text-[13px] leading-snug text-muted-foreground">{tech.description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          <CostChips cost={tech.cost} />
          <span className="tabular flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" aria-hidden />
            {tech.researchTime}s
          </span>
        </div>
      </>
    ),

    tableColumns: [
      {
        key: "name",
        header: "Technology",
        sortKey: "name",
        width: "minmax(220px, 1.6fr)",
        render: (tech) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <EntityIcon src={tech.image_path} alt="" size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium">{tech.name}</p>
              <div className="mt-0.5 flex items-center gap-1">
                <Chip tone="var(--type-monk)">{tech.category}</Chip>
                <AgeBadge age={tech.age} />
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "description",
        header: "Effect",
        width: "minmax(240px, 2fr)",
        render: (tech) => (
          <span className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{tech.description}</span>
        ),
      },
      {
        key: "cost",
        header: "Cost",
        width: "minmax(150px, 1fr)",
        render: (tech) => <CostChips cost={tech.cost} />,
      },
      {
        key: "researchTime",
        header: "Time",
        sortKey: "researchTime",
        width: "90px",
        render: (tech) => (
          <span className="tabular font-mono text-[13px] text-muted-foreground">{tech.researchTime}s</span>
        ),
      },
    ],

    itemLink: (tech) => `/technologies/${tech.id}`,
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Reference"
        title="Technologies"
        description={`Costs, research times and effects for all ${allTechs.length} technologies.`}
      />
      <DataViewer config={config} data={filteredTechs} defaultView="cards" />
    </PageShell>
  )
}
