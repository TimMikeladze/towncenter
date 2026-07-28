import { Castle, Network, Scroll, Swords, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AgeBadge, Chip } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { DetailHero } from "@/components/game/detail-hero"
import { EntityIcon } from "@/components/game/entity-icon"
import { StatTile } from "@/components/game/stats"
import { BackLink, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"
import { getAllTechnologies, getAllUnits, getCivilizationById } from "@/lib/data"

const MISSING_PREVIEW = 12

const BONUS_TONE: Record<string, string> = {
  military: "var(--type-infantry)",
  economic: "var(--type-archer)",
  defensive: "var(--type-siege)",
  team: "var(--type-monk)",
}

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
  const bonuses = civ.bonuses.filter((bonus) => bonus.category !== "team")

  return (
    <PageShell width="default">
      <BackLink href="/civilizations" label="All civilizations" />

      <DetailHero
        name={civ.name}
        image={civ.image_path}
        meta={civ.types.map((type) => (
          <Chip key={type} tone="var(--primary)">
            {type}
          </Chip>
        ))}
        description={bonuses[0]?.description}
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href={`/tech-tree?civ=${civ.id}`}>
                <Network className="h-3.5 w-3.5" />
                Tech tree
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/civilizations/compare?a=${civ.id}`}>Compare civs</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/competitive?civ=${civ.id}`}>Matchups</Link>
            </Button>
          </>
        }
        stats={
          <>
            <StatTile label="Bonuses" value={bonuses.length} icon={Castle} />
            <StatTile label="Unique units" value={uniqueUnits.length} icon={Swords} />
            <StatTile label="Unique techs" value={uniqueTechs.length} icon={Scroll} />
            <StatTile label="Tech gaps" value={missingUnits.length + missingTechs.length} icon={Users} />
          </>
        }
      />

      <Section title="Civilization bonuses" description="Straight from the in-game civilization description">
        <Panel className="space-y-3">
          {bonuses.map((bonus) => (
            <div key={bonus.id} className="flex items-start gap-2.5">
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: BONUS_TONE[bonus.category] ?? "var(--muted-foreground)" }}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm">{bonus.description}</p>
                <p className="label-caps mt-0.5">{bonus.category}</p>
              </div>
            </div>
          ))}
        </Panel>
      </Section>

      {civ.teamBonus && (
        <Section title="Team bonus">
          <Panel>
            <p className="text-sm">{civ.teamBonus}</p>
          </Panel>
        </Section>
      )}

      {uniqueUnits.length > 0 && (
        <Section title="Unique units" description={`Trained only by ${civ.name}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            {uniqueUnits.map((unit) => (
              <Link key={unit.id} href={`/units/${unit.id}`} className="panel panel-interactive block p-3.5">
                <div className="flex items-center gap-2.5">
                  <EntityIcon src={unit.image_path} alt="" size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-display font-semibold">{unit.name}</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <Chip tone="var(--type-unique)">{unit.type}</Chip>
                      <AgeBadge age={unit.age} />
                    </div>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-muted-foreground">{unit.description}</p>
                <p className="tabular mt-2 font-mono text-[11px] text-muted-foreground">
                  {unit.stats.hp} HP · {unit.stats.attack} atk · {unit.stats.meleeArmor}/{unit.stats.pierceArmor} armor
                </p>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {uniqueTechs.length > 0 && (
        <Section title="Unique technologies" description="Researched at the Castle">
          <div className="grid gap-3 sm:grid-cols-2">
            {uniqueTechs.map((tech, index) => (
              <Link key={tech.id} href={`/technologies/${tech.id}`} className="panel panel-interactive block p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-display font-semibold">{tech.name}</p>
                  <AgeBadge age={tech.age} />
                </div>
                <p className="mt-1.5 line-clamp-3 text-[13px] leading-snug text-muted-foreground">
                  {tech.description || civ.uniqueTechDescriptions[index] || ""}
                </p>
                <div className="mt-2">
                  <CostChips cost={tech.cost} />
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section
        title="Tech tree gaps"
        description={`${missingUnits.length} units and ${missingTechs.length} technologies other civs have`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Panel className="space-y-2">
            <p className="label-caps">Missing units</p>
            {missingUnits.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {missingUnits.slice(0, MISSING_PREVIEW).map((unit) => (
                  <Chip key={unit.id} className="line-through">
                    {unit.name}
                  </Chip>
                ))}
                {missingUnits.length > MISSING_PREVIEW && (
                  <span className="text-xs text-muted-foreground">+{missingUnits.length - MISSING_PREVIEW} more</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All shared units available.</p>
            )}
          </Panel>

          <Panel className="space-y-2">
            <p className="label-caps">Missing technologies</p>
            {missingTechs.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {missingTechs.slice(0, MISSING_PREVIEW).map((tech) => (
                  <Chip key={tech.id} className="line-through">
                    {tech.name}
                  </Chip>
                ))}
                {missingTechs.length > MISSING_PREVIEW && (
                  <span className="text-xs text-muted-foreground">+{missingTechs.length - MISSING_PREVIEW} more</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All shared technologies available.</p>
            )}
          </Panel>
        </div>
      </Section>
    </PageShell>
  )
}
