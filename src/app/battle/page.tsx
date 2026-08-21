import type { Metadata } from "next"
import { getAllCivilizations, getAllUnits } from "@/lib/data"
import { getCivUpgradeAvailability } from "@/lib/db/queries/civ-upgrades"
import { pageMetadata } from "@/lib/seo"
import type { Unit } from "@/lib/types"
import { BattleClient, type BattleUnit } from "./battle-client"

export const metadata: Metadata = pageMetadata({
  title: "AoE2 battle simulator — resolve any fight",
  description:
    "Resolve any Age of Empires II: Definitive Edition fight: pick two units, set the counts, civilizations and upgrades, and see who wins, how long it takes and what the trade costs.",
  path: "/battle",
  eyebrow: "Battle simulator",
  imageSubtitle: "Pick two units, set counts and upgrades, see who wins and what it costs.",
})

/** Combat maths only needs stats and cost, so the client payload drops the prose. */
function toBattleUnit(unit: Unit): BattleUnit {
  return {
    id: unit.id,
    name: unit.name,
    type: unit.type,
    age: unit.age,
    cost: unit.cost,
    stats: unit.stats,
    image_path: unit.image_path ?? null,
    civSpecific: unit.civSpecific,
    description: "",
    effects: [],
    counters: [],
    goodAgainst: [],
    upgrades: [],
  }
}

export default async function BattlePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const [units, civs, civUpgrades] = await Promise.all([
    getAllUnits(),
    getAllCivilizations(),
    getCivUpgradeAvailability(),
  ])

  // Everything that can hold a weapon, plus villagers — raiding maths matters.
  const pool = units.filter((unit) => unit.stats.attackSpeed > 0 || unit.type === "Economy")

  const inPool = new Set(pool.map((unit) => unit.id))
  const civUnitIds: Record<string, string> = {}
  for (const unit of pool) {
    for (const civ of unit.availableToCivs ?? []) {
      civUnitIds[civ] = civUnitIds[civ] ? `${civUnitIds[civ]},${unit.id}` : unit.id
    }
  }

  const fallbackA = pool.find((unit) => unit.name === "Knight") ?? pool[0]
  const fallbackB = pool.find((unit) => unit.name === "Pikeman") ?? pool[1] ?? pool[0]
  const resolve = (id: string | undefined, fallback: Unit) => (id && inPool.has(id) ? id : fallback.id)

  return (
    <BattleClient
      units={pool.map(toBattleUnit)}
      civs={civs.map((civ) => ({ id: civ.id, name: civ.name }))}
      civUpgrades={civUpgrades}
      civUnitIds={civUnitIds}
      initial={{
        a: resolve(params.a, fallbackA),
        b: resolve(params.b, fallbackB),
        countA: Number(params.na) || 10,
        countB: Number(params.nb) || 10,
        age: params.age ?? "Imperial",
        civA: params.civA ?? "",
        civB: params.civB ?? "",
      }}
    />
  )
}
