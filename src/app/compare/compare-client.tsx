"use client"

import { X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AgeBadge, TypeBadge } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { EmptyState } from "@/components/game/empty-state"
import { EntityIcon } from "@/components/game/entity-icon"
import { UnitPicker } from "@/components/game/unit-picker"
import { PageHeader, PageShell, Section } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { unitHref } from "@/lib/hrefs"
import type { UnitCost } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface CompareUnit {
  id: string
  name: string
  type: string
  age: string
  image_path: string | null
  hp: number
  attack: number
  attackType: string
  meleeArmor: number
  pierceArmor: number
  range: number
  attackSpeed: number
  movementSpeed: number
  lineOfSight: number
  trainingTime: number
  accuracy: number
  blastWidth: number
  cost: number
  costBreakdown: UnitCost
  efficiency: number
  bonuses: string[]
}

interface CompareClientProps {
  units: { id: string; name: string; type: string; image_path: string | null }[]
  selected: CompareUnit[]
  maxUnits: number
  /** "none", or the age whose upgrades are folded into every stat. */
  age: string
}

const AGE_OPTIONS = [
  { value: "none", label: "Base stats" },
  { value: "Feudal", label: "Feudal upgrades" },
  { value: "Castle", label: "Castle upgrades" },
  { value: "Imperial", label: "Imperial upgrades" },
]

type Row = {
  label: string
  value: (unit: CompareUnit) => number
  format?: (value: number) => string
  /** Lower is better for these, e.g. cost and training time. */
  lowerIsBetter?: boolean
}

const ROWS: Row[] = [
  { label: "Hit points", value: (unit) => unit.hp },
  { label: "Attack", value: (unit) => unit.attack },
  { label: "Melee armor", value: (unit) => unit.meleeArmor },
  { label: "Pierce armor", value: (unit) => unit.pierceArmor },
  { label: "Range", value: (unit) => unit.range },
  { label: "Attack speed", value: (unit) => unit.attackSpeed, lowerIsBetter: true, format: (v) => `${v}s` },
  { label: "Movement speed", value: (unit) => unit.movementSpeed },
  { label: "Line of sight", value: (unit) => unit.lineOfSight },
  { label: "Training time", value: (unit) => unit.trainingTime, lowerIsBetter: true, format: (v) => `${v}s` },
  { label: "Weighted cost", value: (unit) => unit.cost, lowerIsBetter: true },
  { label: "Accuracy", value: (unit) => unit.accuracy, format: (v) => `${v}%` },
  { label: "Blast radius", value: (unit) => unit.blastWidth },
  { label: "Cost efficiency", value: (unit) => unit.efficiency },
]

