import { describe, expect, test } from "bun:test"
import { getAllUnits } from "../src/lib/db/queries/units"
import { applyUpgrades, resolveUpgrades, upgradeGroups, upgradesForUnit } from "../src/lib/game/upgrades"
import type { Unit } from "../src/lib/types"

const units = await getAllUnits()
const byName = (name: string): Unit => {
  const unit = units.find((entry) => entry.name === name)
  if (!unit) throw new Error(`missing unit fixture: ${name}`)
  return unit
}

const knight = byName("Knight")
const archer = byName("Archer")
const monk = byName("Monk")
const handCannoneer = byName("Hand Cannoneer")
const mangonel = byName("Mangonel")

function fullyUpgraded(unit: Unit): Unit {
  return applyUpgrades(unit, resolveUpgrades(unit, "Imperial").applied)
}

describe("upgradeGroups", () => {
  test("routes units by armour class, not by name", () => {
    expect([...upgradeGroups(knight)]).toContain("cavalry_armour")
    expect([...upgradeGroups(knight)]).toContain("melee_attack")
    expect([...upgradeGroups(archer)]).toContain("archer_attack")
    expect([...upgradeGroups(mangonel)]).toContain("siege")
  })

  test("gunpowder units take archer armour but not the fletching line", () => {
    const groups = upgradeGroups(handCannoneer)
    expect(groups.has("archer_armour")).toBe(true)
    expect(groups.has("archer_attack")).toBe(false)
    expect(groups.has("gunpowder")).toBe(true)
  })

  test("monks are outside every blacksmith line", () => {
    expect(upgradesForUnit(monk)).toEqual([])
  })
})

describe("applyUpgrades", () => {
  test("a fully upgraded Knight gains +4 attack and +3/+4 armour", () => {
    const upgraded = fullyUpgraded(knight)
    expect(upgraded.stats.attack).toBe(knight.stats.attack + 4)
    expect(upgraded.stats.meleeArmor).toBe(knight.stats.meleeArmor + 3)
    expect(upgraded.stats.pierceArmor).toBe(knight.stats.pierceArmor + 4)
  })

  test("a fully upgraded Archer gains +4 attack (fletching line plus Chemistry) and +3 range", () => {
    const upgraded = fullyUpgraded(archer)
    expect(upgraded.stats.attack).toBe(archer.stats.attack + 4)
    expect(upgraded.stats.range).toBe((archer.stats.range ?? 0) + 3)
  })

  test("the extra damage lands on the base damage class, so bonus damage is untouched", () => {
    const upgraded = fullyUpgraded(knight)
    const base = upgraded.stats.attackBonuses.find((bonus) => bonus.classId === 4)
    expect(base?.bonus).toBe((knight.stats.attackBonuses.find((b) => b.classId === 4)?.bonus ?? 0) + 4)
  })

  test("Husbandry speeds cavalry up by a tenth", () => {
    expect(fullyUpgraded(knight).stats.movementSpeed).toBeCloseTo(knight.stats.movementSpeed * 1.1, 3)
  })

  test("Chemistry is the only attack upgrade a Hand Cannoneer gets", () => {
    expect(fullyUpgraded(handCannoneer).stats.attack).toBe(handCannoneer.stats.attack + 1)
  })

  test("monks stay exactly as the game files describe them", () => {
    expect(fullyUpgraded(monk).stats).toEqual(monk.stats)
  })
})

describe("resolveUpgrades", () => {
  test("stops at the selected age", () => {
    const feudal = resolveUpgrades(knight, "Feudal").applied.map((tech) => tech.name)
    expect(feudal).toContain("Forging")
    expect(feudal).not.toContain("Blast Furnace")
  })

  test("reports what a civilization cannot research", () => {
    // Goths famously miss Plate Mail Armor; pass an empty set for the extreme case.
    const { applied, missing } = resolveUpgrades(knight, "Imperial", new Set([67]))
    expect(applied.map((tech) => tech.id)).toEqual([67])
    expect(missing.length).toBeGreaterThan(0)
  })
})
