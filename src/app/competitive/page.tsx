"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAllCivilizations, getAllMatchups, getAllBuildOrders, getMatchup } from "@/lib/data"
import { Badge } from "@/components/ui/badge"

export default function CompetitivePage() {
  const searchParams = useSearchParams()
  const initialCiv = searchParams.get("civ") || "britons"

  const [selectedCiv, setSelectedCiv] = useState(initialCiv)
  const [matchupCivA, setMatchupCivA] = useState("britons")
  const [matchupCivB, setMatchupCivB] = useState("franks")

  // Calculator state
  const [villagers, setVillagers] = useState(20)
  const [onFood, setOnFood] = useState(8)
  const [onWood, setOnWood] = useState(7)
  const [onGold, setOnGold] = useState(5)

  const allCivs = getAllCivilizations()
  const allMatchups = getAllMatchups()
  const allBuildOrders = getAllBuildOrders()

  const civMatchups = allMatchups.filter((m) => m.civA === selectedCiv || m.civB === selectedCiv)
  const civBuildOrders = allBuildOrders.filter((bo) => bo.civs.includes(selectedCiv))

  const specificMatchup = getMatchup(matchupCivA, matchupCivB)

  // Resource calculator
  const foodRate = onFood * 0.33
  const woodRate = onWood * 0.4
  const goldRate = onGold * 0.38

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-mono font-bold">Competitive</h1>
              <p className="text-muted-foreground">Matchups, build orders, and strategy tools</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          <Tabs defaultValue="matchups" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matchups">Matchups</TabsTrigger>
              <TabsTrigger value="build-orders">Build Orders</TabsTrigger>
              <TabsTrigger value="calculators">Calculators</TabsTrigger>
            </TabsList>

            <TabsContent value="matchups" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Civilization Matchups</CardTitle>
                  <CardDescription>Win rates and strategic notes for civ matchups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label>Select Civilization</Label>
                    <Select value={selectedCiv} onValueChange={setSelectedCiv}>
                      <SelectTrigger className="w-full md:w-96 mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCivs.map((civ) => (
                          <SelectItem key={civ.id} value={civ.id}>
                            {civ.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {civMatchups.length > 0 ? (
                    <div className="space-y-3">
                      {civMatchups.map((matchup) => {
                        const isPlayerA = matchup.civA === selectedCiv
                        const opponentId = isPlayerA ? matchup.civB : matchup.civA
                        const opponent = allCivs.find((c) => c.id === opponentId)
                        const winRate = isPlayerA ? matchup.winRate : 100 - matchup.winRate

                        if (!opponent) return null

                        return (
                          <div key={`${matchup.civA}-${matchup.civB}`} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Link href={`/civilizations/${opponent.id}`}>
                                  <h3 className="font-mono font-semibold hover:underline cursor-pointer">
                                    vs {opponent.name}
                                  </h3>
                                </Link>
                                <Badge variant="secondary">{opponent.type}</Badge>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-2xl font-mono font-bold ${
                                    winRate >= 55
                                      ? "text-primary"
                                      : winRate >= 48
                                        ? "text-muted-foreground"
                                        : "text-destructive"
                                  }`}
                                >
                                  {winRate}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {winRate >= 55 ? "Favorable" : winRate >= 48 ? "Even" : "Unfavorable"}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{matchup.notes}</p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No matchup data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compare Matchup</CardTitle>
                  <CardDescription>View head-to-head matchup between two civilizations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Civilization A</Label>
                      <Select value={matchupCivA} onValueChange={setMatchupCivA}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allCivs.map((civ) => (
                            <SelectItem key={civ.id} value={civ.id}>
                              {civ.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Civilization B</Label>
                      <Select value={matchupCivB} onValueChange={setMatchupCivB}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allCivs.map((civ) => (
                            <SelectItem key={civ.id} value={civ.id}>
                              {civ.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {specificMatchup ? (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-center flex-1">
                          <p className="text-sm text-muted-foreground mb-1">
                            {allCivs.find((c) => c.id === matchupCivA)?.name}
                          </p>
                          <p className="text-3xl font-mono font-bold">{specificMatchup.winRate}%</p>
                        </div>
                        <div className="px-4 text-muted-foreground">vs</div>
                        <div className="text-center flex-1">
                          <p className="text-sm text-muted-foreground mb-1">
                            {allCivs.find((c) => c.id === matchupCivB)?.name}
                          </p>
                          <p className="text-3xl font-mono font-bold">{100 - specificMatchup.winRate}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">{specificMatchup.notes}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No data available for this matchup</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="build-orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Build Orders</CardTitle>
                  <CardDescription>Standard build orders and strategy guides</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label>Filter by Civilization</Label>
                    <Select value={selectedCiv} onValueChange={setSelectedCiv}>
                      <SelectTrigger className="w-full md:w-96 mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCivs.map((civ) => (
                          <SelectItem key={civ.id} value={civ.id}>
                            {civ.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {civBuildOrders.length > 0 ? (
                    <div className="space-y-4">
                      {civBuildOrders.map((bo) => (
                        <Card key={bo.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{bo.name}</CardTitle>
                                <CardDescription>{bo.description}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline">Compatible Civs:</Badge>
                                <div className="flex flex-wrap gap-1">
                                  {bo.civs.map((civId) => {
                                    const civ = allCivs.find((c) => c.id === civId)
                                    return civ ? (
                                      <span key={civId} className="text-xs bg-muted px-2 py-0.5 rounded">
                                        {civ.name}
                                      </span>
                                    ) : null
                                  })}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                {bo.steps.map((step, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-3 text-sm border-l-2 border-muted pl-3"
                                  >
                                    <span className="font-mono text-muted-foreground min-w-12">{step.time}</span>
                                    <span className="flex-1">{step.action}</span>
                                    <span className="font-mono text-muted-foreground">{step.population} pop</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No build orders available for this civilization
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculators" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Calculator</CardTitle>
                  <CardDescription>Calculate resource gathering rates based on villager allocation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Total Villagers</Label>
                        <Input
                          type="number"
                          value={villagers}
                          onChange={(e) => setVillagers(Number(e.target.value))}
                          min={0}
                          max={200}
                          className="mt-2"
                        />
                      </div>
                      <div className="flex items-end">
                        <p className="text-sm text-muted-foreground">
                          Allocated: {onFood + onWood + onGold} / {villagers}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label>On Food</Label>
                        <Input
                          type="number"
                          value={onFood}
                          onChange={(e) => setOnFood(Number(e.target.value))}
                          min={0}
                          max={villagers}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>On Wood</Label>
                        <Input
                          type="number"
                          value={onWood}
                          onChange={(e) => setOnWood(Number(e.target.value))}
                          min={0}
                          max={villagers}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>On Gold</Label>
                        <Input
                          type="number"
                          value={onGold}
                          onChange={(e) => setOnGold(Number(e.target.value))}
                          min={0}
                          max={villagers}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-semibold mb-3">Resource Gathering Rates (per second)</h4>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="text-center p-3 bg-background rounded">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Food</p>
                        <p className="text-2xl font-mono font-bold">{foodRate.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{onFood} villagers</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Wood</p>
                        <p className="text-2xl font-mono font-bold">{woodRate.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{onWood} villagers</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gold</p>
                        <p className="text-2xl font-mono font-bold">{goldRate.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{onGold} villagers</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-sm font-semibold mb-2">Per Minute</h5>
                      <div className="flex items-center gap-6 text-sm">
                        <span>
                          <span className="text-muted-foreground">Food:</span>{" "}
                          <span className="font-mono">{(foodRate * 60).toFixed(0)}</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Wood:</span>{" "}
                          <span className="font-mono">{(woodRate * 60).toFixed(0)}</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Gold:</span>{" "}
                          <span className="font-mono">{(goldRate * 60).toFixed(0)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold mb-2">Notes:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Base gathering rates: Food 0.33/s, Wood 0.4/s, Gold 0.38/s</li>
                      <li>Rates do not include civilization bonuses or upgrades</li>
                      <li>Actual rates vary based on resource distance and type</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