export function CompareClient({ units, selected, maxUnits, age }: CompareClientProps) {
  const router = useRouter()

  const push = (ids: string[], nextAge: string) => {
    const query = new URLSearchParams()
    const list = ids.filter(Boolean).join(",")
    if (list) query.set("units", list)
    if (nextAge !== "none") query.set("age", nextAge)
    const search = query.toString()
    router.push(search ? `/compare?${search}` : "/compare")
  }

  const setSelection = (ids: string[]) => push(ids, age)

  const add = (id: string) => {
    if (selected.some((unit) => unit.id === id) || selected.length >= maxUnits) return
    setSelection([...selected.map((unit) => unit.id), id])
  }

  const remove = (id: string) => setSelection(selected.filter((unit) => unit.id !== id).map((unit) => unit.id))

  return (
    <PageShell>
      <PageHeader
        eyebrow="Analysis"
        title="Compare units"
        description={`Up to ${maxUnits} units side by side, with deltas against the first pick. Switch to an age to compare them fully upgraded.`}
        actions={
          <Button asChild variant="outline">
            <Link href="/units">All units</Link>
          </Button>
        }
      />

      <Section title="Selection" description="The URL keeps your selection, so it is shareable.">
        <div className="panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {selected.length === 0 && <p className="text-sm text-muted-foreground">Nothing selected yet.</p>}
            {selected.map((unit) => (
              <Button key={unit.id} variant="secondary" size="sm" className="gap-1.5" onClick={() => remove(unit.id)}>
                {unit.name}
                <X className="h-3 w-3" />
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:w-72 sm:flex-row">
            <Select
              value={age}
              onValueChange={(value) =>
                push(
                  selected.map((unit) => unit.id),
                  value,
                )
              }
            >
              <SelectTrigger className="h-10 w-full sm:w-44" aria-label="Upgrade level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected.length < maxUnits && (
              <UnitPicker
                units={units.filter((unit) => !selected.some((entry) => entry.id === unit.id))}
                onChange={add}
                label="Add a unit"
                className="h-10 flex-1 py-1"
              />
            )}
          </div>
        </div>
      </Section>

      {selected.length === 0 ? (
        <EmptyState
          title="Pick a unit to start"
          description="Add up to four units and every stat lines up in one table, with the best value in each row highlighted."
        />
      ) : (
        <div className="panel overflow-x-auto">
          <div className="min-w-[560px]">
            <div
              className="grid border-b bg-muted/60"
              style={{ gridTemplateColumns: `170px repeat(${selected.length}, minmax(0, 1fr))` }}
            >
              <div className="p-3" />
              {selected.map((unit) => (
                <div key={unit.id} className="space-y-1.5 p-3">
                  <Link href={unitHref(unit)} className="flex items-center gap-2 hover:underline">
                    <EntityIcon src={unit.image_path} alt="" size="sm" />
                    <span className="min-w-0 truncate font-display font-semibold">{unit.name}</span>
                  </Link>
                  <div className="flex flex-wrap items-center gap-1">
                    <TypeBadge type={unit.type} />
                    <AgeBadge age={unit.age} />
                  </div>
                </div>
              ))}
            </div>

            {/* A row of nothing but zeroes (range on two melee units) is noise. */}
            {ROWS.filter((row) => selected.some((unit) => row.value(unit) !== 0)).map((row) => {
              const values = selected.map(row.value)
              const best = row.lowerIsBetter ? Math.min(...values) : Math.max(...values)
              const baseline = values[0]

              return (
                <div
                  key={row.label}
                  className="grid border-b border-border/60"
                  style={{ gridTemplateColumns: `170px repeat(${selected.length}, minmax(0, 1fr))` }}
                >
                  <div className="p-3 text-sm text-muted-foreground">{row.label}</div>
                  {selected.map((unit, index) => {
                    const value = values[index]
                    const delta = value - baseline
                    return (
                      <div key={unit.id} className="tabular p-3 font-mono text-sm">
                        <span className={cn(value === best && values.length > 1 && "font-bold text-primary")}>
                          {row.format ? row.format(value) : value}
                        </span>
                        {index > 0 && delta !== 0 && (
                          <span
                            className="ml-1.5 text-[11px]"
                            style={{
                              color: delta > 0 === !row.lowerIsBetter ? "var(--success)" : "var(--destructive)",
                            }}
                          >
                            {delta > 0 ? "+" : ""}
                            {Number(delta.toFixed(2))}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}

            <div
              className="grid border-b border-border/60"
              style={{ gridTemplateColumns: `170px repeat(${selected.length}, minmax(0, 1fr))` }}
            >
              <div className="p-3 text-sm text-muted-foreground">Cost</div>
              {selected.map((unit) => (
                <div key={unit.id} className="p-3">
                  <CostChips cost={unit.costBreakdown} />
                </div>
              ))}
            </div>

            <div className="grid" style={{ gridTemplateColumns: `170px repeat(${selected.length}, minmax(0, 1fr))` }}>
              <div className="p-3 text-sm text-muted-foreground">Attack bonuses</div>
              {selected.map((unit) => (
                <div key={unit.id} className="space-y-1 p-3 text-[13px]">
                  {unit.bonuses.length > 0 ? (
                    unit.bonuses.map((bonus) => <div key={bonus}>{bonus}</div>)
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
