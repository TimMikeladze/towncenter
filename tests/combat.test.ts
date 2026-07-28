import { describe, expect, test } from "bun:test"
import { damagePerHit, deriveCounters, matchupScore, resourceCost } from "../src/lib/game/combat"
import type { Unit, UnitType } from "../src/lib/types"

function unit(overrides: {
  id: string
  name: string
  type?: UnitType
  hp: number
  meleeArmor?: number
  pierceArmor?: number
  armorClasses?: { id: number; amount: number }[]
  attacks: { classId: number; bonus: number }[]
  reload?: number
  accuracy?: number
  range?: number
  speed?: number
  cost?: { food?: number; wood?: number; gold?: number }
}): Unit {
  return {
    id: overrides.id,
    name: overrides.name,
    type: overrides.type ?? "Infantry",
    age: "Feudal",
    cost: overrides.cost ?? { food: 50 },
    stats: {
      hp: overrides.hp,
      attack: overrides.attacks[0]?.bonus ?? 0,
      attackType: "Melee",
      meleeArmor: overrides.meleeArmor ?? 0,
      pierceArmor: overrides.pierceArmor ?? 0,
      armorClasses: (overrides.armorClasses ?? []).map((armour) => ({
        id: armour.id,
        name: `class-${armour.id}`,
        amount: armour.amount,
      })),
      attackBonuses: overrides.attacks.map((attack) => ({
        classId: attack.classId,
        class: `class-${attack.classId}`,
        bonus: attack.bonus,
      })),
      range: overrides.range,
      attackSpeed: overrides.reload ?? 2,
      movementSpeed: overrides.speed ?? 1,
      lineOfSight: 4,
      trainingTime: 20,
      accuracy: overrides.accuracy ?? 100,
      attackDelay: 0,
      blastWidth: 0,
      garrisonCapacity: 0,
    },
    description: "",
    effects: [],
    counters: [],
    goodAgainst: [],
    upgrades: [],
  }
}

const knight = unit({
  id: "knight",
  name: "Knight",
  type: "Cavalry",
  hp: 100,
  meleeArmor: 2,
  pierceArmor: 2,
  armorClasses: [{ id: 8, amount: 0 }],
  attacks: [{ classId: 4, bonus: 10 }],
  cost: { food: 60, gold: 75 },
})

const pikeman = unit({
  id: "pikeman",
  name: "Pikeman",
  hp: 55,
  meleeArmor: 0,
  pierceArmor: 0,
  armorClasses: [{ id: 1, amount: 0 }],
  attacks: [
    { classId: 4, bonus: 4 },
    { classId: 8, bonus: 22 },
  ],
  cost: { food: 35, wood: 25 },
})

describe("damagePerHit", () => {
  test("subtracts the matching armour class", () => {
    // 10 melee - 0 melee armour = 10
    expect(damagePerHit(knight, pikeman)).toBe(10)
  })

  test("adds the bonus damage of a matching class", () => {
    // (4 melee - 2 armour) + (22 vs cavalry - 0) = 24
    expect(damagePerHit(pikeman, knight)).toBe(24)
  })

  test("never drops below one", () => {
    const tank = unit({ id: "tank", name: "Tank", hp: 100, meleeArmor: 99, attacks: [{ classId: 4, bonus: 1 }] })
    expect(damagePerHit(knight, tank)).toBe(1)
  })

  test("ignores attack classes the defender does not carry", () => {
    const noCavalryArmour = unit({ id: "x", name: "X", hp: 50, attacks: [{ classId: 4, bonus: 5 }] })
    expect(damagePerHit(pikeman, noCavalryArmour)).toBe(4)
  })
})

describe("matchupScore", () => {
  test("favours the anti-cavalry unit against cavalry", () => {
    const score = matchupScore(pikeman, knight)
    expect(score).not.toBeNull()
    expect(score as number).toBeGreaterThan(1)
  })

  test("is the inverse view from the other side", () => {
    expect(matchupScore(knight, pikeman) as number).toBeLessThan(1)
  })
})

describe("deriveCounters", () => {
  test("puts each unit on the right side of the other's lists", () => {
    const counters = deriveCounters([knight, pikeman])
    expect(counters.get("pikeman")?.goodAgainst).toContain("knight")
    expect(counters.get("knight")?.counters).toContain("pikeman")
  })

  test("never lists ships against land units", () => {
    const galley = unit({
      id: "galley",
      name: "Galley",
      type: "Naval",
      hp: 120,
      attacks: [{ classId: 3, bonus: 6 }],
    })
    const counters = deriveCounters([knight, pikeman, galley])
    expect(counters.get("galley")?.goodAgainst).not.toContain("pikeman")
    expect(counters.get("pikeman")?.counters).not.toContain("galley")
  })
})

describe("resourceCost", () => {
  test("weights gold above food and wood", () => {
    expect(resourceCost(knight)).toBe(60 + 75 * 1.5)
  })
})
