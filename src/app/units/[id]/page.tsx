import { ArrowRight, Gauge, Heart, Shield, Swords } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AgeBadge, Chip, TypeBadge } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { DetailHero } from "@/components/game/detail-hero"
import { EntityIcon } from "@/components/game/entity-icon"
import { StatRow, StatTile } from "@/components/game/stats"
import { BackLink, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { getAllUnits, getCivilizationById, getUnitById } from "@/lib/data"
import { BASE_MELEE_CLASS, BASE_PIERCE_CLASS } from "@/lib/game/classes"
import { applyUpgrades, resolveUpgrades, upgradeCost } from "@/lib/game/upgrades"
import type { Unit } from "@/lib/types"

function MatchupGrid({ units, empty }: { units: Unit[]; empty: string }) {
  if (units.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {units.map((unit) => (
        <Link
          key={unit.id}
          href={`/units/${unit.id}`}
          className="panel panel-interactive flex items-center gap-2.5 p-2.5"
        >
          <EntityIcon src={unit.image_path} alt="" size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{unit.name}</span>
            <span className="tabular block font-mono text-[11px] text-muted-foreground">
              {unit.stats.hp} HP · {unit.stats.attack} atk
            </span>
          </span>
        </Link>
      ))}
    </div>
  )
}

export default async function UnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const unit = await getUnitById(id)

  if (!unit) {
    notFound()
  }

  const [allUnits, civ] = await Promise.all([
    getAllUnits(),
    unit.civSpecific ? getCivilizationById(unit.civSpecific) : Promise.resolve(null),
  ])

  const byId = new Map(allUnits.map((entry) => [entry.id, entry]))
  const resolve = (ids: string[]) => ids.map((unitId) => byId.get(unitId)).filter((entry): entry is Unit => !!entry)

  const goodAgainstUnits = resolve(unit.goodAgainst)
  const counterUnits = resolve(unit.counters)
  const upgradeChain = resolve([unit.upgradesFrom, unit.id, ...(unit.upgrades ?? [])].filter(Boolean) as string[])

  // Blacksmith / university lines that reach this unit, all of them researched.
  const imperialUpgrades = resolveUpgrades(unit, "Imperial").applied
  const upgraded = applyUpgrades(unit, imperialUpgrades)
  const upgradeRows = [
    { label: "Attack", base: unit.stats.attack, next: upgraded.stats.attack },
    { label: "Melee armor", base: unit.stats.meleeArmor, next: upgraded.stats.meleeArmor },
    { label: "Pierce armor", base: unit.stats.pierceArmor, next: upgraded.stats.pierceArmor },
    { label: "Range", base: unit.stats.range ?? 0, next: upgraded.stats.range ?? 0 },
    { label: "Speed", base: unit.stats.movementSpeed, next: upgraded.stats.movementSpeed },
  ].filter((row) => row.next !== row.base)

  // The full attack list includes base melee/pierce damage; only the
  // class-specific entries are bonuses worth showing.
  const attackBonuses = unit.stats.attackBonuses.filter(
    (bonus) => bonus.classId !== BASE_MELEE_CLASS && bonus.classId !== BASE_PIERCE_CLASS && bonus.bonus !== 0,
  )
  const armorClasses = unit.stats.armorClasses.filter(
    (armour) => armour.id !== BASE_MELEE_CLASS && armour.id !== BASE_PIERCE_CLASS,
  )

  return (
    <PageShell width="default">
      <BackLink href="/units" label="All units" />

      <DetailHero
        name={unit.name}
        image={unit.image_path}
        meta={
          <>
            <TypeBadge type={unit.type} />
            <AgeBadge age={unit.age} />
            {civ && <Chip tone="var(--type-unique)">{civ.name} unique</Chip>}
          </>
        }
        description={unit.description}
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href={`/counters?unit=${unit.id}`}>
                Counter analysis
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/battle?a=${unit.id}`}>Simulate a fight</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/compare?units=${unit.id}`}>Compare</Link>
            </Button>
          </>
        }
        stats={
          <>
            <StatTile label="Hit points" value={unit.stats.hp} icon={Heart} />
            <StatTile label="Attack" value={`${unit.stats.attack} ${unit.stats.attackType}`} icon={Swords} />
            <StatTile
              label="Armor"
              value={`${unit.stats.meleeArmor} / ${unit.stats.pierceArmor}`}
              hint="melee / pierce"
              icon={Shield}
            />
            <StatTile
              label="Speed"
              value={unit.stats.movementSpeed}
              hint={unit.stats.range ? `range ${unit.stats.range}` : "melee"}
              icon={Gauge}
            />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Cost">
          <Panel className="space-y-2">
            <CostChips cost={unit.cost} size="md" />
            <div className="divide-y">
              <StatRow label="Training time" value={`${unit.stats.trainingTime}s`} />
              <StatRow label="Attack speed" value={`${unit.stats.attackSpeed}s`} />
              <StatRow label="Line of sight" value={unit.stats.lineOfSight} />
            </div>
          </Panel>
        </Section>

        <Section title="Combat detail">
          <Panel>
            <div className="divide-y">
              <StatRow label="Hit points" value={unit.stats.hp} />
              <StatRow label={`Attack (${unit.stats.attackType})`} value={unit.stats.attack} />
              {unit.stats.range ? <StatRow label="Range" value={unit.stats.range} /> : null}
              <StatRow label="Melee armor" value={unit.stats.meleeArmor} />
              <StatRow label="Pierce armor" value={unit.stats.pierceArmor} />
              {unit.stats.minRange ? <StatRow label="Minimum range" value={unit.stats.minRange} /> : null}
              {unit.stats.range && unit.stats.accuracy < 100 ? (
                <StatRow label="Accuracy" value={`${unit.stats.accuracy}%`} />
              ) : null}
              {unit.stats.attackDelay > 0 ? (
                <StatRow label="Attack delay" value={`${unit.stats.attackDelay.toFixed(2)}s`} />
              ) : null}
              {unit.stats.blastWidth > 0 ? (
                <StatRow
                  label="Blast radius"
                  value={`${unit.stats.blastWidth} ${unit.stats.blastWidth === 1 ? "tile" : "tiles"}`}
                />
              ) : null}
              {unit.stats.garrisonCapacity > 0 ? (
                <StatRow label="Garrison" value={unit.stats.garrisonCapacity} />
              ) : null}
            </div>
            {armorClasses.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t pt-3">
                <p className="label-caps">Armor classes</p>
                <div className="flex flex-wrap gap-1">
                  {armorClasses.map((armour) => (
                    <Chip key={armour.id}>
                      {armour.name}
                      {armour.amount !== 0 && ` ${armour.amount > 0 ? "+" : ""}${armour.amount}`}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </Section>
      </div>

      {upgradeRows.length > 0 && (
        <Section
          title="Fully upgraded"
          description="Every blacksmith, university and dock upgrade that reaches this unit, researched."
        >
          <Panel className="space-y-3">
            <div className="grid gap-x-6 sm:grid-cols-2">
              {upgradeRows.map((row) => (
                <StatRow
                  key={row.label}
                  label={row.label}
                  value={
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-muted-foreground">{row.base}</span>
                      <ArrowRight className="h-3 w-3 self-center text-muted-foreground" aria-hidden />
                      <span>{Number(row.next.toFixed(2))}</span>
                      <span className="text-[11px]" style={{ color: "var(--success)" }}>
                        +{Number((row.next - row.base).toFixed(2))}
                      </span>
                    </span>
                  }
                />
              ))}
            </div>
            <div className="space-y-1.5 border-t pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="label-caps">Upgrade bill</p>
                <CostChips cost={upgradeCost(imperialUpgrades)} />
              </div>
              <div className="flex flex-wrap gap-1">
                {imperialUpgrades.map((tech) => (
                  <Chip key={tech.id} title={`${tech.building} · ${tech.age} Age`}>
                    {tech.name}
                  </Chip>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Civilization bonuses and unique techs are not included — pick a civ on the{" "}
                <Link href={`/battle?a=${unit.id}`} className="underline underline-offset-2">
                  battle simulator
                </Link>{" "}
                to see which of these it actually has.
              </p>
            </div>
          </Panel>
        </Section>
      )}

      {unit.effects.length > 0 && (
        <Section title="Notes">
          <Panel className="space-y-1.5">
            {unit.effects.map((effect) => (
              <p key={effect} className="text-sm text-muted-foreground">
                {effect}
              </p>
            ))}
          </Panel>
        </Section>
      )}

      {attackBonuses.length > 0 && (
        <Section title="Attack bonuses" description="Extra damage against specific armor classes">
          <Panel>
            <div className="grid gap-x-6 sm:grid-cols-2">
              {attackBonuses.map((bonus) => (
                <StatRow
                  key={bonus.classId}
                  label={`vs ${bonus.class}`}
                  value={`${bonus.bonus > 0 ? "+" : ""}${bonus.bonus}`}
                />
              ))}
            </div>
          </Panel>
        </Section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Strong against" description="Derived from attack, armor and cost">
          <MatchupGrid units={goodAgainstUnits} empty="No lopsided matchup in its favour." />
        </Section>
        <Section title="Weak against" description={`Units that win the trade against ${unit.name}`}>
          <MatchupGrid units={counterUnits} empty="Nothing clearly counters it." />
        </Section>
      </div>

      {upgradeChain.length > 1 && (
        <Section title="Upgrade path">
          <Panel className="flex flex-wrap items-center gap-2">
            {upgradeChain.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                {index > 0 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />}
                <Button asChild size="sm" variant={step.id === unit.id ? "default" : "outline"}>
                  <Link href={`/units/${step.id}`}>{step.name}</Link>
                </Button>
              </div>
            ))}
          </Panel>
        </Section>
      )}
    </PageShell>
  )
}
