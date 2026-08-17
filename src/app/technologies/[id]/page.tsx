import { Clock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AgeBadge, Chip } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { DetailHero } from "@/components/game/detail-hero"
import { StatTile } from "@/components/game/stats"
import { BackLink, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { getTechnologyById } from "@/lib/data"

export default async function TechnologyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tech = await getTechnologyById(id)

  if (!tech) {
    notFound()
  }

  const totalCost = Object.values(tech.cost).reduce<number>((sum, amount) => sum + (amount ?? 0), 0)

  return (
    <PageShell width="default">
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

      {tech.affectedUnits && tech.affectedUnits.length > 0 && (
        <Section title="Affected units">
          <div className="flex flex-wrap gap-2">
            {tech.affectedUnits.map((unitId) => (
              <Button key={unitId} asChild size="sm" variant="outline">
                <Link href={`/units/${unitId}`} className="capitalize">
                  {unitId.replace(/-/g, " ")}
                </Link>
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
