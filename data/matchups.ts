import type { Matchup } from "@/lib/types"

/**
 * ILLUSTRATIVE ONLY. These win rates are hand-written examples, not measured
 * results from played games. Nothing in the app should present them as fact;
 * replace them with a real source (e.g. aoestats.io) before treating them as data.
 */
export const MATCHUPS_ARE_ILLUSTRATIVE = true

export const matchups: Matchup[] = [
  {
    civA: "britons",
    civB: "franks",
    winRate: 48,
    notes: "Britons struggle against Frank cavalry rush. Need good archer mass and micro.",
  },
  {
    civA: "franks",
    civB: "britons",
    winRate: 52,
    notes: "Franks favor with cavalry push, but need to be aggressive early.",
  },
  {
    civA: "chinese",
    civB: "goths",
    winRate: 55,
    notes: "Chinese tech advantage helps vs Goth spam. Chu Ko Nu very effective.",
  },
  {
    civA: "goths",
    civB: "chinese",
    winRate: 45,
    notes: "Goths need to reach Imperial for infantry flood. Vulnerable to Chinese flexibility.",
  },
  {
    civA: "byzantines",
    civB: "turks",
    winRate: 51,
    notes: "Even matchup. Byzantines counter units vs Turkish gold units.",
  },
  {
    civA: "turks",
    civB: "byzantines",
    winRate: 49,
    notes: "Turkish gunpowder and gold advantage slightly offset by Byzantine counters.",
  },
  {
    civA: "britons",
    civB: "goths",
    winRate: 60,
    notes: "Britons dominate with archer range advantage. Goths struggle without stone walls.",
  },
  {
    civA: "goths",
    civB: "britons",
    winRate: 40,
    notes: "Difficult matchup. Need Huskarls in mass to counter Longbows.",
  },
  { civA: "franks", civB: "turks", winRate: 47, notes: "Turkish Janissaries counter Frankish Knights effectively." },
  {
    civA: "turks",
    civB: "franks",
    winRate: 53,
    notes: "Turks have advantage with ranged units and gunpowder against cavalry.",
  },
]
