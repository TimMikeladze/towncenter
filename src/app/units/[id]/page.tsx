import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getUnitById, getCivilizationById } from "@/lib/data"

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const unit = await getUnitById(id)

  if (!unit) {
    notFound()
  }

  const civ = unit.civSpecific ? await getCivilizationById(unit.civSpecific) : null

  // Load counter units and good-against units
  const goodAgainstUnits = (await Promise.all(unit.goodAgainst.map(id => getUnitById(id)))).filter((u): u is NonNullable<typeof u> => u !== undefined)
  const counterUnits = (await Promise.all(unit.counters.map(id => getUnitById(id)))).filter((u): u is NonNullable<typeof u> => u !== undefined)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/units">Back to Units</Link>
              </Button>
              <div>
                <h1 className="text-3xl font-mono font-bold">{unit.name}</h1>
                <p className="text-muted-foreground">
                  {unit.type} • {unit.age} Age
                  {civ && ` • ${civ.name} Unique Unit`}
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{unit.description}</p>
            </CardContent>
          </Card>

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
              <Separator />
              <div>
                <span className="text-muted-foreground">Armor Classes</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {unit.stats.armorClasses.map((ac) => (
                    <span key={ac} className="text-xs bg-muted px-2 py-1 rounded">
                      {ac}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {unit.stats.attackBonuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attack Bonuses</CardTitle>
                <CardDescription>Extra damage against specific unit types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {unit.stats.attackBonuses.map((bonus) => (
                  <div key={bonus.class} className="flex items-center justify-between">
                    <span className="text-muted-foreground">vs {bonus.class}</span>
                    <span className="font-mono">+{bonus.bonus}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Strong Against</CardTitle>
                <CardDescription>Units this unit counters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {goodAgainstUnits.map((counterUnit) => (
                    <Link key={counterUnit.id} href={`/units/${counterUnit.id}`}>
                      <Button variant="outline" size="sm">
                        {counterUnit.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weak Against</CardTitle>
                <CardDescription>Units that counter this unit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {counterUnits.map((counterUnit) => (
                    <Link key={counterUnit.id} href={`/units/${counterUnit.id}`}>
                      <Button variant="outline" size="sm">
                        {counterUnit.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {unit.upgrades && unit.upgrades.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Path</CardTitle>
                <CardDescription>Unit upgrades available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {unit.upgrades.map((upgradeId) => (
                    <span key={upgradeId} className="text-sm bg-muted px-3 py-1 rounded font-mono">
                      {upgradeId.replace(/-/g, " ")}
                    </span>
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
