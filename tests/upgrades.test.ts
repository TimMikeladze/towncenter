import { describe, expect, test } from "bun:test"
import { getAllUnits } from "../src/lib/db/queries/units"
import {
  applyUpgrades,
  resolveUpgrades,
  type UpgradeTech,
  upgradeGroups,
  upgradesForUnit,
  upgradeTech,
} from "../src/lib/game/upgrades"
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
const champion = byName("Champion")
const spearman = byName("Spearman")
const villager = byName("Villager")
const cavalryArcher = byName("Cavalry Archer")
const galley = byName("Galley")

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

  test("monks are outside every blacksmith line, but get the monastery one", () => {
    const groups = upgradeGroups(monk)
    expect(groups.has("monk")).toBe(true)
    expect(groups.has("melee_attack")).toBe(false)
    expect(groups.has("infantry_armour")).toBe(false)
    expect(
      upgradesForUnit(monk)
        .map((tech) => tech.name)
        .sort(),
    ).toEqual(["Block Printing", "Fervor", "Illumination", "Sanctity"])
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

  test("the monastery line lands on monks: Sanctity, Fervor and Block Printing", () => {
    const upgraded = fullyUpgraded(monk)
    expect(upgraded.stats.hp).toBe(monk.stats.hp + 15)
    expect(upgraded.stats.movementSpeed).toBeCloseTo(monk.stats.movementSpeed * 1.15, 3)
    expect(upgraded.stats.range).toBe((monk.stats.range ?? 0) + 3)
    expect(upgraded.stats.lineOfSight).toBe(monk.stats.lineOfSight + 3)
    // No blacksmith attack or armour reaches a monk.
    expect(upgraded.stats.attack).toBe(monk.stats.attack)
    expect(upgraded.stats.meleeArmor).toBe(monk.stats.meleeArmor)
    expect(upgraded.stats.pierceArmor).toBe(monk.stats.pierceArmor)
  })
})

describe("techs the engine targets by unit id", () => {
  test("Gambesons reaches the militia line and nothing else", () => {
    const names = (unit: Unit) => upgradesForUnit(unit).map((tech) => tech.name)
    expect(names(champion)).toContain("Gambesons")
    // Spearmen carry the same infantry armour class but are not militia line.
    expect(names(spearman)).not.toContain("Gambesons")
    expect(applyUpgrades(champion, [upgradeTech(875) as UpgradeTech]).stats.pierceArmor).toBe(
      champion.stats.pierceArmor + 1,
    )
  })

  test("Loom reaches villagers only", () => {
    expect(upgradesForUnit(villager).map((tech) => tech.name)).toContain("Loom")
    expect(upgradesForUnit(knight).map((tech) => tech.name)).not.toContain("Loom")
    const upgraded = applyUpgrades(villager, [upgradeTech(22) as UpgradeTech])
    expect(upgraded.stats.hp).toBe(villager.stats.hp + 15)
    expect(upgraded.stats.meleeArmor).toBe(villager.stats.meleeArmor + 1)
    expect(upgraded.stats.pierceArmor).toBe(villager.stats.pierceArmor + 2)
  })
})

describe("the archery range and stable lines", () => {
  test("Bloodlines adds 20 hit points to cavalry", () => {
    expect(applyUpgrades(knight, [upgradeTech(435) as UpgradeTech]).stats.hp).toBe(knight.stats.hp + 20)
    expect(upgradesForUnit(archer).map((tech) => tech.name)).not.toContain("Bloodlines")
  })

  test("Thumb Ring reaches foot and mounted archers but not ships", () => {
    const names = (unit: Unit) => upgradesForUnit(unit).map((tech) => tech.name)
    expect(names(archer)).toContain("Thumb Ring")
    expect(names(cavalryArcher)).toContain("Thumb Ring")
    expect(names(galley)).not.toContain("Thumb Ring")
    expect(names(handCannoneer)).not.toContain("Thumb Ring")

    const upgraded = applyUpgrades(archer, [upgradeTech(437) as UpgradeTech])
    expect(upgraded.stats.accuracy).toBe(100)
    expect(upgraded.stats.attackSpeed).toBeCloseTo(archer.stats.attackSpeed * 0.85, 3)
  })

  test("Parthian Tactics is cavalry-archer only", () => {
    expect(upgradesForUnit(cavalryArcher).map((tech) => tech.name)).toContain("Parthian Tactics")
    expect(upgradesForUnit(archer).map((tech) => tech.name)).not.toContain("Parthian Tactics")
    const upgraded = applyUpgrades(cavalryArcher, [upgradeTech(436) as UpgradeTech])
    expect(upgraded.stats.meleeArmor).toBe(cavalryArcher.stats.meleeArmor + 1)
    expect(upgraded.stats.pierceArmor).toBe(cavalryArcher.stats.pierceArmor + 2)
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
