import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getAllTechnologies, getAllUnits, getCivilizationById } from "@/lib/data"
import { getEntityImagePath } from "@/lib/utils/images"

const MISSING_PREVIEW = 12

export default async function CivilizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const civ = await getCivilizationById(id)

  if (!civ) {
    notFound()
  }

  const [allUnits, allTechs] = await Promise.all([getAllUnits(), getAllTechnologies()])
  const unitById = new Map(allUnits.map((unit) => [unit.id, unit]))
  const techById = new Map(allTechs.map((tech) => [tech.id, tech]))

  const uniqueUnits = civ.uniqueUnits.map((unitId) => unitById.get(unitId)).filter((unit) => !!unit)
  const uniqueTechs = [civ.uniqueTechs.castle, civ.uniqueTechs.imperial]
    .map((techId) => techById.get(techId))
    .filter((tech) => !!tech)
  const missingUnits = civ.techTree.missingUnits.map((unitId) => unitById.get(unitId)).filter((unit) => !!unit)
  const missingTechs = civ.techTree.missingTechs.map((techId) => techById.get(techId)).filter((tech) => !!tech)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/civilizations">Back</Link>
            </Button>
            <Image
              src={getEntityImagePath(civ.image_path)}
              alt={civ.name}
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-3xl font-mono font-bold">{civ.name}</h1>
              <p className="text-muted-foreground">{civ.types.join(" and ")} civilization</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Civilization Bonuses</CardTitle>
              <CardDescription>Straight from the in-game civilization description</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {civ.bonuses
                  .filter((bonus) => bonus.category !== "team")
                  .map((bonus) => (
                    <div key={bonus.id} className="flex items-start gap-3">
                      <div
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                          bonus.category === "military"
                            ? "bg-destructive"
                            : bonus.category === "economic"
                              ? "bg-primary"
                              : "bg-muted-foreground"
                        }`}
                      />
                      <div>
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
            </CardHeader>
            <CardContent>
              <p className="text-sm">{civ.teamBonus || "None"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unique Units</CardTitle>
              <CardDescription>Trained only by {civ.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {uniqueUnits.map((unit) => (
                  <Link key={unit.id} href={`/units/${unit.id}`}>
                    <div className="border rounded-lg p-4 hover:bg-accent transition-colors h-full">
                      <div className="flex items-center gap-3 mb-2">
                        <Image
                          src={getEntityImagePath(unit.image_path)}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain"
                        />
                        <div>
                          <h3 className="font-mono font-semibold">{unit.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {unit.type} • {unit.age} Age
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{unit.description}</p>
                      <div className="flex items-center gap-4 text-xs mt-3 font-mono">
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
              <CardDescription>Researched at the Castle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uniqueTechs.map((tech, index) => (
                <div key={tech.id}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{tech.age} Age</Badge>
                    <Link href={`/technologies/${tech.id}`} className="font-mono font-semibold hover:underline">
                      {tech.name}
                    </Link>
                    <span className="text-xs text-muted-foreground font-mono">
                      {tech.cost.food ? `${tech.cost.food}F ` : ""}
                      {tech.cost.wood ? `${tech.cost.wood}W ` : ""}
                      {tech.cost.gold ? `${tech.cost.gold}G` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tech.description || civ.uniqueTechDescriptions[index] || ""}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tech Tree Gaps</CardTitle>
              <CardDescription>
                {missingUnits.length} units and {missingTechs.length} technologies other civs have
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Missing Units</h4>
                {missingUnits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missingUnits.slice(0, MISSING_PREVIEW).map((unit) => (
                      <span key={unit.id} className="text-xs bg-muted px-2 py-1 rounded line-through">
                        {unit.name}
                      </span>
                    ))}
                    {missingUnits.length > MISSING_PREVIEW && (
                      <span className="text-xs text-muted-foreground">
                        +{missingUnits.length - MISSING_PREVIEW} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All shared units available</p>
                )}
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Missing Technologies</h4>
                {missingTechs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missingTechs.slice(0, MISSING_PREVIEW).map((tech) => (
                      <span key={tech.id} className="text-xs bg-muted px-2 py-1 rounded line-through">
                        {tech.name}
                      </span>
                    ))}
                    {missingTechs.length > MISSING_PREVIEW && (
                      <span className="text-xs text-muted-foreground">
                        +{missingTechs.length - MISSING_PREVIEW} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All shared technologies available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button asChild variant="outline">
              <Link href={`/tech-tree?civ=${civ.id}`}>Full tech tree</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/civilizations/compare?a=${civ.id}`}>Compare with another civ</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/competitive?civ=${civ.id}`}>Matchups</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
