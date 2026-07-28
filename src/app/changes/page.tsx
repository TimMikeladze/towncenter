import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Chip } from "@/components/game/badges"
import { EmptyState } from "@/components/game/empty-state"
import { PageHeader, PageShell, Panel, Section } from "@/components/layout/page-shell"
import patchChanges from "@/data/patch-changes.json"

interface FieldChange {
  field: string
  before: number | null
  after: number | null
}

interface ChangedEntity {
  id: number
  name: string
  fields: FieldChange[]
}

interface TableDiff {
  added: { id: number; name: string }[]
  removed: { id: number; name: string }[]
  changed: ChangedEntity[]
}

const HREF_BASE: Record<string, string> = {
  units: "/units",
  buildings: "/buildings",
  techs: "/technologies",
}

const TITLES: Record<string, string> = {
  units: "Units",
  buildings: "Buildings",
  techs: "Technologies",
}

function Delta({ change }: { change: FieldChange }) {
  const before = change.before ?? 0
  const after = change.after ?? 0
  const improved = after > before
  return (
    <span className="tabular inline-flex items-center gap-1 font-mono text-[12px]">
      <span className="text-muted-foreground">{change.field}</span>
      <span className="text-muted-foreground">{before}</span>
      <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
      <span style={{ color: improved ? "var(--success)" : "var(--destructive)" }}>{after}</span>
    </span>
  )
}

export default function ChangesPage() {
  const tables = patchChanges.tables as Record<string, TableDiff>
  const newCivs = patchChanges.civilizations?.added ?? []
  const hasChanges = Object.values(tables).some(
    (diff) => diff.added.length + diff.removed.length + diff.changed.length > 0,
  )

  return (
    <PageShell width="default">
      <PageHeader
        eyebrow="Data"
        title="What changed"
        description={`Stat differences between the current game-data export and the previous one${
          patchChanges.base ? ` (baseline: ${patchChanges.base})` : ""
        }.`}
      />

      {newCivs.length > 0 && (
        <Section title="New civilizations" description={`${newCivs.length} added`}>
          <div className="flex flex-wrap gap-1.5">
            {newCivs.map((civ: string) => (
              <Link key={civ} href={`/civilizations/${civ.toLowerCase()}`}>
                <Chip tone="var(--primary)" className="px-2 py-1">
                  {civ}
                </Chip>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {!hasChanges && newCivs.length === 0 && (
        <EmptyState title="No differences" description="The current export matches the previous one." />
      )}

      {Object.entries(tables).map(([kind, diff]) => {
        if (diff.added.length + diff.removed.length + diff.changed.length === 0) return null

        return (
          <Section
            key={kind}
            title={TITLES[kind] ?? kind}
            description={`${diff.changed.length} changed · ${diff.added.length} added · ${diff.removed.length} removed`}
          >
            <div className="space-y-3">
              {diff.added.length > 0 && (
                <Panel className="space-y-2">
                  <p className="label-caps">Added</p>
                  <div className="flex flex-wrap gap-1.5">
                    {diff.added.map((entity) => (
                      <Link key={entity.id} href={`${HREF_BASE[kind]}/${entity.id}`}>
                        <Chip tone="var(--success)" className="px-2 py-1">
                          {entity.name}
                        </Chip>
                      </Link>
                    ))}
                  </div>
                </Panel>
              )}

              {diff.changed.length > 0 && (
                <div className="space-y-2">
                  {diff.changed.map((entity) => (
                    <Panel key={entity.id} className="space-y-1.5 p-3">
                      <Link
                        href={`${HREF_BASE[kind]}/${entity.id}`}
                        className="font-display text-sm font-semibold hover:underline"
                      >
                        {entity.name}
                      </Link>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {entity.fields.map((field) => (
                          <Delta key={field.field} change={field} />
                        ))}
                      </div>
                    </Panel>
                  ))}
                </div>
              )}

              {diff.removed.length > 0 && (
                <Panel className="space-y-2">
                  <p className="label-caps">Removed</p>
                  <div className="flex flex-wrap gap-1.5">
                    {diff.removed.map((entity) => (
                      <Chip key={entity.id} tone="var(--destructive)" className="px-2 py-1 line-through">
                        {entity.name}
                      </Chip>
                    ))}
                  </div>
                </Panel>
              )}
            </div>
          </Section>
        )
      })}
    </PageShell>
  )
}
