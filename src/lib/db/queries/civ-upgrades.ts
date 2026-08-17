import { cache } from "react"
import { civId } from "@/lib/game/ids"
import { UPGRADE_TECH_IDS } from "@/lib/game/upgrades"
import { queryRows } from "../connection"

interface CivTechRow {
  civ_name: string
  tech_id: number
}

/**
 * Which blacksmith / university / dock upgrades each civ can actually research.
 * Half the civ identities in the game are a hole in this table — Goths have no
 * Plate Mail, Britons no Bloodlines-tier cavalry armour, and so on.
 */
export const getCivUpgradeAvailability = cache(async (): Promise<Record<string, number[]>> => {
  const rows = await queryRows<CivTechRow>(`
    SELECT civ_name, tech_id FROM civ_techs
    WHERE tech_id IN (${UPGRADE_TECH_IDS.join(",")})
  `)

  const byCiv: Record<string, number[]> = {}
  for (const row of rows) {
    const id = civId(row.civ_name)
    if (!byCiv[id]) byCiv[id] = []
    byCiv[id].push(Number(row.tech_id))
  }
  return byCiv
})
