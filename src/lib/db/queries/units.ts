import { getConnection } from '../connection'
import type { Unit, UnitType, Age } from '@/lib/types'

export async function getAllUnits(): Promise<Unit[]> {
  const conn = await getConnection()

  const reader = await conn.runAndReadAll(`
    SELECT
      u.*,
      GROUP_CONCAT(DISTINCT ua.attack_class || ':' || ua.amount) as attack_bonuses,
      GROUP_CONCAT(DISTINCT uar.armour_class || ':' || uar.amount) as armours
    FROM units u
    LEFT JOIN unit_attacks ua ON u.id = ua.unit_id
    LEFT JOIN unit_armours uar ON u.id = uar.unit_id
    GROUP BY u.id, u.internal_name, u.hp, u.attack, u.range, u.min_range,
             u.melee_armor, u.pierce_armor, u.garrison_capacity, u.line_of_sight,
             u.speed, u.reload_time, u.accuracy_percent, u.frame_delay,
             u.attack_delay_seconds, u.train_time, u.cost_food, u.cost_wood,
             u.cost_gold, u.cost_stone, u.language_name_id, u.language_help_id,
             u.image_path
    ORDER BY u.id
  `)

  const rows = reader.getRowObjects()

  return rows.map((row: any) => ({
    id: row.id.toString(),
    name: row.internal_name,
    type: deriveUnitType(row.internal_name) as UnitType,
    age: "Castle" as Age, // TODO: Derive from civ_units table
    cost: {
      food: row.cost_food || undefined,
      wood: row.cost_wood || undefined,
      gold: row.cost_gold || undefined,
      stone: row.cost_stone || undefined,
    },
    stats: {
      hp: row.hp,
      attack: row.attack,
      attackType: row.range > 0 ? "Pierce" : "Melee",
      meleeArmor: row.melee_armor,
      pierceArmor: row.pierce_armor,
      armorClasses: [], // TODO: Parse from armours
      attackBonuses: [], // TODO: Parse from attack_bonuses
      range: row.range > 0 ? row.range : undefined,
      attackSpeed: row.reload_time,
      movementSpeed: row.speed,
      lineOfSight: row.line_of_sight,
      trainingTime: row.train_time,
    },
    description: `Unit ID: ${row.id}`, // TODO: Get from language strings
    counters: [],
    goodAgainst: [],
    upgrades: [],
    image_path: row.image_path,
  }))
}

function deriveUnitType(internalName: string): string {
  const name = internalName.toLowerCase()
  if (name.includes('arch') || name.includes('skirm')) return 'Archer'
  if (name.includes('knight') || name.includes('camel') || name.includes('cav')) return 'Cavalry'
  if (name.includes('spear') || name.includes('sword') || name.includes('militia')) return 'Infantry'
  if (name.includes('monk')) return 'Monk'
  if (name.includes('ram') || name.includes('onager') || name.includes('treb')) return 'Siege'
  return 'Unique'
}

export async function getUnitById(id: string): Promise<Unit | null> {
  const units = await getAllUnits()
  return units.find(u => u.id === id) || null
}

export async function getUnitsByType(type: string): Promise<Unit[]> {
  if (type === 'all') return getAllUnits()
  const units = await getAllUnits()
  return units.filter(u => u.type === type)
}
