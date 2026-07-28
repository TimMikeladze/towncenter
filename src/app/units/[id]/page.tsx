import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getAllUnits, getCivilizationById, getUnitById } from "@/lib/data"
import { BASE_MELEE_CLASS, BASE_PIERCE_CLASS } from "@/lib/game/classes"
import type { Unit } from "@/lib/types"
import { getEntityImagePath } from "@/lib/utils/images"

function UnitChips({ units }: { units: Unit[] }) {
  if (units.length === 0) {
    return <p className="text-sm text-muted-foreground">No clear matchup in the combat data.</p>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {units.map((unit) => (
        <Link key={unit.id} href={`/units/${unit.id}`}>
          <Button variant="outline" size="sm">
            {unit.name}
          </Button>
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

  // The full attack list includes base melee/pierce damage; only the
  // class-specific entries are bonuses worth showing.
  const attackBonuses = unit.stats.attackBonuses.filter(
    (bonus) => bonus.classId !== BASE_MELEE_CLASS && bonus.classId !== BASE_PIERCE_CLASS && bonus.bonus !== 0,
  )
  const armorClasses = unit.stats.armorClasses.filter(
    (armour) => armour.id !== BASE_MELEE_CLASS && armour.id !== BASE_PIERCE_CLASS,
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/units">Back to Units</Link>
            </Button>
            <Image
              src={getEntityImagePath(unit.image_path)}
              alt={unit.name}
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-3xl font-mono font-bold">{unit.name}</h1>
              <p className="text-muted-foreground">
                {unit.type} • {unit.age} Age
                {civ && ` • ${civ.name} unique unit`}
              </p>
            </div>
          </div>

          {unit.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">{unit.description}</p>
                {unit.effects.map((effect) => (
                  <p key={effect} className="text-sm text-muted-foreground italic">
                    {effect}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unit.cost.food && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Food</span>
                    <span className="font-mono">{unit.cost.food}</span>
                  </div>
                )}
                {unit.cost.wood && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Wood</span>
                    <span className="font-mono">{unit.cost.wood}</span>
                  </div>
                )}
                {unit.cost.gold && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Gold</span>
                    <span className="font-mono">{unit.cost.gold}</span>
                  </div>
                )}
                {unit.cost.stone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Stone</span>
                    <span className="font-mono">{unit.cost.stone}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Training Time</span>
                  <span className="font-mono">{unit.stats.trainingTime}s</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Combat Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hit Points</span>
                  <span className="font-mono">{unit.stats.hp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Attack ({unit.stats.attackType})</span>
                  <span className="font-mono">{unit.stats.attack}</span>
                </div>
                {unit.stats.range && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Range</span>
                    <span className="font-mono">{unit.stats.range}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Attack Speed</span>
                  <span className="font-mono">{unit.stats.attackSpeed}s</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Melee Armor</span>
                  <span className="font-mono">{unit.stats.meleeArmor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pierce Armor</span>
                  <span className="font-mono">{unit.stats.pierceArmor}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Additional Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Movement Speed</span>
                <span className="font-mono">{unit.stats.movementSpeed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Line of Sight</span>
                <span className="font-mono">{unit.stats.lineOfSight}</span>
              </div>
              {armorClasses.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">Armor Classes</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {armorClasses.map((armour) => (
                        <span key={armour.id} className="text-xs bg-muted px-2 py-1 rounded">
                          {armour.name}
                          {armour.amount !== 0 && ` ${armour.amount > 0 ? "+" : ""}${armour.amount}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {attackBonuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attack Bonuses</CardTitle>
                <CardDescription>Extra damage against specific armor classes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {attackBonuses.map((bonus) => (
                  <div key={bonus.classId} className="flex items-center justify-between">
                    <span className="text-muted-foreground">vs {bonus.class}</span>
                    <span className="font-mono">
                      {bonus.bonus > 0 ? "+" : ""}
                      {bonus.bonus}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Strong Against</CardTitle>
                <CardDescription>Derived from attack, armor and cost</CardDescription>
              </CardHeader>
              <CardContent>
                <UnitChips units={goodAgainstUnits} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weak Against</CardTitle>
                <CardDescription>Units that win the trade against {unit.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <UnitChips units={counterUnits} />
              </CardContent>
            </Card>
          </div>

          {upgradeChain.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Path</CardTitle>
                <CardDescription>Where {unit.name} sits in its line</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  {upgradeChain.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2">
                      {index > 0 && <span className="text-muted-foreground">→</span>}
                      <Link href={`/units/${step.id}`}>
                        <Button variant={step.id === unit.id ? "default" : "outline"} size="sm">
                          {step.name}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href={`/counters?unit=${unit.id}`}>Counter analysis</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/compare?units=${unit.id}`}>Compare with other units</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
