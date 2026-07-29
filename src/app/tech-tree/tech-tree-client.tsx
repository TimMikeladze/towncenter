"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Fragment } from "react"
import { AgeBadge, Chip } from "@/components/game/badges"
import { EntityIcon } from "@/components/game/entity-icon"
import { PageHeader, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AGES } from "@/lib/game/classes"
import type { CivBonus, TechTreeKind, TechTreeNode } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TechTreeClientProps {
  civs: { id: string; name: string }[]
  civ: { id: string; name: string; types: string[]; teamBonus: string; bonuses: CivBonus[] }
  roots: TechTreeNode[]
  counts: { units: number; buildings: number; techs: number }
  selectedAge: string
}

const HREF_BASE: Record<TechTreeKind, string> = {
  unit: "/units",
  building: "/buildings",
  tech: "/technologies",
}

/**
 * The indent in front of a row, drawn rather than spaced: one lane per
 * ancestor, carrying a line down only while that ancestor still has siblings
 * to come, then the elbow joining this row to its parent. Lanes are
 * full-height, so the lines join up between adjacent rows.
 *
 * `guides` holds one "is the last child" flag per level, this row's last.
 */
function BranchGuides({ guides }: { guides: boolean[] }) {
  const last = guides[guides.length - 1]
  return (
    <span aria-hidden className="flex shrink-0 self-stretch">
      {guides.slice(0, -1).map((isLast, depth) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: lanes are positional, not identities
          key={depth}
          className={cn("w-4 self-stretch border-l", isLast ? "border-transparent" : "border-border")}
        />
      ))}
      <span className="relative w-4 self-stretch">
        <span className={cn("absolute left-0 top-0 w-px bg-border", last ? "h-1/2" : "h-full")} />
        <span className="absolute left-0 top-1/2 h-px w-2.5 bg-border" />
      </span>
    </span>
  )
}

/** Drops everything outside the selected age, keeping ancestors of a match. */
function pruneToAge(nodes: TechTreeNode[], age: string): TechTreeNode[] {
  if (age === "all") return nodes
  return nodes.flatMap((node) => {
    const children = pruneToAge(node.children, age)
    if (node.age !== age && children.length === 0) return []
    return [{ ...node, children }]
  })
}

function TreeRow({ node, guides, dim, root }: { node: TechTreeNode; guides: boolean[]; dim: boolean; root?: boolean }) {
  return (
    <Link
      href={`${HREF_BASE[node.kind]}/${node.id}`}
      className={cn(
        "press flex min-h-7 items-center gap-1.5 rounded-md pr-1 transition-colors md:hover:bg-muted/60",
        root && "font-medium",
        dim && "opacity-50",
      )}
    >
      {guides.length > 0 && <BranchGuides guides={guides} />}
      <EntityIcon src={node.image_path} alt="" size="xs" />
      <span className={cn("truncate", root ? "text-sm" : "text-[13px]")}>{node.name}</span>
      {node.unique && <Chip tone="var(--type-unique)">UU</Chip>}
      <span className="ml-auto flex shrink-0 items-center gap-2 pl-1.5">
        <span className="tabular hidden font-mono text-[11px] text-muted-foreground sm:inline">{node.detail}</span>
        <AgeBadge age={node.age} />
      </span>
    </Link>
  )
}

function TreeRows({ nodes, guides, selectedAge }: { nodes: TechTreeNode[]; guides: boolean[]; selectedAge: string }) {
  return nodes.map((node, index) => {
    // Ancestor pipes, then this row's own elbow: last child or not.
    const ownGuides = [...guides, index === nodes.length - 1]
    return (
      <Fragment key={`${node.kind}:${node.id}`}>
        <TreeRow node={node} guides={ownGuides} dim={selectedAge !== "all" && node.age !== selectedAge} />
        {node.children.length > 0 && <TreeRows nodes={node.children} guides={ownGuides} selectedAge={selectedAge} />}
      </Fragment>
    )
  })
}

function Branch({ root, selectedAge }: { root: TechTreeNode; selectedAge: string }) {
  return (
    <Panel className="mb-3 break-inside-avoid p-2.5 sm:p-3">
      <TreeRow node={root} guides={[]} dim={selectedAge !== "all" && root.age !== selectedAge} root />
      {root.children.length > 0 && (
        <div className="mt-1 border-t pt-1">
          <TreeRows nodes={root.children} guides={[]} selectedAge={selectedAge} />
        </div>
      )}
    </Panel>
  )
}

export function TechTreeClient({ civs, civ, roots, counts, selectedAge }: TechTreeClientProps) {
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

  const branches = pruneToAge(roots, selectedAge)

  return (
    <PageShell>
      <PageHeader
        eyebrow="Reference"
        title="Tech tree"
        description={`Exactly what ${civ.name} can train, build and research, by age.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/civilizations/${civ.id}`}>{civ.name} details</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/civilizations/compare?a=${civ.id}`}>Compare civs</Link>
            </Button>
          </>
        }
      />

      <div className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <Select value={civ.id} onValueChange={(value) => navigate({ civ: value })}>
          <SelectTrigger className="h-10 w-full sm:w-64" aria-label="Select civilization">
            <SelectValue placeholder="Select civilization" />
          </SelectTrigger>
          <SelectContent>
            {civs.map((entry) => (
              <SelectItem key={entry.id} value={entry.id}>
                {entry.name}
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

      <Section title={civ.name} description={`${civ.types.join(" and ")} civilization`}>
        <Panel className="space-y-1.5">
          {civ.bonuses
            .filter((bonus) => bonus.category !== "team")
            .slice(0, 4)
            .map((bonus) => (
              <p key={bonus.id} className="flex gap-1.5 text-sm text-muted-foreground">
                <span className="text-primary">•</span>
                {bonus.description}
              </p>
            ))}
          {civ.teamBonus && (
            <p className="border-t pt-2 text-sm">
              <span className="label-caps mr-1.5">Team bonus</span>
              {civ.teamBonus}
            </p>
          )}
        </Panel>
      </Section>

      <Section
        title="Tree"
        description={`${counts.units} units · ${counts.buildings} buildings · ${counts.techs} technologies. Each building carries what it trains and researches; upgrades sit under what they upgrade from.`}
      >
        {branches.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted-foreground">Nothing unlocks in this age.</p>
          </Panel>
        ) : (
          <div className="columns-1 gap-3 lg:columns-2">
            {branches.map((root) => (
              <Branch key={`${root.kind}:${root.id}`} root={root} selectedAge={selectedAge} />
            ))}
          </div>
        )}
      </Section>
    </PageShell>
  )
}
