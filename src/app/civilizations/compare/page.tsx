import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { compareCivilizations, getAllCivilizations } from "@/lib/data"
import type { Building, Technology, Unit } from "@/lib/types"
import { CivComparePicker } from "./compare-client"

interface Diff {
  units: Unit[]
  techs: Technology[]
  buildings: Building[]
}

function DiffSection({
  title,
  items,
  hrefBase,
}: {
  title: string
  items: { id: string; name: string }[]
  hrefBase: string
}) {
  return (
    <div>
      <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
        {title} ({items.length})
      </h4>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Link key={item.id} href={`${hrefBase}/${item.id}`}>
              <span className="text-xs border rounded px-2 py-1 hover:bg-accent">{item.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function DiffColumn({ diff }: { diff: Diff }) {
  return (
    <div className="space-y-4">
      <DiffSection title="Units" items={diff.units} hrefBase="/units" />
      <DiffSection title="Technologies" items={diff.techs} hrefBase="/technologies" />
      <DiffSection title="Buildings" items={diff.buildings} hrefBase="/buildings" />
    </div>
  )
}

export default async function CivilizationComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>
}) {
  const params = await searchParams
  const civs = await getAllCivilizations()
  const options = civs.map((civ) => ({ id: civ.id, name: civ.name }))

  const a = params.a && civs.some((civ) => civ.id === params.a) ? params.a : options[0]?.id
  const b = params.b && civs.some((civ) => civ.id === params.b) ? params.b : undefined
  const comparison = a && b ? await compareCivilizations(a, b) : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-mono font-bold">Compare Civilizations</h1>
            <p className="text-muted-foreground">What one civ has that the other does not</p>
          </div>

          <CivComparePicker options={options} a={a} b={b} />

          {!comparison ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Pick two civilizations to see the difference.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Only {comparison.a.name}</CardTitle>
                  <CardDescription>
                    {comparison.onlyA.units.length} units • {comparison.onlyA.techs.length} techs •{" "}
                    {comparison.onlyA.buildings.length} buildings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DiffColumn diff={comparison.onlyA} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Only {comparison.b.name}</CardTitle>
                  <CardDescription>
                    {comparison.onlyB.units.length} units • {comparison.onlyB.techs.length} techs •{" "}
                    {comparison.onlyB.buildings.length} buildings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DiffColumn diff={comparison.onlyB} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
