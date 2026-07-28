import { getAllUnits } from "@/lib/data"
import { BASE_MELEE_CLASS, BASE_PIERCE_CLASS } from "@/lib/game/classes"
import { costEfficiency, resourceCost } from "@/lib/game/combat"
import { CompareClient, type CompareUnit } from "./compare-client"

const MAX_UNITS = 4

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ units?: string }> }) {
  const params = await searchParams
  const allUnits = await getAllUnits()

  const requested = (params.units ?? "").split(",").filter(Boolean).slice(0, MAX_UNITS)
  const selected = requested
    .map((id) => allUnits.find((unit) => unit.id === id))
    .filter((unit) => !!unit)
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
      cost: Math.round(resourceCost(unit)),
      costBreakdown: unit.cost,
      efficiency: Number(costEfficiency(unit).toFixed(2)),
      bonuses: unit.stats.attackBonuses
        .filter((bonus) => bonus.classId !== BASE_MELEE_CLASS && bonus.classId !== BASE_PIERCE_CLASS && bonus.bonus > 0)
        .map((bonus) => `${bonus.class} +${bonus.bonus}`),
    }))

  return (
    <CompareClient
      units={allUnits.map((unit) => ({ id: unit.id, name: unit.name, type: unit.type }))}
      selected={selected}
      maxUnits={MAX_UNITS}
    />
  )
}
