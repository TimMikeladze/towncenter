import { describe, expect, test } from "bun:test"
import { getAllUnits } from "../src/lib/db/queries/units"
import { breakEvenCount, simulateBattle } from "../src/lib/game/battle"
import type { Unit } from "../src/lib/types"

const units = await getAllUnits()
const byName = (name: string): Unit => {
  const unit = units.find((entry) => entry.name === name)
  if (!unit) throw new Error(`missing unit fixture: ${name}`)
  return unit
}

const knight = byName("Knight")
const pikeman = byName("Pikeman")
const archer = byName("Archer")
const villager = byName("Villager")

describe("simulateBattle", () => {
  test("one knight beats one pikeman, the way it does in game", () => {
    // Pikemen counter knights on cost, not head to head: the knight kills in
    // ~6 swings at 1.8s, the pikeman needs ~5 at 3s.
    expect(simulateBattle({ unit: knight, count: 1 }, { unit: pikeman, count: 1 }).winner).toBe("a")
  })

  test("pikemen win once both sides spend the same resources", () => {
    const result = simulateBattle({ unit: pikeman, count: 20 }, { unit: knight, count: 10 })
    expect(result.winner).toBe("a")
    expect(result.b.survivors).toBe(0)
  })

  test("cavalry runs over the same pikemen once it outnumbers them enough", () => {
    expect(simulateBattle({ unit: knight, count: 30 }, { unit: pikeman, count: 10 }).winner).toBe("a")
  })

  test("the fight ends in bounded time and records a timeline", () => {
    const result = simulateBattle({ unit: knight, count: 5 }, { unit: pikeman, count: 5 })
    expect(result.elapsed).toBeGreaterThan(0)
    expect(result.elapsed).toBeLessThan(600)
    expect(result.timeline.length).toBeGreaterThan(1)
    expect(result.timeline[0]).toEqual({ time: 0, a: 5, b: 5 })
  })

  test("archers get free shots on units that have to close the gap", () => {
    const result = simulateBattle({ unit: archer, count: 10 }, { unit: knight, count: 10 })
    expect(result.a.freeFireTime).toBeGreaterThan(0)
    expect(result.b.freeFireTime).toBe(0)
  })

  test("free fire can be turned off", () => {
    const result = simulateBattle({ unit: archer, count: 10 }, { unit: knight, count: 10 }, { allowFreeFire: false })
    expect(result.a.freeFireTime).toBe(0)
  })

  test("a side that cannot fight back is simply wiped out", () => {
    const result = simulateBattle({ unit: knight, count: 1 }, { unit: villager, count: 3 })
    expect(result.winner).toBe("a")
    expect(result.a.losses).toBeGreaterThanOrEqual(0)
    expect(result.b.survivors).toBe(0)
  })

  test("losses are priced in the units' own resources", () => {
    const result = simulateBattle({ unit: pikeman, count: 10 }, { unit: knight, count: 10 })
    expect(result.b.resourcesLost.gold).toBe((knight.cost.gold ?? 0) * result.b.losses)
  })
})

describe("breakEvenCount", () => {
  test("finds the largest enemy stack the attacker still beats", () => {
    const limit = breakEvenCount({ unit: knight, count: 10 }, pikeman)
    expect(limit).not.toBeNull()
    const win = simulateBattle({ unit: knight, count: 10 }, { unit: pikeman, count: limit as number })
    const loss = simulateBattle({ unit: knight, count: 10 }, { unit: pikeman, count: (limit as number) + 1 })
    expect(win.winner).toBe("a")
    expect(loss.winner).not.toBe("a")
  })
})
