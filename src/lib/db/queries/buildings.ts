import { getConnection } from '../connection'
import type { Building, Age } from '@/lib/types'

export async function getAllBuildings(): Promise<Building[]> {
  const conn = await getConnection()

  const reader = await conn.runAndReadAll(`
    SELECT
      b.*,
      b.image_path
    FROM buildings b
    ORDER BY b.id
  `)

  const rows = reader.getRowObjects()

  return rows.map((row: any) => ({
    id: row.id.toString(),
    name: row.internal_name,
    type: deriveBuildingType(row.internal_name),
    age: "Dark" as Age, // TODO: Derive from civ_buildings
    cost: {
      food: row.cost_food || undefined,
      wood: row.cost_wood || undefined,
      gold: row.cost_gold || undefined,
      stone: row.cost_stone || undefined,
    },
    buildTime: row.train_time || 0,
    hitPoints: row.hp,
    meleeArmor: row.melee_armor,
    pierceArmor: row.pierce_armor,
    lineOfSight: row.line_of_sight,
    garrisonCapacity: row.garrison_capacity || undefined,
    description: `Building ID: ${row.id}`,
    trainsUnits: [],
    researchesTechs: [],
    upgrades: [],
    image_path: row.image_path,
  }))
}

function deriveBuildingType(internalName: string): string {
  const name = internalName.toLowerCase()
  if (name.includes('barrack') || name.includes('stable') || name.includes('range')) return 'Military'
  if (name.includes('mill') || name.includes('farm') || name.includes('market')) return 'Eco'
  if (name.includes('tower') || name.includes('outpost')) return 'Tower'
  if (name.includes('wall') || name.includes('palisade')) return 'Wall'
  if (name.includes('gate')) return 'Gate'
  if (name.includes('university') || name.includes('monastery')) return 'Science'
  return 'Special'
}

export async function getBuildingById(id: string): Promise<Building | null> {
  const buildings = await getAllBuildings()
  return buildings.find(b => b.id === id) || null
}

export async function getBuildingsByType(type: string): Promise<Building[]> {
  if (type === 'all') return getAllBuildings()
  const buildings = await getAllBuildings()
  return buildings.filter(b => b.type === type)
}
