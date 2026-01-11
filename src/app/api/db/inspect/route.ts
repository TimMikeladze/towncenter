import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/db/connection'

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Database inspection is only available in development' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'tables'
  const table = searchParams.get('table')
  const query = searchParams.get('query')

  try {
    const conn = await getConnection()

    // List all tables
    if (action === 'tables') {
      const reader = await conn.runAndReadAll(`
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'main'
        ORDER BY table_name, ordinal_position
      `)
      const columns = reader.getRowObjects()

      // Group by table
      const tables = columns.reduce((acc: any, col: any) => {
        if (!acc[col.table_name]) {
          acc[col.table_name] = []
        }
        acc[col.table_name].push({
          name: col.column_name,
          type: col.data_type
        })
        return acc
      }, {})

      return NextResponse.json({ tables })
    }

    // Show sample data from a table
    if (action === 'sample' && table) {
      const reader = await conn.runAndReadAll(`
        SELECT * FROM ${table} LIMIT 10
      `)
      const rows = reader.getRowObjects()

      return NextResponse.json({
        table,
        count: rows.length,
        rows
      })
    }

    // Execute custom query
    if (action === 'query' && query) {
      const reader = await conn.runAndReadAll(query)
      const rows = reader.getRowObjects()

      return NextResponse.json({
        query,
        count: rows.length,
        rows
      })
    }

    // Table statistics
    if (action === 'stats') {
      const tableNames = [
        'civilizations', 'units', 'buildings', 'techs',
        'civ_buildings', 'civ_units', 'civ_techs', 'civ_uniques',
        'unit_attacks', 'unit_armours', 'building_attacks', 'building_armours',
        'unit_upgrades', 'node_types', 'age_names', 'civ_names', 'civ_helptexts'
      ]

      const stats: any = {}
      for (const tableName of tableNames) {
        const reader = await conn.runAndReadAll(`SELECT COUNT(*) as count FROM ${tableName}`)
        const rows = reader.getRowObjects()
        stats[tableName] = rows[0].count
      }

      return NextResponse.json({ stats })
    }

    return NextResponse.json({
      error: 'Invalid action. Use: tables, sample, query, or stats'
    }, { status: 400 })

  } catch (error) {
    console.error('[DB Inspect] Error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
