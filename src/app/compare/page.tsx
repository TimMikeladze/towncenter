import type { Metadata } from "next"
import { getAllUnits } from "@/lib/data"
import { BASE_MELEE_CLASS, BASE_PIERCE_CLASS } from "@/lib/game/classes"
import { costEfficiency, resourceCost } from "@/lib/game/combat"
import { applyUpgrades, resolveUpgrades } from "@/lib/game/upgrades"
import { pageMetadata } from "@/lib/seo"
import type { Age } from "@/lib/types"
import { CompareClient, type CompareUnit } from "./compare-client"

const MAX_UNITS = 4
const AGES: Age[] = ["Feudal", "Castle", "Imperial"]

export const metadata: Metadata = pageMetadata({
  title: "Compare AoE2 units side by side",
  description:
    "Put up to four Age of Empires II: Definitive Edition units next to each other — hit points, attack, armor, range, speed, cost and cost efficiency, at any age with upgrades applied.",
  path: "/compare",
  eyebrow: "Compare",
  imageSubtitle: "Up to four units, every stat, with age upgrades applied.",
})

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ units?: string; age?: string }>
}) {
  const params = await searchParams
  const allUnits = await getAllUnits()

  const age = AGES.find((entry) => entry === params.age)
  // With an age selected, every unit is shown as its fully upgraded self so
  // the comparison is between what you would actually field.
  const withUpgrades = (unit: (typeof allUnits)[number]) =>
    age ? applyUpgrades(unit, resolveUpgrades(unit, age).applied) : unit

  const requested = (params.units ?? "").split(",").filter(Boolean).slice(0, MAX_UNITS)
  const selected = requested
    .map((id) => allUnits.find((unit) => unit.id === id))
    .filter((unit) => !!unit)
    .map(withUpgrades)
    .map<CompareUnit>((unit) => ({
      id: unit.id,
      name: unit.name,
      type: unit.type,
      age: unit.age,
      image_path: unit.image_path ?? null,
      hp: unit.stats.hp,
      attack: unit.stats.attack,
      attackType: unit.stats.attackType,
      meleeArmor: unit.stats.meleeArmor,
      pierceArmor: unit.stats.pierceArmor,
      range: unit.stats.range ?? 0,
      attackSpeed: unit.stats.attackSpeed,
      movementSpeed: unit.stats.movementSpeed,
      lineOfSight: unit.stats.lineOfSight,
      trainingTime: unit.stats.trainingTime,
      accuracy: unit.stats.accuracy,
      blastWidth: unit.stats.blastWidth,
      cost: Math.round(resourceCost(unit)),
      costBreakdown: unit.cost,
      efficiency: Number(costEfficiency(unit).toFixed(2)),
      bonuses: unit.stats.attackBonuses
        .filter((bonus) => bonus.classId !== BASE_MELEE_CLASS && bonus.classId !== BASE_PIERCE_CLASS && bonus.bonus > 0)
        .map((bonus) => `${bonus.class} +${bonus.bonus}`),
    }))

  return (
    <CompareClient
      units={allUnits.map((unit) => ({
        id: unit.id,
        name: unit.name,
        type: unit.type,
        image_path: unit.image_path ?? null,
      }))}
      selected={selected}
      maxUnits={MAX_UNITS}
      age={age ?? "none"}
    />
  )
}
