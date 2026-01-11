import { getConnection } from '../connection'
import type { Technology, Age } from '@/lib/types'

export async function getAllTechnologies(): Promise<Technology[]> {
  const conn = await getConnection()

  const reader = await conn.runAndReadAll(`
    SELECT t.*
    FROM techs t
    ORDER BY t.id
  `)

  const rows = reader.getRowObjects()

  return rows.map((row: any) => ({
    id: row.id.toString(),
    name: row.internal_name,
    category: "Blacksmith" as Technology['category'], // TODO: Derive
    age: "Castle" as Age, // TODO: Derive from civ_techs
    cost: {
      food: row.cost_food || undefined,
      wood: row.cost_wood || undefined,
      gold: row.cost_gold || undefined,
      stone: row.cost_stone || undefined,
    },
    researchTime: row.research_time || 0,
    description: `Technology ID: ${row.id}`,
    effects: [],
    affectedUnits: [],
    affectedBuildings: [],
  }))
}

export async function getTechnologyById(id: string): Promise<Technology | null> {
  const techs = await getAllTechnologies()
  return techs.find(t => t.id === id) || null
}

export async function getTechnologiesByCategory(category: string): Promise<Technology[]> {
  if (category === 'all') return getAllTechnologies()
  const techs = await getAllTechnologies()
  return techs.filter(t => t.category === category)
}
