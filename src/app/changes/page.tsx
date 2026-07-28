import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <span className="font-mono text-xs">
      {change.field}{" "}
      <span className="text-muted-foreground">
        {before} → <span className={improved ? "text-primary" : "text-destructive"}>{after}</span>
      </span>
    </span>
  )
}

export default function ChangesPage() {
  const tables = patchChanges.tables as Record<string, TableDiff>
  const newCivs = patchChanges.civilizations?.added ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-mono font-bold">What Changed</h1>
            <p className="text-muted-foreground">
              Stat differences between the current game-data export and the previous one
              {patchChanges.base ? ` (baseline: ${patchChanges.base})` : ""}
            </p>
          </div>

          {newCivs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>New Civilizations</CardTitle>
                <CardDescription>{newCivs.length} added</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {newCivs.map((civ: string) => (
                  <Link key={civ} href={`/civilizations/${civ.toLowerCase()}`}>
                    <span className="border rounded px-2 py-1 text-sm hover:bg-accent">{civ}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {Object.entries(tables).map(([kind, diff]) => (
            <Card key={kind}>
              <CardHeader>
                <CardTitle>{TITLES[kind] ?? kind}</CardTitle>
                <CardDescription>
                  {diff.changed.length} changed • {diff.added.length} added • {diff.removed.length} removed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {diff.added.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Added</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {diff.added.map((entity) => (
                        <Link key={entity.id} href={`${HREF_BASE[kind]}/${entity.id}`}>
                          <span className="border rounded px-2 py-1 text-xs hover:bg-accent">{entity.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {diff.changed.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Stat changes</h3>
                    {diff.changed.map((entity) => (
                      <div key={entity.id} className="border rounded p-2">
                        <Link
                          href={`${HREF_BASE[kind]}/${entity.id}`}
                          className="font-mono font-semibold text-sm hover:underline"
                        >
                          {entity.name}
                        </Link>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          {entity.fields.map((field) => (
                            <Delta key={field.field} change={field} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {diff.removed.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">Removed</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {diff.removed.map((entity) => (
                        <span key={entity.id} className="border rounded px-2 py-1 text-xs line-through">
                          {entity.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
