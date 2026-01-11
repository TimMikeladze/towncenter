"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Unit } from "@/lib/types"

interface CountersClientProps {
  allUnits: Unit[]
  defaultUnitId?: string
}

export function CountersClient({ allUnits, defaultUnitId }: CountersClientProps) {
  const [selectedUnit, setSelectedUnit] = useState<string>(defaultUnitId || (allUnits[6]?.id || ""))

  const currentUnit = useMemo(() =>
    allUnits.find(u => u.id === selectedUnit) || null,
    [selectedUnit, allUnits]
  )

  const counters = useMemo(() => {
    if (!currentUnit) return []
    return currentUnit.counters
      .map(id => allUnits.find(u => u.id === id))
      .filter((u): u is Unit => u !== undefined)
  }, [currentUnit, allUnits])

  const goodAgainst = useMemo(() => {
    if (!currentUnit) return []
    return currentUnit.goodAgainst
      .map(id => allUnits.find(u => u.id === id))
      .filter((u): u is Unit => u !== undefined)
  }, [currentUnit, allUnits])

  if (!currentUnit) return null

  // Calculate cost efficiency
  const unitCost = (currentUnit.cost.food || 0) + (currentUnit.cost.wood || 0) + (currentUnit.cost.gold || 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-mono font-bold">Unit Counters</h1>
              <p className="text-muted-foreground">Explore counter relationships and matchups</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Unit</CardTitle>
              <CardDescription>Choose a unit to view its counters and what it counters</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {allUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{currentUnit.name}</CardTitle>
                  <CardDescription>
                    {currentUnit.type} • {currentUnit.age} Age
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/units/${currentUnit.id}`}>View Full Stats</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{currentUnit.description}</p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Cost</p>
                  <p className="text-sm font-mono">
                    {currentUnit.cost.food && `${currentUnit.cost.food}F `}
                    {currentUnit.cost.wood && `${currentUnit.cost.wood}W `}
                    {currentUnit.cost.gold && `${currentUnit.cost.gold}G`}
                  </p>
                  <p className="text-xs text-muted-foreground">Total: {unitCost} resources</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Combat Stats</p>
                  <p className="text-sm font-mono">
                    {currentUnit.stats.hp} HP • {currentUnit.stats.attack} Atk
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentUnit.stats.meleeArmor}/{currentUnit.stats.pierceArmor} Armor
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Mobility</p>
                  <p className="text-sm font-mono">Speed: {currentUnit.stats.movementSpeed}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentUnit.stats.range ? `Range: ${currentUnit.stats.range}` : "Melee unit"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Countered By</CardTitle>
                <CardDescription>Units that are effective against {currentUnit.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {counters.length > 0 ? (
                  <div className="space-y-3">
                    {counters.map((counter) => (
                      <Link key={counter.id} href={`/units/${counter.id}`}>
                        <div className="border border-destructive/20 rounded-lg p-3 hover:bg-destructive/5 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-mono font-semibold text-sm">{counter.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {counter.type} • {counter.age} Age
                              </p>
                            </div>
                            <Badge variant="destructive">Counter</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{counter.description}</p>
                          <div className="flex items-center gap-3 text-xs mt-2">
                            <span>
                              <span className="text-muted-foreground">HP:</span> {counter.stats.hp}
                            </span>
                            <span>
                              <span className="text-muted-foreground">Atk:</span> {counter.stats.attack}
                            </span>
                            <span>
                              <span className="text-muted-foreground">Cost:</span>{" "}
                              {(counter.cost.food || 0) + (counter.cost.wood || 0) + (counter.cost.gold || 0)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No hard counters defined</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Counters</CardTitle>
                <CardDescription>Units that {currentUnit.name} is effective against</CardDescription>
              </CardHeader>
              <CardContent>
                {goodAgainst.length > 0 ? (
                  <div className="space-y-3">
                    {goodAgainst.map((target) => (
                      <Link key={target.id} href={`/units/${target.id}`}>
                        <div className="border border-primary/20 rounded-lg p-3 hover:bg-primary/5 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-mono font-semibold text-sm">{target.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {target.type} • {target.age} Age
                              </p>
                            </div>
                            <Badge variant="secondary">Weak</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{target.description}</p>
                          <div className="flex items-center gap-3 text-xs mt-2">
                            <span>
                              <span className="text-muted-foreground">HP:</span> {target.stats.hp}
                            </span>
                            <span>
                              <span className="text-muted-foreground">Atk:</span> {target.stats.attack}
                            </span>
                            <span>
                              <span className="text-muted-foreground">Cost:</span>{" "}
                              {(target.cost.food || 0) + (target.cost.wood || 0) + (target.cost.gold || 0)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No specific advantages defined</p>
                )}
              </CardContent>
            </Card>
          </div>

          {currentUnit.stats.attackBonuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attack Bonuses</CardTitle>
                <CardDescription>Bonus damage against specific armor classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-3">
                  {currentUnit.stats.attackBonuses.map((bonus) => (
                    <div key={bonus.class} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono">{bonus.class}</span>
                        <Badge>+{bonus.bonus}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Extra damage vs this armor class</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Strategic Tips</CardTitle>
              <CardDescription>How to use and counter {currentUnit.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Using {currentUnit.name}</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Most effective against: {goodAgainst.map((u) => u.name).join(", ") || "versatile unit"}</li>
                  <li>Best in {currentUnit.stats.range ? "ranged engagements with proper micro" : "direct combat"}</li>
                  <li>
                    Cost efficiency:{" "}
                    {unitCost < 100 ? "cheap and spammable" : unitCost < 150 ? "moderate investment" : "expensive"}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Countering {currentUnit.name}</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Hard counters: {counters.map((u) => u.name).join(", ") || "no specific counters"}</li>
                  <li>
                    {currentUnit.stats.pierceArmor > 3
                      ? "High pierce armor - use melee units"
                      : "Low pierce armor - use ranged units"}
                  </li>
                  <li>
                    {currentUnit.stats.movementSpeed > 1.2
                      ? "Fast unit - avoid slow units, use walls"
                      : "Slow unit - kiting and hit-and-run tactics work well"}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
