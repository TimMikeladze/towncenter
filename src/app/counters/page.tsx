import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllUnits } from "@/lib/data"
import { damagePerHit, damagePerSecond, hitsToKill, resourceCost, timeToKill } from "@/lib/game/combat"
import { pageMetadata } from "@/lib/seo"
import type { Unit } from "@/lib/types"
import { CountersClient } from "./counters-client"

function matchupRow(subject: Unit, other: Unit) {
  return {
    id: other.id,
    name: other.name,
    type: other.type,
    age: other.age,
    image_path: other.image_path ?? null,
    description: other.description,
    hp: other.stats.hp,
    attack: other.stats.attack,
    cost: Math.round(resourceCost(other)),
    damageDealt: damagePerHit(subject, other),
    damageTaken: damagePerHit(other, subject),
    dpsDealt: Number(damagePerSecond(subject, other).toFixed(2)),
    dpsTaken: Number(damagePerSecond(other, subject).toFixed(2)),
    hitsToKill: hitsToKill(subject, other),
    hitsToDie: hitsToKill(other, subject),
    timeToKill: Number(timeToKill(subject, other).toFixed(1)),
  }
}

export const metadata: Metadata = pageMetadata({
  title: "AoE2 counters — what beats what",
  description:
    "Counter tables for every Age of Empires II: Definitive Edition unit, computed from attack bonuses, armor classes, rate of fire and resource cost — with the damage numbers behind each matchup.",
  path: "/counters",
  eyebrow: "Counters",
  imageSubtitle: "Damage per hit, time to kill and cost traded, for every matchup.",
})

export default async function CountersPage({ searchParams }: { searchParams: Promise<{ unit?: string }> }) {
  const params = await searchParams
  const allUnits = await getAllUnits()

  const selectable = allUnits.filter((unit) => unit.type !== "Economy")
  if (selectable.length === 0) notFound()

  const unit = selectable.find((entry) => entry.id === params.unit) ?? selectable[0]
  const byId = new Map(allUnits.map((entry) => [entry.id, entry]))
  const resolve = (ids: string[]) =>
    ids
      .map((id) => byId.get(id))
      .filter((entry): entry is Unit => !!entry)
      .map((entry) => matchupRow(unit, entry))

  return (
    <CountersClient
      units={selectable.map((entry) => ({ id: entry.id, name: entry.name, type: entry.type }))}
      unit={{
        id: unit.id,
        name: unit.name,
        type: unit.type,
        age: unit.age,
        description: unit.description,
        image_path: unit.image_path ?? null,
        hp: unit.stats.hp,
        attack: unit.stats.attack,
        meleeArmor: unit.stats.meleeArmor,
        pierceArmor: unit.stats.pierceArmor,
        range: unit.stats.range ?? null,
        movementSpeed: unit.stats.movementSpeed,
        cost: Math.round(resourceCost(unit)),
      }}
      goodAgainst={resolve(unit.goodAgainst)}
      counteredBy={resolve(unit.counters)}
    />
  )
}
