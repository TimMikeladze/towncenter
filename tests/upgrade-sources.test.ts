import { describe, expect, test } from "bun:test"
import { queryRows } from "../src/lib/db/connection"
import { getAllTechnologies } from "../src/lib/db/queries/technologies"
import { ageFromId } from "../src/lib/game/classes"
import { BUILDING_UPGRADE_TECHS, UPGRADE_TECHS } from "../src/lib/game/upgrades"
import type { Age, UnitCost } from "../src/lib/types"

/**
 * `UPGRADE_TECHS` and `BUILDING_UPGRADE_TECHS` are hand-written tables. Every
 * field the export also carries — name, age, cost, research time — is checked
 * against the export here, so a transcription slip or an upstream balance
 * change fails the build instead of silently showing a wrong number.
 *
 * The stat deltas themselves are the only values the export cannot confirm;
 * they come from the effect commands in the game's own data file.
 */

const techs = await getAllTechnologies()
const byId = new Map(techs.map((tech) => [tech.id, tech]))

/**
 * `Technology.age` is the earliest age any civ can research the tech, which a
 * single civ bonus can pull down — Bohemians get Chemistry in the Castle Age,
 * Jurchens get Siege Engineers there. The generic tech tree placement the model
 * uses is the age most civs research it in, so compare against that.
 */
const ageRows = await queryRows<{ tech_id: number; age: number; civs: number }>(
  "SELECT tech_id, age, COUNT(*) AS civs FROM civ_techs GROUP BY tech_id, age",
)
const commonAge = new Map<number, Age>()
const bestCount = new Map<number, number>()
const availableAges = new Map<number, Set<Age>>()
for (const row of ageRows) {
  const age = ageFromId(row.age)
  if (!availableAges.has(row.tech_id)) availableAges.set(row.tech_id, new Set())
  availableAges.get(row.tech_id)?.add(age)
  if (Number(row.civs) > (bestCount.get(row.tech_id) ?? 0)) {
    bestCount.set(row.tech_id, Number(row.civs))
    commonAge.set(row.tech_id, age)
  }
}

const normalise = (cost: UnitCost) => ({
  food: cost.food ?? 0,
  wood: cost.wood ?? 0,
  gold: cost.gold ?? 0,
  stone: cost.stone ?? 0,
})

const ALL = [
  ...UPGRADE_TECHS.map((tech) => ({ kind: "unit", ...tech })),
  ...BUILDING_UPGRADE_TECHS.map((tech) => ({ kind: "building", ...tech })),
]

describe("modelled upgrades match the export", () => {
  test("every modelled tech id exists in the game data", () => {
    const missing = ALL.filter((tech) => !byId.has(String(tech.id)))
    expect(missing.map((tech) => `${tech.id} ${tech.name}`)).toEqual([])
  })

  test("no tech is modelled twice", () => {
    const ids = ALL.map((tech) => tech.id)
    expect(ids.length).toBe(new Set(ids).size)
  })

  for (const tech of ALL) {
    test(`${tech.name} (${tech.id}) matches the export`, () => {
      const real = byId.get(String(tech.id))
      if (!real) throw new Error(`tech ${tech.id} missing from export`)
      expect(real.name).toBe(tech.name)
      expect(real.researchTime).toBe(tech.researchTime)
      expect(normalise(tech.cost)).toEqual(normalise(real.cost))
      // The age most civs get it in, and one the game actually offers it in.
      expect(commonAge.get(tech.id)).toBe(tech.age)
      expect([...(availableAges.get(tech.id) ?? [])]).toContain(tech.age)
    })
  }
})
