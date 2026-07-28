"use client"

import { X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UnitCost } from "@/lib/types"
import { getEntityImagePath } from "@/lib/utils/images"

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
  cost: number
  costBreakdown: UnitCost
  efficiency: number
  bonuses: string[]
}

interface CompareClientProps {
  units: { id: string; name: string; type: string }[]
  selected: CompareUnit[]
  maxUnits: number
}

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
  { label: "Cost efficiency", value: (unit) => unit.efficiency },
]

export function CompareClient({ units, selected, maxUnits }: CompareClientProps) {
  const router = useRouter()

  const setSelection = (ids: string[]) => {
    const query = ids.filter(Boolean).join(",")
    router.push(query ? `/compare?units=${query}` : "/compare")
  }

  const add = (id: string) => {
    if (selected.some((unit) => unit.id === id) || selected.length >= maxUnits) return
    setSelection([...selected.map((unit) => unit.id), id])
  }

  const remove = (id: string) => setSelection(selected.filter((unit) => unit.id !== id).map((unit) => unit.id))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-mono font-bold">Compare Units</h1>
              <p className="text-muted-foreground">Up to {maxUnits} units side by side, with deltas</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/units">All units</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Selection</CardTitle>
              <CardDescription>Add units to compare; the URL keeps your selection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {selected.map((unit) => (
                  <Button key={unit.id} variant="secondary" size="sm" onClick={() => remove(unit.id)}>
                    {unit.name}
                    <X className="h-3 w-3 ml-2" />
                  </Button>
                ))}
                {selected.length === 0 && <p className="text-sm text-muted-foreground">Nothing selected yet.</p>}
              </div>
              {selected.length < maxUnits && (
                <Select value="" onValueChange={add}>
                  <SelectTrigger className="w-full md:w-96">
                    <SelectValue placeholder="Add a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units
                      .filter((unit) => !selected.some((entry) => entry.id === unit.id))
                      .map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.type})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {selected.length > 0 && (
            <Card className="overflow-x-auto">
              <CardContent className="p-0">
                <div
                  className="grid min-w-[640px] text-sm"
                  style={{ gridTemplateColumns: `180px repeat(${selected.length}, minmax(0, 1fr))` }}
                >
                  <div className="p-3 border-b bg-muted/50" />
                  {selected.map((unit) => (
                    <div key={unit.id} className="p-3 border-b bg-muted/50">
                      <Link href={`/units/${unit.id}`} className="flex items-center gap-2 hover:underline">
                        <Image
                          src={getEntityImagePath(unit.image_path)}
                          alt=""
                          width={28}
                          height={28}
                          className="h-7 w-7 object-contain"
                        />
                        <span className="font-mono font-bold">{unit.name}</span>
                      </Link>
                      <p className="text-[10px] text-muted-foreground uppercase mt-1">
                        {unit.type} • {unit.age} Age
                      </p>
                    </div>
                  ))}

                  {ROWS.map((row) => {
                    const values = selected.map(row.value)
                    const best = row.lowerIsBetter ? Math.min(...values) : Math.max(...values)
                    const baseline = values[0]

                    return (
                      <div key={row.label} className="contents">
                        <div className="p-3 border-b text-muted-foreground">{row.label}</div>
                        {selected.map((unit, index) => {
                          const value = values[index]
                          const delta = value - baseline
                          return (
                            <div key={unit.id} className="p-3 border-b font-mono">
                              <span className={value === best && values.length > 1 ? "font-bold" : ""}>
                                {row.format ? row.format(value) : value}
                              </span>
                              {index > 0 && delta !== 0 && (
                                <span
                                  className={`ml-2 text-[10px] ${
                                    (delta > 0) === !row.lowerIsBetter ? "text-primary" : "text-destructive"
                                  }`}
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

                  <div className="p-3 text-muted-foreground">Cost</div>
                  {selected.map((unit) => (
                    <div key={unit.id} className="p-3 font-mono text-xs">
                      {unit.costBreakdown.food ? `${unit.costBreakdown.food}F ` : ""}
                      {unit.costBreakdown.wood ? `${unit.costBreakdown.wood}W ` : ""}
                      {unit.costBreakdown.gold ? `${unit.costBreakdown.gold}G ` : ""}
                      {unit.costBreakdown.stone ? `${unit.costBreakdown.stone}S` : ""}
                    </div>
                  ))}

                  <div className="p-3 text-muted-foreground border-t">Attack bonuses</div>
                  {selected.map((unit) => (
                    <div key={unit.id} className="p-3 border-t text-xs space-y-1">
                      {unit.bonuses.length > 0 ? (
                        unit.bonuses.map((bonus) => <div key={bonus}>{bonus}</div>)
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
