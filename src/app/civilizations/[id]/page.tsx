import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getCivilizationById, getUnitById, getAllUnits } from "@/lib/data"

export default async function CivilizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const civ = await getCivilizationById(id)

  if (!civ) {
    notFound()
  }

  const uniqueUnits = (await Promise.all(civ.uniqueUnits.map((id) => getUnitById(id)))).filter((u): u is NonNullable<typeof u> => u !== null)
  const allUnits = await getAllUnits()
  const availableUnits = allUnits.filter((u) => !u.civSpecific || u.civSpecific === civ.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/civilizations">Back to Civilizations</Link>
              </Button>
              <div>
                <h1 className="text-3xl font-mono font-bold">{civ.name}</h1>
                <p className="text-muted-foreground">{civ.type} Civilization</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
                <CardDescription>What this civilization excels at</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {civ.strengths.map((strength) => (
                    <Badge key={strength} variant="secondary">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weaknesses</CardTitle>
                <CardDescription>Areas where this civilization struggles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {civ.weaknesses.map((weakness) => (
                    <Badge key={weakness} variant="outline">
                      {weakness}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Civilization Bonuses</CardTitle>
              <CardDescription>Unique advantages and special abilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {civ.bonuses
                  .filter((b) => b.category !== "team")
                  .map((bonus) => (
                    <div key={bonus.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            bonus.category === "military"
                              ? "bg-destructive"
                              : bonus.category === "economic"
                                ? "bg-primary"
                                : "bg-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{bonus.description}</p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{bonus.category}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Bonus</CardTitle>
              <CardDescription>Bonus provided to all team members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{civ.teamBonus}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unique Units</CardTitle>
              <CardDescription>Special units only available to {civ.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {uniqueUnits.map((unit) => (
                  <Link key={unit.id} href={`/units/${unit.id}`}>
                    <div className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-mono font-semibold">{unit.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {unit.type} • {unit.age} Age
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{unit.description}</p>
                      <div className="flex items-center gap-4 text-xs mt-3">
                        <span>
                          <span className="text-muted-foreground">HP:</span> {unit.stats.hp}
                        </span>
                        <span>
                          <span className="text-muted-foreground">Atk:</span> {unit.stats.attack}
                        </span>
                        <span>
                          <span className="text-muted-foreground">Armor:</span> {unit.stats.meleeArmor}/
                          {unit.stats.pierceArmor}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unique Technologies</CardTitle>
              <CardDescription>Special technologies exclusive to {civ.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">Castle Age</Badge>
                  <span className="font-mono font-semibold">{civ.uniqueTechs.castle}</span>
                </div>
                <p className="text-sm text-muted-foreground">Available in Castle Age</p>
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">Imperial Age</Badge>
                  <span className="font-mono font-semibold">{civ.uniqueTechs.imperial}</span>
                </div>
                <p className="text-sm text-muted-foreground">Available in Imperial Age</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tech Tree Overview</CardTitle>
              <CardDescription>Missing units and technologies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Missing Units</h4>
                {civ.techTree.missingUnits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {civ.techTree.missingUnits.map((unitId) => (
                      <span key={unitId} className="text-xs bg-muted px-2 py-1 rounded line-through">
                        {unitId.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All units available</p>
                )}
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Missing Technologies</h4>
                {civ.techTree.missingTechs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {civ.techTree.missingTechs.map((techId) => (
                      <span key={techId} className="text-xs bg-muted px-2 py-1 rounded line-through">
                        {techId.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All technologies available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button asChild variant="outline">
              <Link href={`/tech-tree?civ=${civ.id}`}>View Full Tech Tree</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/competitive?civ=${civ.id}`}>View Matchups</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
