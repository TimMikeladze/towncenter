"use client"

import { Crown, Link2, Minus, Plus, Scale, Swords, Timer, Wallet } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { AgeBadge, Chip } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { EntityIcon } from "@/components/game/entity-icon"
import { StatTile } from "@/components/game/stats"
import { UnitPicker } from "@/components/game/unit-picker"
import { PageHeader, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { Rail } from "@/components/ui/rail"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type BattleResult, breakEvenCount, simulateBattle } from "@/lib/game/battle"
import { resourceCost } from "@/lib/game/combat"
import { applyUpgrades, resolveUpgrades, type UpgradeTech, upgradeCost } from "@/lib/game/upgrades"
import type { Age, Unit, UnitCost } from "@/lib/types"

export type BattleUnit = Unit

interface BattleClientProps {
  units: BattleUnit[]
  civs: { id: string; name: string }[]
  civUpgrades: Record<string, number[]>
  civUnitIds: Record<string, string>
  initial: {
    a: string
    b: string
    countA: number
    countB: number
    age: string
    civA: string
    civB: string
  }
}

const AGE_OPTIONS: { value: string; label: string }[] = [
  { value: "none", label: "No upgrades" },
  { value: "Feudal", label: "Feudal Age" },
  { value: "Castle", label: "Castle Age" },
  { value: "Imperial", label: "Imperial Age" },
]

const SIDE_A = "var(--chart-4)"
const SIDE_B = "var(--chart-3)"

function clampCount(value: number) {
  return Math.min(200, Math.max(1, Math.round(value) || 1))
}

function totalCost(cost: UnitCost, count: number): UnitCost {
  return {
    food: (cost.food ?? 0) * count || undefined,
    wood: (cost.wood ?? 0) * count || undefined,
    gold: (cost.gold ?? 0) * count || undefined,
    stone: (cost.stone ?? 0) * count || undefined,
  }
}

