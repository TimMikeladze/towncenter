"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getEntityImagePath } from "@/lib/utils/images"

interface MatchupRow {
  id: string
  name: string
  type: string
  age: string
  image_path: string | null
  description: string
  hp: number
  attack: number
  cost: number
  damageDealt: number
  damageTaken: number
  dpsDealt: number
  dpsTaken: number
}

interface CountersClientProps {
  units: { id: string; name: string; type: string }[]
  unit: {
    id: string
    name: string
    type: string
    age: string
    description: string
    image_path: string | null
    hp: number
    attack: number
    meleeArmor: number
    pierceArmor: number
    range: number | null
    movementSpeed: number
    cost: number
  }
  goodAgainst: MatchupRow[]
  counteredBy: MatchupRow[]
}

function MatchupList({
  rows,
  tone,
  emptyMessage,
  subjectName,
}: {
  rows: MatchupRow[]
  tone: "good" | "bad"
  emptyMessage: string
  subjectName: string
}) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <Link key={row.id} href={`/units/${row.id}`}>
          <div
            className={`border rounded-lg p-3 transition-colors ${
              tone === "good" ? "border-primary/20 hover:bg-primary/5" : "border-destructive/20 hover:bg-destructive/5"
            }`}
          >
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src={getEntityImagePath(row.image_path)}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
                <div>
                  <h3 className="font-mono font-semibold text-sm">{row.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {row.type} • {row.age} Age
                  </p>
                </div>
              </div>
              <Badge variant={tone === "good" ? "secondary" : "destructive"}>
                {tone === "good" ? "Weak to you" : "Counter"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
              <span>
                <span className="text-muted-foreground">{subjectName} deals:</span> {row.damageDealt} ({row.dpsDealt}{" "}
                dps)
              </span>
              <span>
                <span className="text-muted-foreground">{row.name} deals:</span> {row.damageTaken} ({row.dpsTaken} dps)
              </span>
              <span>
                <span className="text-muted-foreground">HP:</span> {row.hp}
              </span>
              <span>
                <span className="text-muted-foreground">Cost:</span> {row.cost}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function CountersClient({ units, unit, goodAgainst, counteredBy }: CountersClientProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-mono font-bold">Unit Counters</h1>
              <p className="text-muted-foreground">
                Computed from attack classes, armour and cost — not hand-written lists
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/units">All units</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Unit</CardTitle>
              <CardDescription>Pick a unit to see both sides of its matchups</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={unit.id} onValueChange={(value) => router.push(`/counters?unit=${value}`)}>
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {entry.name} ({entry.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={getEntityImagePath(unit.image_path)}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                  <div>
                    <CardTitle className="text-2xl">{unit.name}</CardTitle>
                    <CardDescription>
                      {unit.type} • {unit.age} Age
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/units/${unit.id}`}>Full stats</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{unit.description}</p>
              <div className="grid gap-4 md:grid-cols-3 text-sm font-mono">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Cost</p>
                  <p>{unit.cost} weighted resources</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Combat</p>
                  <p>
                    {unit.hp} HP • {unit.attack} atk • {unit.meleeArmor}/{unit.pierceArmor} armor
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Mobility</p>
                  <p>
                    Speed {unit.movementSpeed}
                    {unit.range ? ` • range ${unit.range}` : " • melee"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Counters</CardTitle>
                <CardDescription>{unit.name} wins these trades</CardDescription>
              </CardHeader>
              <CardContent>
                <MatchupList
                  rows={goodAgainst}
                  tone="good"
                  emptyMessage="No lopsided matchups in its favour"
                  subjectName={unit.name}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Countered By</CardTitle>
                <CardDescription>These win the trade against {unit.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <MatchupList
                  rows={counteredBy}
                  tone="bad"
                  emptyMessage="Nothing clearly counters it"
                  subjectName={unit.name}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
