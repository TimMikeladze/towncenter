import { getTechnologyById } from "@/lib/data"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function TechnologyDetailPage({ params }: { params: { id: string } }) {
  const tech = getTechnologyById(params.id)

  if (!tech) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <Link href="/technologies">
          <Button variant="ghost" size="sm" className="font-mono text-xs h-7 px-2">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Technologies
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        <div className="border-2 p-6 bg-card">
          <div className="flex items-start gap-6">
            <Image
              src={`/.jpg?height=120&width=120&query=${tech.name}`}
              alt={tech.name}
              width={120}
              height={120}
              className="border"
            />
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-mono font-bold uppercase tracking-tight">{tech.name}</h1>
                <p className="text-xs font-mono text-muted-foreground uppercase mt-1">
                  {tech.category} · {tech.age} Age
                  {tech.civSpecific && ` · ${tech.civSpecific.toUpperCase()}`}
                </p>
              </div>
              <p className="text-xs font-mono leading-relaxed">{tech.description}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-mono uppercase">Cost & Time</CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-4 space-y-2">
              {Object.entries(tech.cost).map(([resource, amount]) => (
                <div key={resource} className="flex justify-between text-xs font-mono">
                  <span className="uppercase">{resource}</span>
                  <span className="font-bold">{amount}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-mono pt-2 border-t">
                <span className="uppercase">Research Time</span>
                <span className="font-bold">{tech.researchTime}s</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-mono uppercase">Effects</CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-4 space-y-2">
              {tech.effects.map((effect, index) => (
                <div key={index} className="text-xs font-mono">
                  • {effect}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {tech.affectedUnits && tech.affectedUnits.length > 0 && (
          <Card className="border-2">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-mono uppercase">Affected Units</CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-4">
              <div className="flex flex-wrap gap-2">
                {tech.affectedUnits.map((unitId) => (
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

        {tech.affectedBuildings && tech.affectedBuildings.length > 0 && (
          <Card className="border-2">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-mono uppercase">Affected Buildings</CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-4">
              <div className="text-xs font-mono uppercase">
                {tech.affectedBuildings.includes("all") ? "All Buildings" : tech.affectedBuildings.join(", ")}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
