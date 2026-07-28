import { Clock, Eye, Shield, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AgeBadge, Chip } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { DetailHero } from "@/components/game/detail-hero"
import { StatRow, StatTile } from "@/components/game/stats"
import { BackLink, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { getBuildingById } from "@/lib/data"

export default async function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const building = await getBuildingById(id)

  if (!building) {
    notFound()
  }

  return (
    <PageShell width="default">
      <BackLink href="/buildings" label="All buildings" />

      <DetailHero
        name={building.name}
        image={building.image_path}
        meta={
          <>
            <Chip tone="var(--type-economy)">{building.type}</Chip>
            <AgeBadge age={building.age} />
          </>
        }
        description={building.description}
        stats={
          <>
            <StatTile label="Hit points" value={building.hitPoints} icon={Shield} />
            <StatTile
              label="Armor"
              value={`${building.meleeArmor} / ${building.pierceArmor}`}
              hint="melee / pierce"
              icon={Shield}
            />
            <StatTile label="Line of sight" value={building.lineOfSight} icon={Eye} />
            <StatTile label="Build time" value={`${building.buildTime}s`} icon={Clock} />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Cost">
          <Panel className="space-y-2">
            <CostChips cost={building.cost} size="md" />
            <div className="divide-y">
              <StatRow label="Build time" value={`${building.buildTime}s`} />
              {building.garrisonCapacity ? (
                <StatRow
                  label={
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" aria-hidden />
                      Garrison
                    </span>
                  }
                  value={building.garrisonCapacity}
                />
              ) : null}
            </div>
          </Panel>
        </Section>

        <Section title="Stats">
          <Panel>
            <div className="divide-y">
              <StatRow label="Hit points" value={building.hitPoints} />
              <StatRow label="Melee armor" value={building.meleeArmor} />
              <StatRow label="Pierce armor" value={building.pierceArmor} />
              <StatRow label="Line of sight" value={building.lineOfSight} />
            </div>
          </Panel>
        </Section>
      </div>

      {building.trainsUnits && building.trainsUnits.length > 0 && (
        <Section title="Trains units">
          <div className="flex flex-wrap gap-2">
            {building.trainsUnits.map((unitId) => (
              <Button key={unitId} asChild size="sm" variant="outline">
                <Link href={`/units/${unitId}`} className="capitalize">
                  {unitId.replace(/-/g, " ")}
                </Link>
              </Button>
            ))}
          </div>
        </Section>
      )}

      {building.researchesTechs && building.researchesTechs.length > 0 && (
        <Section title="Researches technologies">
          <div className="flex flex-wrap gap-2">
            {building.researchesTechs.map((techId) => (
              <Button key={techId} asChild size="sm" variant="outline">
                <Link href={`/technologies/${techId}`} className="capitalize">
                  {techId.replace(/-/g, " ")}
                </Link>
              </Button>
            ))}
          </div>
        </Section>
      )}
    </PageShell>
  )
}
