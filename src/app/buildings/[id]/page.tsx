import { Clock, Eye, Shield, Swords, Users } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AgeBadge, Chip } from "@/components/game/badges"
import { CostChips } from "@/components/game/cost"
import { DetailHero } from "@/components/game/detail-hero"
import { StatRow, StatTile } from "@/components/game/stats"
import { BackLink, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { Button } from "@/components/ui/button"
import { getAllBuildings, getAllTechnologies, getAllUnits, getBuildingById } from "@/lib/data"
import { BASE_MELEE_CLASS, BASE_PIERCE_CLASS } from "@/lib/game/classes"
import { entityIdFromParam } from "@/lib/game/ids"
import { upgradeCost, upgradesForBuilding } from "@/lib/game/upgrades"
import { buildingHref, entityParams, technologyHref, unitHref } from "@/lib/hrefs"
import { breadcrumbList, entityThing, pageMetadata } from "@/lib/seo"
import { buildingSeo } from "@/lib/seo/entities"

export const dynamicParams = false

export async function generateStaticParams() {
  const buildings = await getAllBuildings()
  return buildings.flatMap(entityParams)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const building = await getBuildingById(entityIdFromParam(id))
  if (!building) return { title: "Building not found" }

  const seo = buildingSeo(building)
  return pageMetadata({
    title: seo.title,
    description: seo.description,
    path: buildingHref(building),
    imageTitle: building.name,
    eyebrow: seo.eyebrow,
    imageSubtitle: seo.cardSubtitle,
  })
}

export default async function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const building = await getBuildingById(entityIdFromParam(id))

  if (!building) {
    notFound()
  }

  // `trainsUnits` and `researchesTechs` are the game's numeric ids. Resolved to
  // names they become readable chips and link text that says what it points at.
  const [allUnits, allTechs] = await Promise.all([getAllUnits(), getAllTechnologies()])
  const trains = (building.trainsUnits ?? [])
    .map((unitId) => allUnits.find((unit) => unit.id === unitId))
    .filter((unit) => !!unit)
  const researches = (building.researchesTechs ?? [])
    .map((techId) => allTechs.find((tech) => tech.id === techId))
    .filter((tech) => !!tech)

  // The base classes only carry the building's own damage; the rest are bonuses.
  const attackBonuses = building.attackBonuses.filter(
    (bonus) => bonus.classId !== BASE_MELEE_CLASS && bonus.classId !== BASE_PIERCE_CLASS && bonus.bonus !== 0,
  )
  const armorClasses = building.armorClasses.filter(
    (armour) => armour.id !== BASE_MELEE_CLASS && armour.id !== BASE_PIERCE_CLASS,
  )
  const buildingUpgrades = upgradesForBuilding(building)

  const seo = buildingSeo(building)

  return (
    <PageShell width="default">
      <JsonLd
        data={[
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Buildings", path: "/buildings" },
            { name: building.name, path: buildingHref(building) },
          ]),
          entityThing({
            name: building.name,
            description: building.description || seo.description,
            path: buildingHref(building),
            image: building.image_path,
            category: "Building",
            properties: seo.properties,
          }),
        ]}
      />
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
            {building.attack > 0 ? (
              <StatTile
                label="Attack"
                value={building.attack}
                hint={building.range ? `range ${building.range}` : undefined}
                icon={Swords}
              />
            ) : (
              <StatTile label="Line of sight" value={building.lineOfSight} icon={Eye} />
            )}
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
              {building.attack > 0 ? (
                <>
                  <StatRow label={`Attack (${building.attackType})`} value={building.attack} />
                  {building.range ? <StatRow label="Range" value={building.range} /> : null}
                  {building.minRange ? <StatRow label="Minimum range" value={building.minRange} /> : null}
                  {building.attackSpeed > 0 ? (
                    <StatRow label="Attack speed" value={`${building.attackSpeed}s`} />
                  ) : null}
                  {building.accuracy < 100 ? <StatRow label="Accuracy" value={`${building.accuracy}%`} /> : null}
                </>
              ) : null}
            </div>
            {armorClasses.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t pt-3">
                <p className="label-caps">Armor classes</p>
                <div className="flex flex-wrap gap-1">
                  {armorClasses.map((armour) => (
                    <Chip key={armour.id}>
                      {armour.name}
                      {armour.amount !== 0 && ` ${armour.amount > 0 ? "+" : ""}${armour.amount}`}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </Section>
      </div>

      {attackBonuses.length > 0 && (
        <Section title="Attack bonuses" description="Extra damage against specific armor classes">
          <Panel>
            <div className="grid gap-x-6 sm:grid-cols-2">
              {attackBonuses.map((bonus) => (
                <StatRow
                  key={bonus.classId}
                  label={`vs ${bonus.class}`}
                  value={`${bonus.bonus > 0 ? "+" : ""}${bonus.bonus}`}
                />
              ))}
            </div>
          </Panel>
        </Section>
      )}

      {buildingUpgrades.length > 0 && (
        <Section
          title="Upgrades that reach it"
          description="University, town centre and castle research that changes this building's numbers."
        >
          <Panel className="space-y-2">
            <div className="divide-y">
              {buildingUpgrades.map((tech) => {
                const parts = [
                  tech.deltas.hp && `hit points ×${tech.deltas.hp}`,
                  tech.deltas.attack && `+${tech.deltas.attack} attack`,
                  tech.deltas.meleeArmor && `+${tech.deltas.meleeArmor} melee armor`,
                  tech.deltas.pierceArmor && `+${tech.deltas.pierceArmor} pierce armor`,
                  tech.deltas.lineOfSight && `+${tech.deltas.lineOfSight} line of sight`,
                  tech.deltas.minRange === 0 && "no minimum range",
                  tech.note,
                ].filter(Boolean)
                return (
                  <StatRow
                    key={tech.id}
                    label={
                      <Link
                        href={technologyHref({ id: String(tech.id), name: tech.name })}
                        className="underline underline-offset-2"
                      >
                        {tech.name}
                      </Link>
                    }
                    value={<span className="text-muted-foreground">{parts.join(" · ")}</span>}
                  />
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
              <p className="label-caps">Total bill</p>
              <CostChips cost={upgradeCost(buildingUpgrades)} />
            </div>
          </Panel>
        </Section>
      )}

      {trains.length > 0 && (
        <Section title="Trains units" description={`Every unit produced at the ${building.name}`}>
          <div className="flex flex-wrap gap-2">
            {trains.map((unit) => (
              <Button key={unit.id} asChild size="sm" variant="outline">
                <Link href={unitHref(unit)}>{unit.name}</Link>
              </Button>
            ))}
          </div>
        </Section>
      )}

      {researches.length > 0 && (
        <Section title="Researches technologies" description={`Every upgrade researched at the ${building.name}`}>
          <div className="flex flex-wrap gap-2">
            {researches.map((tech) => (
              <Button key={tech.id} asChild size="sm" variant="outline">
                <Link href={technologyHref(tech)}>{tech.name}</Link>
              </Button>
            ))}
          </div>
        </Section>
      )}
    </PageShell>
  )
}
