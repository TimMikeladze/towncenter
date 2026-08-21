import { describe, expect, test } from "bun:test"
import { entityIdFromParam, entityPath, entitySegment, slugify } from "../src/lib/game/ids"
import { civilizationHref, technologyHref, unitHref } from "../src/lib/hrefs"
import { buildingSeo, costSentence, technologySeo, unitSeo } from "../src/lib/seo/entities"
import type { Building, Technology, Unit } from "../src/lib/types"

describe("slugify", () => {
  test("lowercases and hyphenates", () => {
    expect(slugify("Man-at-Arms")).toBe("man-at-arms")
    expect(slugify("Elite Konnik")).toBe("elite-konnik")
  })

  test("drops punctuation and edge hyphens", () => {
    expect(slugify("Krepost (unique)")).toBe("krepost-unique")
    expect(slugify("  Fire Ship!  ")).toBe("fire-ship")
  })
})

describe("entity URLs", () => {
  test("numeric ids keep the id in front of the slug", () => {
    expect(entityPath("/units", "74", "Knight")).toBe("/units/74-knight")
    expect(entitySegment("74", "Knight")).toBe("74-knight")
  })

  test("name-shaped ids are left alone", () => {
    expect(entityPath("/civilizations", "franks", "Franks")).toBe("/civilizations/franks")
    expect(civilizationHref({ id: "teutons", name: "Teutons" })).toBe("/civilizations/teutons")
  })

  test("a name that slugs to nothing still yields a usable URL", () => {
    expect(entityPath("/units", "9", "???")).toBe("/units/9")
  })

  test("the helpers agree on the same shape", () => {
    expect(unitHref({ id: "75", name: "Man-at-Arms" })).toBe("/units/75-man-at-arms")
    expect(technologyHref({ id: "22", name: "Loom" })).toBe("/technologies/22-loom")
  })
})

describe("entityIdFromParam", () => {
  test("recovers the id from the canonical form", () => {
    expect(entityIdFromParam("74-knight")).toBe("74")
  })

  test("still accepts a bare numeric id, so old links keep working", () => {
    expect(entityIdFromParam("74")).toBe("74")
  })

  test("survives a stale slug from before a rename", () => {
    expect(entityIdFromParam("74-some-old-name")).toBe("74")
  })

  test("passes name-shaped ids through untouched", () => {
    expect(entityIdFromParam("franks")).toBe("franks")
    expect(entityIdFromParam("burgundians")).toBe("burgundians")
  })
})

describe("costSentence", () => {
  test("reads the resources in the order a player would say them", () => {
    expect(costSentence({ food: 60, gold: 75 })).toBe("60 food, 75 gold")
  })

  test("skips zero and missing resources", () => {
    expect(costSentence({ wood: 0, stone: 125 })).toBe("125 stone")
  })

  test("says so when there is no cost", () => {
    expect(costSentence({})).toBe("nothing")
  })
})

const KNIGHT = {
  id: "38",
  name: "Knight",
  type: "Cavalry",
  age: "Castle",
  cost: { food: 60, gold: 75 },
  description: "Strong melee cavalry.",
  stats: {
    hp: 100,
    attack: 10,
    attackType: "Melee",
    meleeArmor: 2,
    pierceArmor: 2,
    armorClasses: [],
    attackBonuses: [],
    attackSpeed: 1.8,
    movementSpeed: 1.35,
    lineOfSight: 4,
    trainingTime: 30,
    accuracy: 100,
    attackDelay: 0,
    blastWidth: 0,
    garrisonCapacity: 0,
    frameDelay: 0,
    traits: [],
  },
  effects: [],
  counters: [],
  goodAgainst: [],
} as unknown as Unit

describe("entity metadata copy", () => {
  test("a unit description carries the stats that make it unique", () => {
    const seo = unitSeo(KNIGHT)
    expect(seo.title).toBe("Knight — AoE2 unit stats & counters")
    expect(seo.description).toContain("Castle Age cavalry unit")
    expect(seo.description).toContain("100 HP")
    expect(seo.description).toContain("60 food, 75 gold")
  })

  test("a unique unit names its civilization instead of its class", () => {
    const seo = unitSeo(KNIGHT, "Franks")
    expect(seo.description).toContain("Franks unique unit")
    expect(seo.eyebrow).toBe("Franks unique unit")
  })

  test("descriptions stay inside the length a search result shows", () => {
    const long = { ...KNIGHT, name: "A".repeat(120) } as Unit
    expect(unitSeo(long).description.length).toBeLessThanOrEqual(158)
  })

  test("stats are published as structured-data properties", () => {
    const names = unitSeo(KNIGHT).properties.map((property) => property.name)
    expect(names).toContain("Hit points")
    expect(names).toContain("Cost")
  })

  test("a building without an attack does not claim one", () => {
    const house = {
      id: "70",
      name: "House",
      type: "Eco",
      age: "Dark",
      cost: { wood: 25 },
      buildTime: 25,
      hitPoints: 550,
      meleeArmor: 0,
      pierceArmor: 0,
      lineOfSight: 2,
      attack: 0,
      attackType: "Melee",
      attackSpeed: 0,
      accuracy: 100,
      armorClasses: [],
      attackBonuses: [],
      description: "Provides population headroom.",
    } as unknown as Building
    const seo = buildingSeo(house)
    expect(seo.description).toContain("550 HP")
    expect(seo.description).not.toContain("attack")
    expect(seo.properties.map((property) => property.name)).not.toContain("Attack")
  })

  test("a technology description leads with cost and research time", () => {
    const loom = {
      id: "22",
      name: "Loom",
      category: "Town Center",
      age: "Dark",
      cost: { gold: 50 },
      researchTime: 25,
      description: "Villagers gain hit points and armor.",
      effects: [],
    } as unknown as Technology
    const seo = technologySeo(loom)
    expect(seo.title).toBe("Loom — AoE2 technology")
    expect(seo.description).toContain("50 gold")
    expect(seo.description).toContain("25s to research")
  })
})

describe("legacy id redirects", () => {
  test("every bare numeric id redirects to the URL the app links to", async () => {
    const { legacyIdRedirects } = await import("../next.config")
    const { getAllBuildings, getAllTechnologies, getAllUnits } = await import("../src/lib/data")
    const { buildingHref, technologyHref, unitHref } = await import("../src/lib/hrefs")

    const redirects = new Map(legacyIdRedirects().map((entry) => [entry.source, entry.destination]))

    const cases: [{ id: string; name: string }[], string, (entity: { id: string; name: string }) => string][] = [
      [await getAllUnits(), "/units", unitHref],
      [await getAllBuildings(), "/buildings", buildingHref],
      [await getAllTechnologies(), "/technologies", technologyHref],
    ]

    for (const [items, base, href] of cases) {
      for (const item of items) {
        const canonical = href(item)
        // An entity whose canonical URL is already the bare id needs no
        // redirect — anything else must have one, pointing at the canonical.
        if (canonical === `${base}/${item.id}`) {
          expect(redirects.has(`${base}/${item.id}`)).toBe(false)
        } else {
          expect(redirects.get(`${base}/${item.id}`)).toBe(canonical)
        }
      }
    }
  })

  test("no redirect points at itself", async () => {
    const { legacyIdRedirects } = await import("../next.config")
    for (const entry of legacyIdRedirects()) {
      expect(entry.source).not.toBe(entry.destination)
      expect(entry.permanent).toBe(true)
    }
  })
})
