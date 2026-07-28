"use client"

import { Gauge, Heart, Shield, ShieldAlert, Swords } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AgeBadge, Chip, TypeBadge } from "@/components/game/badges"
import { DetailHero } from "@/components/game/detail-hero"
import { EntityIcon } from "@/components/game/entity-icon"
import { StatTile } from "@/components/game/stats"
import { PageHeader, PageShell, Section } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  hitsToKill: number
  hitsToDie: number
  timeToKill: number
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
    return <p className="panel px-4 py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
  }

  const accent = tone === "good" ? "var(--success)" : "var(--destructive)"

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <Link key={row.id} href={`/units/${row.id}`} className="panel panel-interactive block p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <EntityIcon src={row.image_path} alt="" size="sm" />
              <div className="min-w-0">
                <p className="truncate font-medium">{row.name}</p>
                <div className="mt-0.5 flex items-center gap-1">
                  <TypeBadge type={row.type} />
                  <AgeBadge age={row.age} />
                </div>
              </div>
            </div>
            <Chip tone={accent}>{tone === "good" ? "Weak to you" : "Counter"}</Chip>
          </div>

          <dl className="tabular mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[12px] sm:grid-cols-4">
            <div>
              <dt className="label-caps">{subjectName} deals</dt>
              <dd style={{ color: "var(--success)" }}>
                {row.damageDealt} ({row.dpsDealt} dps)
              </dd>
            </div>
            <div>
              <dt className="label-caps">{row.name} deals</dt>
              <dd style={{ color: "var(--destructive)" }}>
                {row.damageTaken} ({row.dpsTaken} dps)
              </dd>
            </div>
            <div>
              <dt className="label-caps">Hits to kill</dt>
              <dd>
                {row.hitsToKill} <span className="text-muted-foreground">/ {row.hitsToDie} taken</span>
              </dd>
            </div>
            <div>
              <dt className="label-caps">Kill time</dt>
              <dd>{row.timeToKill}s</dd>
            </div>
          </dl>
        </Link>
      ))}
    </div>
  )
}

export function CountersClient({ units, unit, goodAgainst, counteredBy }: CountersClientProps) {
  const router = useRouter()

  return (
    <PageShell width="default">
      <PageHeader
        eyebrow="Analysis"
        title="Unit counters"
        description="Computed from attack classes, armour and cost — not hand-written lists."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/battle?a=${unit.id}`}>Simulate a fight</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/units">All units</Link>
            </Button>
          </>
        }
      />

      <Section title="Pick a unit">
        <Select value={unit.id} onValueChange={(value) => router.push(`/counters?unit=${value}`)}>
          <SelectTrigger className="h-11 w-full sm:w-96" aria-label="Select unit">
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
      </Section>

      <DetailHero
        name={unit.name}
        image={unit.image_path}
        meta={
          <>
            <TypeBadge type={unit.type} />
            <AgeBadge age={unit.age} />
          </>
        }
        description={unit.description}
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href={`/units/${unit.id}`}>Full stats</Link>
          </Button>
        }
        stats={
          <>
            <StatTile label="Hit points" value={unit.hp} icon={Heart} />
            <StatTile label="Attack" value={unit.attack} icon={Swords} />
            <StatTile
              label="Armor"
              value={`${unit.meleeArmor} / ${unit.pierceArmor}`}
              hint="melee / pierce"
              icon={Shield}
            />
            <StatTile
              label="Speed"
              value={unit.movementSpeed}
              hint={unit.range ? `range ${unit.range}` : "melee"}
              icon={Gauge}
            />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Counters" description={`${unit.name} wins these trades`}>
          <MatchupList
            rows={goodAgainst}
            tone="good"
            emptyMessage="No lopsided matchups in its favour."
            subjectName={unit.name}
          />
        </Section>

        <Section
          title={
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" aria-hidden />
              Countered by
            </span>
          }
          description={`These win the trade against ${unit.name}`}
        >
          <MatchupList
            rows={counteredBy}
            tone="bad"
            emptyMessage="Nothing clearly counters it."
            subjectName={unit.name}
          />
        </Section>
      </div>
    </PageShell>
  )
}
