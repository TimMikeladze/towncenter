"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Chip } from "@/components/game/badges"
import { EntityIcon } from "@/components/game/entity-icon"
import { PageHeader, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AGES } from "@/lib/game/classes"
import type { Age, CivBonus } from "@/lib/types"

interface TreeEntry {
  id: string
  name: string
  kind: string
  age: Age
  image_path: string | null
  unique?: boolean
  hp?: number
  attack?: number
}

interface TechTreeClientProps {
  civs: { id: string; name: string }[]
  tree: {
    civ: { id: string; name: string; types: string[]; teamBonus: string; bonuses: CivBonus[] }
    units: TreeEntry[]
    buildings: TreeEntry[]
    techs: TreeEntry[]
  }
  selectedAge: string
}

function EntryGrid({ entries, hrefBase }: { entries: TreeEntry[]; hrefBase: string }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing in this age.</p>
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`${hrefBase}/${entry.id}`}
          className="panel panel-interactive flex items-center gap-2.5 p-2.5"
        >
          <EntityIcon src={entry.image_path} alt="" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium">
              <span className="truncate">{entry.name}</span>
              {entry.unique && <Chip tone="var(--type-unique)">UU</Chip>}
            </p>
            <p className="tabular truncate font-mono text-[11px] text-muted-foreground">
              {entry.kind}
              {entry.hp !== undefined && ` · ${entry.hp} HP · ${entry.attack} atk`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function TechTreeClient({ civs, tree, selectedAge }: TechTreeClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigate = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === "all") params.delete(key)
      else params.set(key, value)
    }
    const query = params.toString()
    router.push(query ? `/tech-tree?${query}` : "/tech-tree")
  }

  const ages = selectedAge === "all" ? [...AGES] : [selectedAge as Age]

  return (
    <PageShell>
      <PageHeader
        eyebrow="Reference"
        title="Tech tree"
        description={`Exactly what ${tree.civ.name} can train, build and research, by age.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/civilizations/${tree.civ.id}`}>{tree.civ.name} details</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/civilizations/compare?a=${tree.civ.id}`}>Compare civs</Link>
            </Button>
          </>
        }
      />

      <div className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <Select value={tree.civ.id} onValueChange={(value) => navigate({ civ: value })}>
          <SelectTrigger className="h-10 w-full sm:w-64" aria-label="Select civilization">
            <SelectValue placeholder="Select civilization" />
          </SelectTrigger>
          <SelectContent>
            {civs.map((civ) => (
              <SelectItem key={civ.id} value={civ.id}>
                {civ.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedAge} onValueChange={(value) => navigate({ age: value })}>
          <SelectTrigger className="h-10 w-full sm:w-48" aria-label="Filter by age">
            <SelectValue placeholder="Filter by age" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ages</SelectItem>
            {AGES.map((age) => (
              <SelectItem key={age} value={age}>
                {age} Age
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Section title={tree.civ.name} description={`${tree.civ.types.join(" and ")} civilization`}>
        <Panel className="space-y-1.5">
          {tree.civ.bonuses
            .filter((bonus) => bonus.category !== "team")
            .slice(0, 4)
            .map((bonus) => (
              <p key={bonus.id} className="flex gap-1.5 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                {bonus.description}
              </p>
            ))}
          {tree.civ.teamBonus && (
            <p className="border-t pt-2 text-sm">
              <span className="label-caps mr-1.5">Team bonus</span>
              {tree.civ.teamBonus}
            </p>
          )}
        </Panel>
      </Section>

      {ages.map((age) => {
        const units = tree.units.filter((entry) => entry.age === age)
        const buildings = tree.buildings.filter((entry) => entry.age === age)
        const techs = tree.techs.filter((entry) => entry.age === age)
        if (units.length + buildings.length + techs.length === 0) return null

        return (
          <Section
            key={age}
            title={`${age} Age`}
            description={`${units.length} units · ${buildings.length} buildings · ${techs.length} technologies`}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="label-caps">Units</p>
                <EntryGrid entries={units} hrefBase="/units" />
              </div>
              <div className="space-y-2">
                <p className="label-caps">Buildings</p>
                <EntryGrid entries={buildings} hrefBase="/buildings" />
              </div>
              <div className="space-y-2">
                <p className="label-caps">Technologies</p>
                <EntryGrid entries={techs} hrefBase="/technologies" />
              </div>
            </div>
          </Section>
        )
      })}
    </PageShell>
  )
}
