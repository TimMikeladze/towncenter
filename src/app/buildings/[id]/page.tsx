import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBuildingById } from "@/lib/data"
import { getEntityImagePath } from "@/lib/utils/images"

export default async function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const building = await getBuildingById(id)

  if (!building) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <Link href="/buildings">
          <Button variant="ghost" size="sm" className="font-mono text-xs h-7 px-2">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Buildings
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        <div className="border-2 p-6 bg-card">
          <div className="flex items-start gap-6">
            <Image
              src={getEntityImagePath(building.image_path)}
              alt={building.name}
              width={120}
              height={120}
              className="border"
            />
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-mono font-bold uppercase tracking-tight">{building.name}</h1>
                <p className="text-xs font-mono text-muted-foreground uppercase mt-1">
                  {building.type} · {building.age} Age
                </p>
              </div>
              <p className="text-xs font-mono leading-relaxed">{building.description}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-mono uppercase">Cost</CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-4 space-y-2">
              {Object.entries(building.cost).map(([resource, amount]) => (
                <div key={resource} className="flex justify-between text-xs font-mono">
                  <span className="uppercase">{resource}</span>
                  <span className="font-bold">{amount}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-mono pt-2 border-t">
                <span className="uppercase">Build Time</span>
                <span className="font-bold">{building.buildTime}s</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-mono uppercase">Stats</CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-4 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="uppercase">Hit Points</span>
                <span className="font-bold">{building.hitPoints}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="uppercase">Melee Armor</span>
                <span className="font-bold">{building.meleeArmor}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="uppercase">Pierce Armor</span>
                <span className="font-bold">{building.pierceArmor}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="uppercase">Line of Sight</span>
                <span className="font-bold">{building.lineOfSight}</span>
              </div>
              {building.garrisonCapacity && (
                <div className="flex justify-between text-xs font-mono pt-2 border-t">
                  <span className="uppercase">Garrison</span>
                  <span className="font-bold">{building.garrisonCapacity}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {building.trainsUnits && building.trainsUnits.length > 0 && (
          <Card className="border-2">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-mono uppercase">Trains Units</CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-4">
              <div className="flex flex-wrap gap-2">
                {building.trainsUnits.map((unitId) => (
                  <Link key={unitId} href={`/units/${unitId}`}>
                    <Button variant="outline" size="sm" className="font-mono text-xs h-7 bg-transparent">
                      {unitId.replace(/-/g, " ").toUpperCase()}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {building.researchesTechs && building.researchesTechs.length > 0 && (
          <Card className="border-2">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-mono uppercase">Researches Technologies</CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-4">
              <div className="flex flex-wrap gap-2">
                {building.researchesTechs.map((techId) => (
                  <Link key={techId} href={`/technologies/${techId}`}>
                    <Button variant="outline" size="sm" className="font-mono text-xs h-7 bg-transparent">
                      {techId.replace(/-/g, " ").toUpperCase()}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
