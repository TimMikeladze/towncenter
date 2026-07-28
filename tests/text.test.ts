import { describe, expect, test } from "bun:test"
import { parseCivHelpText, parseHelpText } from "../src/lib/game/text"

const ARCHER_HELP = [
  "Create <b>Archer</b> (‹cost›)<br>",
  "All-purpose Foot Archer. Strong vs. units at long range. Weak vs. Skirmishers.<br>",
  "<i>Upgrades: attack, range, armor (Blacksmith)</i>‹DEFAULT›<br>",
  "‹hp› ‹attack› ‹armor›",
].join("\n")

const ARMENIANS_HELP = [
  "Infantry and Naval civilization<br>",
  "<br>",
  "• Mule Carts cost -25%<br>",
  "• Galley-line and Dromons fire an additional projectile<br>",
  "<br>",
  "<b>Unique Unit:</b><br>",
  "Composite Bowman (Foot Archer), Warrior Priest (Infantry)<br>",
  "<br>",
  "<b>Unique Techs:</b><br>",
  "• Cilician Fleet (Demolition Ships +20% blast radius)<br>",
  "<br>",
  "<b>Team Bonus:</b><br>",
  "Infantry +2 line of sight",
].join("\n")

describe("parseHelpText", () => {
  test("takes the description line, not the Create line", () => {
    const help = parseHelpText(ARCHER_HELP)
    expect(help.description).toBe("All-purpose Foot Archer. Strong vs. units at long range. Weak vs. Skirmishers.")
  })

  test("keeps the upgrades line as an effect", () => {
    expect(parseHelpText(ARCHER_HELP).effects).toEqual(["Upgrades: attack, range, armor (Blacksmith)"])
  })

  test("handles missing text", () => {
    expect(parseHelpText(null)).toEqual({ description: "", effects: [] })
  })
})

describe("parseCivHelpText", () => {
  const parsed = parseCivHelpText(ARMENIANS_HELP, "Armenians")

  test("reads every civ focus from the header", () => {
    expect(parsed.types).toEqual(["Infantry", "Naval"])
  })

  test("collects the bulleted bonuses and the team bonus", () => {
    expect(parsed.bonuses.map((bonus) => bonus.description)).toEqual([
      "Mule Carts cost -25%",
      "Galley-line and Dromons fire an additional projectile",
      "Infantry +2 line of sight",
    ])
    expect(parsed.teamBonus).toBe("Infantry +2 line of sight")
    expect(parsed.bonuses.at(-1)?.category).toBe("team")
  })

  test("splits unique units without breaking on parenthesised classes", () => {
    expect(parsed.uniqueUnitNames).toEqual(["Composite Bowman (Foot Archer)", "Warrior Priest (Infantry)"])
  })

  test("keeps unique tech effect text", () => {
    expect(parsed.uniqueTechDescriptions).toEqual(["Cilician Fleet (Demolition Ships +20% blast radius)"])
  })
})
