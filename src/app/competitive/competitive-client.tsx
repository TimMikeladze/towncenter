"use client"

import { Info } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Chip } from "@/components/game/badges"
import { EmptyState } from "@/components/game/empty-state"
import { StatTile } from "@/components/game/stats"
import { PageHeader, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllBuildOrders, getAllMatchups } from "@/lib/data-client"
import type { Civilization } from "@/lib/types"

interface CompetitiveClientProps {
  allCivs: Civilization[]
  initialCivId: string
}

function winRateTone(winRate: number) {
  if (winRate >= 55) return "var(--success)"
  if (winRate >= 48) return "var(--muted-foreground)"
  return "var(--destructive)"
}

export function CompetitiveClient({ allCivs, initialCivId }: CompetitiveClientProps) {
  const [selectedCiv, setSelectedCiv] = useState(initialCivId)
  const [matchupCivA, setMatchupCivA] = useState(allCivs[0]?.id ?? "")
  const [matchupCivB, setMatchupCivB] = useState(allCivs[1]?.id ?? "")
  const allMatchups = getAllMatchups()
  const allBuildOrders = getAllBuildOrders()

  // Calculator state
  const [villagers, setVillagers] = useState(20)
  const [onFood, setOnFood] = useState(8)
  const [onWood, setOnWood] = useState(7)
  const [onGold, setOnGold] = useState(5)

  const civMatchups = allMatchups.filter((m) => m.civA === selectedCiv || m.civB === selectedCiv)
  const civBuildOrders = allBuildOrders.filter((bo) => bo.civs.includes(selectedCiv))

  const specificMatchup = allMatchups.find(
    (m) => (m.civA === matchupCivA && m.civB === matchupCivB) || (m.civA === matchupCivB && m.civB === matchupCivA),
  )

  const foodRate = onFood * 0.33
  const woodRate = onWood * 0.4
  const goldRate = onGold * 0.38

  const civSelect = (value: string, onChange: (next: string) => void, label: string) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full sm:w-72" aria-label={label}>
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
  )

  return (
    <PageShell>
      <PageHeader
        eyebrow="Strategy"
        title="Competitive"
        description="Matchup notes, build orders and a gathering-rate calculator."
      />

      <div className="panel flex items-start gap-2 border-dashed p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Win rates and build orders on this page are illustrative examples, not measured data. Unit, civ and tech pages
          elsewhere in the app come straight from the game files.
        </p>
      </div>

      <Tabs defaultValue="matchups" className="w-full space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="matchups">Matchups</TabsTrigger>
          <TabsTrigger value="build-orders">Build orders</TabsTrigger>
          <TabsTrigger value="calculators">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="matchups" className="space-y-6">
          <Section title="Civilization matchups" description="Pick a civ to see its illustrative matchup notes.">
            <div className="space-y-3">
              {civSelect(selectedCiv, setSelectedCiv, "Select civilization")}

              {civMatchups.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {civMatchups.map((matchup) => {
                    const isPlayerA = matchup.civA === selectedCiv
                    const opponentId = isPlayerA ? matchup.civB : matchup.civA
                    const opponent = allCivs.find((c) => c.id === opponentId)
                    const winRate = isPlayerA ? matchup.winRate : 100 - matchup.winRate
                    if (!opponent) return null

                    return (
                      <div key={`${matchup.civA}-${matchup.civB}`} className="panel p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/civilizations/${opponent.id}`}
                              className="font-display font-semibold hover:underline"
                            >
                              vs {opponent.name}
                            </Link>
                            <div className="mt-1">
                              <Chip tone="var(--primary)">{opponent.type}</Chip>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className="tabular font-mono text-2xl font-semibold"
                              style={{ color: winRateTone(winRate) }}
                            >
                              {winRate}%
                            </p>
                            <p className="label-caps">
                              {winRate >= 55 ? "Favorable" : winRate >= 48 ? "Even" : "Unfavorable"}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-[13px] leading-snug text-muted-foreground">{matchup.notes}</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState title="No matchup notes" description="Nothing written up for this civilization yet." />
              )}
            </div>
          </Section>

          <Section title="Head to head" description="Compare two civilizations directly.">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Civilization A</Label>
                  {civSelect(matchupCivA, setMatchupCivA, "Civilization A")}
                </div>
                <div className="space-y-1.5">
                  <Label>Civilization B</Label>
                  {civSelect(matchupCivB, setMatchupCivB, "Civilization B")}
                </div>
              </div>

              {specificMatchup ? (
                <Panel>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-center">
                      <p className="text-sm text-muted-foreground">{allCivs.find((c) => c.id === matchupCivA)?.name}</p>
                      <p className="tabular font-mono text-3xl font-semibold">{specificMatchup.winRate}%</p>
                    </div>
                    <span className="label-caps">vs</span>
                    <div className="flex-1 text-center">
                      <p className="text-sm text-muted-foreground">{allCivs.find((c) => c.id === matchupCivB)?.name}</p>
                      <p className="tabular font-mono text-3xl font-semibold">{100 - specificMatchup.winRate}%</p>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-[13px] text-muted-foreground">{specificMatchup.notes}</p>
                </Panel>
              ) : (
                <EmptyState title="No data for this pairing" />
              )}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="build-orders" className="space-y-4">
          <Section title="Build orders" description="Filtered to the selected civilization.">
            <div className="space-y-3">
              {civSelect(selectedCiv, setSelectedCiv, "Filter by civilization")}

              {civBuildOrders.length > 0 ? (
                <div className="space-y-3">
                  {civBuildOrders.map((bo) => (
                    <Panel key={bo.id} className="space-y-3">
                      <div>
                        <h3 className="font-display text-base font-semibold">{bo.name}</h3>
                        <p className="text-sm text-muted-foreground">{bo.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {bo.civs.map((civId) => {
                          const civ = allCivs.find((c) => c.id === civId)
                          return civ ? <Chip key={civId}>{civ.name}</Chip> : null
                        })}
                      </div>
                      <ol className="space-y-1">
                        {bo.steps.map((step) => (
                          <li
                            key={`${step.time}-${step.action}`}
                            className="flex items-start gap-3 border-l-2 border-primary/40 pl-3 text-sm"
                          >
                            <span className="tabular w-12 shrink-0 font-mono text-muted-foreground">{step.time}</span>
                            <span className="flex-1">{step.action}</span>
                            <span className="tabular font-mono text-muted-foreground">{step.population} pop</span>
                          </li>
                        ))}
                      </ol>
                    </Panel>
                  ))}
                </div>
              ) : (
                <EmptyState title="No build orders" description="Nothing written up for this civilization yet." />
              )}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="calculators" className="space-y-4">
          <Section title="Resource calculator" description="Gathering rates from villager allocation.">
            <div className="space-y-4">
              <Panel className="grid gap-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="villagers">Total villagers</Label>
                  <Input
                    id="villagers"
                    type="number"
                    inputMode="numeric"
                    value={villagers}
                    onChange={(e) => setVillagers(Number(e.target.value))}
                    min={0}
                    max={200}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="on-food">On food</Label>
                  <Input
                    id="on-food"
                    type="number"
                    inputMode="numeric"
                    value={onFood}
                    onChange={(e) => setOnFood(Number(e.target.value))}
                    min={0}
                    max={villagers}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="on-wood">On wood</Label>
                  <Input
                    id="on-wood"
                    type="number"
                    inputMode="numeric"
                    value={onWood}
                    onChange={(e) => setOnWood(Number(e.target.value))}
                    min={0}
                    max={villagers}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="on-gold">On gold</Label>
                  <Input
                    id="on-gold"
                    type="number"
                    inputMode="numeric"
                    value={onGold}
                    onChange={(e) => setOnGold(Number(e.target.value))}
                    min={0}
                    max={villagers}
                    className="h-10"
                  />
                </div>
              </Panel>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatTile label="Allocated" value={`${onFood + onWood + onGold} / ${villagers}`} />
                <StatTile label="Food / s" value={foodRate.toFixed(2)} hint={`${(foodRate * 60).toFixed(0)} per min`} />
                <StatTile label="Wood / s" value={woodRate.toFixed(2)} hint={`${(woodRate * 60).toFixed(0)} per min`} />
                <StatTile label="Gold / s" value={goldRate.toFixed(2)} hint={`${(goldRate * 60).toFixed(0)} per min`} />
              </div>

              <Panel className="space-y-1 text-sm text-muted-foreground">
                <p>Base rates: food 0.33/s, wood 0.4/s, gold 0.38/s.</p>
                <p>Rates exclude civilization bonuses and upgrades, and vary with resource distance.</p>
              </Panel>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
