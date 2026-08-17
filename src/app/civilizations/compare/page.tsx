import Link from "next/link"
import { Chip } from "@/components/game/badges"
import { EmptyState } from "@/components/game/empty-state"
import { PageHeader, PageShell, Panel, Section } from "@/components/layout/page-shell"
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
    <div className="space-y-1.5">
      <p className="label-caps">
        {title} ({items.length})
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">None</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((item) => (
            <Link key={item.id} href={`${hrefBase}/${item.id}`}>
              <Chip className="px-2 py-1">{item.name}</Chip>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function DiffColumn({ diff }: { diff: Diff }) {
  return (
    <div className="space-y-3">
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
    <PageShell>
      <PageHeader
        eyebrow="Analysis"
        title="Compare civilizations"
        description="What one civ has that the other does not."
      />

      <CivComparePicker options={options} a={a} b={b} />

      {!comparison ? (
        <EmptyState title="Pick two civilizations" description="Choose a civ on each side to see the difference." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section
            title={`Only ${comparison.a.name}`}
            description={`${comparison.onlyA.units.length} units · ${comparison.onlyA.techs.length} techs · ${comparison.onlyA.buildings.length} buildings`}
          >
            <Panel>
              <DiffColumn diff={comparison.onlyA} />
            </Panel>
          </Section>

          <Section
            title={`Only ${comparison.b.name}`}
            description={`${comparison.onlyB.units.length} units · ${comparison.onlyB.techs.length} techs · ${comparison.onlyB.buildings.length} buildings`}
          >
            <Panel>
              <DiffColumn diff={comparison.onlyB} />
            </Panel>
          </Section>
        </div>
      )}
    </PageShell>
  )
}
