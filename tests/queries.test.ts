import { describe, expect, test } from "bun:test"
import { getAllCivilizations } from "../src/lib/db/queries/civilizations"
import { getCivTechTree } from "../src/lib/db/queries/tech-tree"
import { getAllTechnologies } from "../src/lib/db/queries/technologies"
import { getAllUnits } from "../src/lib/db/queries/units"
import type { TechTreeNode } from "../src/lib/types"

const units = await getAllUnits()
const civs = await getAllCivilizations()
const techs = await getAllTechnologies()

describe("units", () => {
  test("resolve display names, not internal engine codes", () => {
    const archer = units.find((unit) => unit.id === "4")
    expect(archer?.name).toBe("Archer")
    // ALLCAPS internal names would mean the names table failed to join.
    const codeNamed = units.filter((unit) => /^[A-Z_0-9]{4,}$/.test(unit.name))
    expect(codeNamed).toEqual([])
  })

  test("carry real help text, not a placeholder", () => {
    const archer = units.find((unit) => unit.id === "4")
    expect(archer?.description).toContain("Foot Archer")
    expect(units.filter((unit) => unit.description.startsWith("Unit ID:"))).toEqual([])
  })

  test("span every age instead of defaulting to Castle", () => {
    const ages = new Set(units.map((unit) => unit.age))
    expect(ages.size).toBeGreaterThan(1)
    expect(ages.has("Feudal")).toBe(true)
  })

  test("classify by training building, not by name matching", () => {
    expect(units.find((unit) => unit.id === "4")?.type).toBe("Archer")
    expect(units.find((unit) => unit.id === "38")?.type).toBe("Cavalry") // Knight
  })

  test("mark unique units with their civ", () => {
    const longbowman = units.find((unit) => unit.name === "Longbowman")
    expect(longbowman?.civSpecific).toBe("britons")
  })

  test("expose derived counters", () => {
    const knight = units.find((unit) => unit.name === "Knight")
    expect(knight?.counters.length).toBeGreaterThan(0)
  })

  test("chain upgrade paths", () => {
    const archer = units.find((unit) => unit.id === "4")
    // Archer -> Crossbowman (24) -> Arbalester (492)
    expect(archer?.upgrades).toContain("24")
    expect(archer?.upgrades).toContain("492")
  })

  test("record which civs can train them", () => {
    const archer = units.find((unit) => unit.id === "4")
    expect(archer?.availableToCivs?.length ?? 0).toBeGreaterThan(10)
  })
})

describe("civilizations", () => {
  test("are typed from their in-game description", () => {
    const armenians = civs.find((civ) => civ.id === "armenians")
    expect(armenians?.types).toEqual(["Infantry", "Naval"])
    expect(civs.every((civ) => civ.types.length > 0)).toBe(true)
  })

  test("have parsed bonuses and a team bonus", () => {
    const armenians = civs.find((civ) => civ.id === "armenians")
    expect(armenians?.bonuses.length).toBeGreaterThan(1)
    expect(armenians?.teamBonus).not.toBe("")
  })

  test("know what they are missing", () => {
    const britons = civs.find((civ) => civ.id === "britons")
    expect(britons?.techTree.missingUnits.length).toBeGreaterThan(0)
  })
})

describe("technologies", () => {
  test("are categorized by the building that researches them", () => {
    const loom = techs.find((tech) => tech.name === "Loom")
    expect(loom?.category).toBe("Town Center")
    expect(techs.filter((tech) => tech.description.startsWith("Technology ID:"))).toEqual([])
  })
})

describe("civ tech tree", () => {
  test("differs between civs", async () => {
    const [britons, franks] = await Promise.all([getCivTechTree("britons"), getCivTechTree("franks")])
    const britonUnits = new Set(britons?.units.map((entry) => entry.entity.id))
    const frankUnits = franks?.units.map((entry) => entry.entity.id) ?? []
    expect(frankUnits.some((id) => !britonUnits.has(id))).toBe(true)
  })

  test("assigns per-civ ages", async () => {
    const tree = await getCivTechTree("britons")
    const ages = new Set(tree?.units.map((entry) => entry.age))
    expect(ages.size).toBeGreaterThan(2)
  })
})

/** Path of names from a root down to `name`, or [] if it is not in the tree. */
function pathTo(nodes: TechTreeNode[], name: string, trail: string[] = []): string[] {
  for (const node of nodes) {
    const here = [...trail, node.name]
    if (node.name === name) return here
    const deeper = pathTo(node.children, name, here)
    if (deeper.length > 0) return deeper
  }
  return []
}

describe("civ tech tree hierarchy", () => {
  test("holds every entity exactly once, under a building", async () => {
    for (const id of ["britons", "sicilians", "armenians", "incas", "malay"]) {
      const tree = await getCivTechTree(id)
      if (!tree) throw new Error(`no tech tree for ${id}`)

      const seen: string[] = []
      const walk = (nodes: TechTreeNode[]) => {
        for (const node of nodes) {
          seen.push(`${node.kind}:${node.id}`)
          walk(node.children)
        }
      }
      walk(tree.roots)

      expect(new Set(seen).size).toBe(seen.length)
      expect(seen.length).toBe(tree.units.length + tree.buildings.length + tree.techs.length)
      expect(tree.roots.every((root) => root.kind === "building")).toBe(true)
    }
  })

  test("nests unit upgrades under what they upgrade from", async () => {
    const tree = await getCivTechTree("britons")
    expect(pathTo(tree?.roots ?? [], "Champion")).toEqual([
      "Barracks",
      "Militia",
      "Man-at-Arms",
      "Long Swordsman",
      "Two-Handed Swordsman",
      "Champion",
    ])
    expect(pathTo(tree?.roots ?? [], "Arbalester")).toEqual(["Archery Range", "Archer", "Crossbowman", "Arbalester"])
  })

  test("nests technologies under the building that researches them", async () => {
    const tree = await getCivTechTree("britons")
    expect(pathTo(tree?.roots ?? [], "Bracer")).toEqual(["Blacksmith", "Fletching", "Bodkin Arrow", "Bracer"])
    // The Monk's column is recorded as the Armenian Fortified Church upstream.
    expect(pathTo(tree?.roots ?? [], "Monk")).toEqual(["Monastery", "Monk"])
  })

  test("uses the replacement building a civ actually has", async () => {
    const [armenians, georgians, sicilians] = await Promise.all([
      getCivTechTree("armenians"),
      getCivTechTree("georgians"),
      getCivTechTree("sicilians"),
    ])
    expect(pathTo(armenians?.roots ?? [], "Monk")[0]).toBe("Fortified Church")
    expect(pathTo(georgians?.roots ?? [], "Gold Mining")[0]).toBe("Mule Cart")
    // Sicilians train the Serjeant at both the Castle and the Donjon.
    const donjon = sicilians?.roots.find((root) => root.name === "Donjon")
    expect(donjon?.children.map((child) => child.name)).toContain("Serjeant")
  })
})