function CountStepper({
  value,
  onChange,
  tone,
  label,
}: {
  value: number
  onChange: (next: number) => void
  tone: string
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className="press h-11 w-11 shrink-0 sm:h-10 sm:w-10"
        onClick={() => onChange(value - 1)}
        aria-label={`One fewer ${label}`}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={200}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={`${label} count`}
        className="tabular h-11 w-full min-w-0 rounded-md border bg-background/50 text-center font-mono text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:h-10"
        style={{ color: tone }}
      />
      <Button
        variant="outline"
        size="icon"
        className="press h-11 w-11 shrink-0 sm:h-10 sm:w-10"
        onClick={() => onChange(value + 1)}
        aria-label={`One more ${label}`}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

function UpgradeChips({ applied, missing }: { applied: UpgradeTech[]; missing: UpgradeTech[] }) {
  if (applied.length === 0 && missing.length === 0) {
    return <p className="text-xs text-muted-foreground">No blacksmith line reaches this unit.</p>
  }
  // Seven upgrade names wrap to three lines on a phone and push the fight
  // controls off-screen; they scroll in one line instead. `Rail` rather than
  // the bare class, so the row fades at whichever end still has chips behind
  // it — without that a phone cannot tell a clipped row from a finished one.
  return (
    <Rail className="-mx-1 gap-1 px-1 py-0.5 md:flex-wrap md:overflow-visible">
      {applied.map((tech) => (
        <Chip key={tech.id} tone="var(--success)" title={`${tech.building} · ${tech.age} Age`}>
          {tech.name}
        </Chip>
      ))}
      {missing.map((tech) => (
        <Chip key={tech.id} tone="var(--destructive)" title="Not available to this civilization">
          {tech.name} ✕
        </Chip>
      ))}
    </Rail>
  )
}

/** Survivors over time for both stacks, as a share of their starting count. */
function BattleChart({ result, startA, startB }: { result: BattleResult; startA: number; startB: number }) {
  const width = 100
  const height = 34
  const end = Math.max(result.elapsed, 0.1)

  // Counts only change on kills, so the line is a staircase, not a slope.
  const steps = (key: "a" | "b", start: number) => {
    const points: string[] = []
    let previousY: number | null = null
    for (const tick of result.timeline) {
      const x = (tick.time / end) * width
      const y = height - (tick[key] / start) * height
      if (previousY !== null && previousY !== y) points.push(`${x.toFixed(2)},${previousY.toFixed(2)}`)
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
      previousY = y
    }
    return points
  }

  const series = [
    { key: "a" as const, start: startA, tone: SIDE_A },
    { key: "b" as const, start: startB, tone: SIDE_B },
  ]

  return (
    <div className="space-y-1.5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-24 w-full sm:h-32"
        role="img"
        aria-label="Surviving units over time"
      >
        <title>Surviving units over time</title>
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1={0}
            x2={width}
            y1={height * fraction}
            y2={height * fraction}
            stroke="var(--border)"
            strokeWidth={0.4}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {series.map((entry) => {
          const points = steps(entry.key, entry.start)
          const last = points[points.length - 1]?.split(",")[0] ?? "0"
          return (
            <g key={entry.key}>
              <polygon points={`0,${height} ${points.join(" ")} ${last},${height}`} fill={entry.tone} opacity={0.12} />
              <polyline
                points={points.join(" ")}
                fill="none"
                stroke={entry.tone}
                strokeWidth={1.6}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )
        })}
      </svg>
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>
          0s · {startA} v {startB}
        </span>
        <span>
          {result.elapsed}s · {result.a.survivors} v {result.b.survivors}
        </span>
      </div>
    </div>
  )
}

export function BattleClient({ units, civs, civUpgrades, civUnitIds, initial }: BattleClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [aId, setAId] = useState(initial.a)
  const [bId, setBId] = useState(initial.b)
  const [countA, setCountA] = useState(clampCount(initial.countA))
  const [countB, setCountB] = useState(clampCount(initial.countB))
  const [age, setAge] = useState(initial.age)
  const [civA, setCivA] = useState(initial.civA)
  const [civB, setCivB] = useState(initial.civB)
  const [freeFire, setFreeFire] = useState(true)

  const byId = useMemo(() => new Map(units.map((unit) => [unit.id, unit])), [units])
  const baseA = byId.get(aId) ?? units[0]
  const baseB = byId.get(bId) ?? units[1] ?? units[0]

  // Keep the URL in step so any fight is a link someone can paste in a lobby.
  useEffect(() => {
    const query = new URLSearchParams({ a: aId, b: bId, na: String(countA), nb: String(countB), age })
    if (civA) query.set("civA", civA)
    if (civB) query.set("civB", civB)
    router.replace(`${pathname}?${query.toString()}`, { scroll: false })
  }, [aId, bId, countA, countB, age, civA, civB, pathname, router])

  const upgradesFor = useCallback(
    (unit: Unit, civ: string) => {
      if (age === "none") return { applied: [] as UpgradeTech[], missing: [] as UpgradeTech[] }
      const civTechs = civ ? new Set(civUpgrades[civ] ?? []) : undefined
      return resolveUpgrades(unit, age as Age, civTechs)
    },
    [age, civUpgrades],
  )

  const upA = useMemo(() => upgradesFor(baseA, civA), [baseA, civA, upgradesFor])
  const upB = useMemo(() => upgradesFor(baseB, civB), [baseB, civB, upgradesFor])

  const unitA = useMemo(() => applyUpgrades(baseA, upA.applied), [baseA, upA])
  const unitB = useMemo(() => applyUpgrades(baseB, upB.applied), [baseB, upB])

  const result = useMemo(
    () => simulateBattle({ unit: unitA, count: countA }, { unit: unitB, count: countB }, { allowFreeFire: freeFire }),
    [unitA, unitB, countA, countB, freeFire],
  )

  const breakEven = useMemo(
    () => breakEvenCount({ unit: unitA, count: countA }, unitB, { allowFreeFire: freeFire }),
    [unitA, unitB, countA, freeFire],
  )

  const costA = resourceCost(unitA)
  const costB = resourceCost(unitB)

  const equalise = () => setCountB(clampCount((costA * countA) / Math.max(1, costB)))

  const availability = (unit: Unit, civ: string) => {
    if (!civ) return null
    const ids = (civUnitIds[civ] ?? "").split(",")
    return ids.includes(unit.id)
  }

  const winnerName = result.winner === "a" ? unitA.name : result.winner === "b" ? unitB.name : null
  const winnerSide = result.winner === "a" ? result.a : result.winner === "b" ? result.b : null

  const sides = [
    { key: "a" as const, unit: unitA, base: baseA, count: countA, tone: SIDE_A, side: result.a, up: upA, civ: civA },
    { key: "b" as const, unit: unitB, base: baseB, count: countB, tone: SIDE_B, side: result.b, up: upB, civ: civB },
  ]

  return (
    <PageShell>
      <PageHeader
        eyebrow="Analysis"
        title="Battle simulator"
        description="Two stacks, real armour classes, real reload timers. Overkill is wasted and out-ranged units eat free shots while they close."
        actions={
          <Button variant="outline" size="sm" onClick={equalise} className="gap-1.5">
            <Scale className="h-3.5 w-3.5" />
            Equal resources
          </Button>
        }
      />

      {/* Fight setup */}
      <div className="grid gap-3 sm:grid-cols-2">
        {sides.map((entry) => {
          const available = availability(entry.base, entry.civ)
          return (
            <Panel key={entry.key} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="label-caps" style={{ color: entry.tone }}>
                  Side {entry.key.toUpperCase()}
                </span>
                <AgeBadge age={entry.base.age} />
              </div>

              <UnitPicker
                units={units}
                value={entry.base}
                onChange={entry.key === "a" ? setAId : setBId}
                label={`Choose side ${entry.key.toUpperCase()}`}
              />

              <CountStepper
                value={entry.count}
                onChange={(next) => (entry.key === "a" ? setCountA : setCountB)(clampCount(next))}
                tone={entry.tone}
                label={entry.base.name}
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <CostChips cost={totalCost(entry.base.cost, entry.count)} />
                <span className="tabular font-mono text-[11px] text-muted-foreground">
                  {entry.count * entry.unit.stats.hp} total HP
                </span>
              </div>

              <div className="space-y-1.5 border-t pt-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="label-caps">Civilization</span>
                  {available === false && <Chip tone="var(--destructive)">Cannot train {entry.base.name}</Chip>}
                </div>
                <Select
                  value={entry.civ || "generic"}
                  onValueChange={(value) => (entry.key === "a" ? setCivA : setCivB)(value === "generic" ? "" : value)}
                >
                  <SelectTrigger className="h-9 w-full text-sm" aria-label={`Side ${entry.key} civilization`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">Every upgrade (generic)</SelectItem>
                    {civs.map((civ) => (
                      <SelectItem key={civ.id} value={civ.id}>
                        {civ.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <UpgradeChips applied={entry.up.applied} missing={entry.up.missing} />
                {entry.up.applied.length > 0 && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="label-caps">Upgrade bill</span>
                    <CostChips cost={upgradeCost(entry.up.applied)} />
                  </div>
                )}
              </div>
            </Panel>
          )
        })}
      </div>

      {/* Global controls */}
      <Panel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="label-caps shrink-0">Upgrades</span>
          <Select value={age} onValueChange={setAge}>
            <SelectTrigger className="h-9 w-full text-sm sm:w-44" aria-label="Upgrade level">
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
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={freeFire}
            onChange={(event) => setFreeFire(event.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          <span className="text-muted-foreground">Ranged units shoot while the enemy closes</span>
        </label>
      </Panel>

      {/* Verdict */}
      <Section title="Result">
        <div className="panel overflow-hidden">
          <div
            className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            style={{
              backgroundColor: winnerName
                ? `color-mix(in srgb, ${result.winner === "a" ? SIDE_A : SIDE_B} 10%, transparent)`
                : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-md border"
                style={{
                  borderColor: `color-mix(in srgb, ${result.winner === "a" ? SIDE_A : SIDE_B} 45%, transparent)`,
                  color: result.winner === "a" ? SIDE_A : SIDE_B,
                }}
              >
                {winnerName ? <Crown className="h-5 w-5" /> : <Swords className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg leading-tight sm:text-xl">
                  {result.stalemate
                    ? "Neither side can finish it"
                    : winnerName
                      ? `${winnerName} wins`
                      : "Mutual destruction"}
                </h3>
                <p className="tabular font-mono text-xs text-muted-foreground">
                  {winnerSide
                    ? `${winnerSide.survivors} left standing · ${result.elapsed}s`
                    : `${result.elapsed}s of fighting`}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto">
              <Link href={`/counters?unit=${baseA.id}`}>
                <Link2 className="h-3.5 w-3.5" />
                Counter analysis
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
            <StatTile label="Duration" value={`${result.elapsed}s`} icon={Timer} />
            <StatTile
              label="Trade ratio"
              value={Number.isFinite(result.tradeRatio) ? `${result.tradeRatio}×` : "∞"}
              hint="resources destroyed per resource lost, side A"
              icon={Scale}
            />
            <StatTile
              label="A lost"
              value={`${result.a.losses}/${countA}`}
              hint={`${result.a.weightedLost} res`}
              icon={Wallet}
            />
            <StatTile
              label="B lost"
              value={`${result.b.losses}/${countB}`}
              hint={`${result.b.weightedLost} res`}
              icon={Wallet}
            />
          </div>

          <div className="border-t p-4">
            <BattleChart result={result} startA={countA} startB={countB} />
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
              <span style={{ color: SIDE_A }}>■ {unitA.name}</span>
              <span style={{ color: SIDE_B }}>■ {unitB.name}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Engagement detail */}
      <Section title="Engagement detail" description="What each side does to the other, per hit and per second.">
        <div className="grid gap-3 sm:grid-cols-2">
          {sides.map((entry) => {
            const enemy = entry.key === "a" ? unitB : unitA
            return (
              <Panel key={entry.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <EntityIcon src={entry.base.image_path} alt="" size="sm" />
                  <p className="min-w-0 flex-1 truncate font-display font-semibold">{entry.unit.name}</p>
                  <span className="label-caps" style={{ color: entry.tone }}>
                    vs {enemy.name}
                  </span>
                </div>
                <dl className="tabular grid grid-cols-2 gap-2 font-mono text-sm">
                  <div className="rounded-md border bg-background/40 px-2.5 py-2">
                    <dt className="label-caps">Damage / hit</dt>
                    <dd className="font-semibold">{entry.side.damagePerHit}</dd>
                  </div>
                  <div className="rounded-md border bg-background/40 px-2.5 py-2">
                    <dt className="label-caps">Hits to kill</dt>
                    <dd className="font-semibold">
                      {Number.isFinite(entry.side.hitsToKill) ? entry.side.hitsToKill : "—"}
                    </dd>
                  </div>
                  <div className="rounded-md border bg-background/40 px-2.5 py-2">
                    <dt className="label-caps" title="Damage per second, accuracy-adjusted">
                      DPS
                    </dt>
                    <dd className="font-semibold">{entry.side.damagePerSecond}</dd>
                  </div>
                  <div className="rounded-md border bg-background/40 px-2.5 py-2">
                    <dt className="label-caps">Free shots</dt>
                    <dd className="font-semibold">{entry.side.freeFireTime}s</dd>
                  </div>
                </dl>
                <dl className="grid grid-cols-3 gap-2 border-t pt-2 text-[11px] text-muted-foreground">
                  <div>
                    <dt className="label-caps">Attack</dt>
                    <dd className="tabular font-mono">
                      {entry.unit.stats.attack}
                      {entry.unit.stats.attack !== entry.base.stats.attack && (
                        <span style={{ color: "var(--success)" }}>
                          {" "}
                          +{entry.unit.stats.attack - entry.base.stats.attack}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps">Armour</dt>
                    <dd className="tabular font-mono">
                      {entry.unit.stats.meleeArmor}/{entry.unit.stats.pierceArmor}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-caps">{entry.unit.stats.range ? "Range" : "Speed"}</dt>
                    <dd className="tabular font-mono">{entry.unit.stats.range ?? entry.unit.stats.movementSpeed}</dd>
                  </div>
                </dl>
              </Panel>
            )
          })}
        </div>
      </Section>

      <Panel className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          <span className="font-semibold">
            {countA} {unitA.name}
          </span>{" "}
          {breakEven === null ? (
            <span className="text-muted-foreground">lose to even a single {unitB.name}.</span>
          ) : (
            <>
              <span className="text-muted-foreground">beat up to</span>{" "}
              <span className="font-semibold" style={{ color: SIDE_A }}>
                {breakEven} {unitB.name}
              </span>
              <span className="text-muted-foreground">.</span>
            </>
          )}
        </p>
        {breakEven !== null && (
          <Button variant="ghost" size="sm" onClick={() => setCountB(clampCount(breakEven))}>
            Set side B to {breakEven}
          </Button>
        )}
      </Panel>

      <p className="text-xs text-muted-foreground">
        Both stacks are assumed to be in contact and focused on one target at a time. Kiting after contact, collision,
        splash radius, healing, conversion and terrain are not modelled — treat the result as the maths of the trade,
        not a replay.
      </p>
    </PageShell>
  )
}
