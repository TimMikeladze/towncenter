import { Clock } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AgeBadge, Chip } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { DetailHero } from "@/components/game/detail-hero"
import { StatTile } from "@/components/game/stats"
import { BackLink, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { Button } from "@/components/ui/button"
import { getAllTechnologies, getAllUnits, getTechnologyById } from "@/lib/data"
import { entityIdFromParam } from "@/lib/game/ids"
import { entityParams, technologyHref, unitHref } from "@/lib/hrefs"
import { breadcrumbList, entityThing, pageMetadata } from "@/lib/seo"
import { technologySeo } from "@/lib/seo/entities"

export const dynamicParams = false

export async function generateStaticParams() {
  const techs = await getAllTechnologies()
  return techs.flatMap(entityParams)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const tech = await getTechnologyById(entityIdFromParam(id))
  if (!tech) return { title: "Technology not found" }

  const seo = technologySeo(tech)
  return pageMetadata({
    title: seo.title,
    description: seo.description,
    path: technologyHref(tech),
    imageTitle: tech.name,
    eyebrow: seo.eyebrow,
    imageSubtitle: seo.cardSubtitle,
  })
}

export default async function TechnologyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tech = await getTechnologyById(entityIdFromParam(id))

  if (!tech) {
    notFound()
  }

  const allUnits = tech.affectedUnits?.length ? await getAllUnits() : []
  const affected = (tech.affectedUnits ?? [])
    .map((unitId) => allUnits.find((unit) => unit.id === unitId))
    .filter((unit) => !!unit)

  const totalCost = Object.values(tech.cost).reduce<number>((sum, amount) => sum + (amount ?? 0), 0)

  const seo = technologySeo(tech)

  return (
    <PageShell width="default">
      <JsonLd
        data={[
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Technologies", path: "/technologies" },
            { name: tech.name, path: technologyHref(tech) },
          ]),
          entityThing({
            name: tech.name,
            description: tech.description || seo.description,
            path: technologyHref(tech),
            image: tech.image_path,
            category: "Technology",
            properties: seo.properties,
          }),
        ]}
      />
      <BackLink href="/technologies" label="All technologies" />

      <DetailHero
        name={tech.name}
        image={tech.image_path}
        meta={
          <>
            <Chip tone="var(--type-monk)">{tech.category}</Chip>
            <AgeBadge age={tech.age} />
            {tech.civSpecific && <Chip tone="var(--type-unique)">{tech.civSpecific.replace(/-/g, " ")}</Chip>}
          </>
        }
        description={tech.description}
        stats={
          <>
            <StatTile label="Research time" value={`${tech.researchTime}s`} icon={Clock} />
            <StatTile label="Total resources" value={totalCost} />
            <StatTile label="Age" value={tech.age} />
            <StatTile label="Researched at" value={tech.category} />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Cost">
          <Panel className="space-y-3">
            <CostChips cost={tech.cost} size="md" />
            <p className="text-sm text-muted-foreground">Research takes {tech.researchTime}s.</p>
          </Panel>
        </Section>

        <Section title="Effects">
          <Panel>
            {tech.effects.length > 0 ? (
              <ul className="space-y-1.5 text-sm">
                {tech.effects.map((effect) => (
                  <li key={effect} className="flex gap-1.5">
                    <span className="text-primary">•</span>
                    {effect}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No effect text in the game data.</p>
            )}
          </Panel>
        </Section>
      </div>

      {affected.length > 0 && (
        <Section title="Affected units">
          <div className="flex flex-wrap gap-2">
            {affected.map((unit) => (
              <Button key={unit.id} asChild size="sm" variant="outline">
                <Link href={unitHref(unit)}>{unit.name}</Link>
              </Button>
            ))}
          </div>
        </Section>
      )}

      {tech.affectedBuildings && tech.affectedBuildings.length > 0 && (
        <Section title="Affected buildings">
          <Panel>
            <p className="text-sm capitalize text-muted-foreground">
              {tech.affectedBuildings.includes("all")
                ? "All buildings"
                : tech.affectedBuildings.map((entry) => entry.replace(/-/g, " ")).join(", ")}
            </p>
          </Panel>
        </Section>
      )}
    </PageShell>
  )
}
