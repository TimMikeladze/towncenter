import { NextResponse } from "next/server"
import { getConnection } from "@/lib/db/connection"

/** Tables live in an in-memory DuckDB built from the parquet export. */
async function listTables(): Promise<string[]> {
  const conn = await getConnection()
  const reader = await conn.runAndReadAll(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'main' ORDER BY table_name`,
  )
  return reader.getRowObjects().map((row) => String(row.table_name))
}

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Database inspection is only available in development" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action") || "tables"
  const table = searchParams.get("table")

  try {
    const conn = await getConnection()
    // Every table name that reaches SQL is checked against this list, so the
    // route can never interpolate arbitrary text even by accident.
    const allowedTables = await listTables()

    if (action === "tables") {
      const reader = await conn.runAndReadAll(`
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'main'
        ORDER BY table_name, ordinal_position
      `)

      const tables: Record<string, { name: string; type: string }[]> = {}
      for (const column of reader.getRowObjects()) {
        const name = String(column.table_name)
        tables[name] ??= []
        tables[name].push({ name: String(column.column_name), type: String(column.data_type) })
      }

      return NextResponse.json({ tables })
    }

    if (action === "sample") {
      if (!table || !allowedTables.includes(table)) {
        return NextResponse.json({ error: `Unknown table. Available: ${allowedTables.join(", ")}` }, { status: 400 })
      }
      const reader = await conn.runAndReadAll(`SELECT * FROM "${table}" LIMIT 10`)
      const rows = reader.getRowObjects()
      return NextResponse.json({ table, count: rows.length, rows })
    }

    if (action === "stats") {
      const stats: Record<string, number> = {}
      for (const tableName of allowedTables) {
        const reader = await conn.runAndReadAll(`SELECT COUNT(*) AS count FROM "${tableName}"`)
        stats[tableName] = Number(reader.getRowObjects()[0].count)
      }
      return NextResponse.json({ stats })
    }

    return NextResponse.json({ error: "Invalid action. Use: tables, sample, or stats" }, { status: 400 })
  } catch (error) {
    console.error("[DB Inspect] Error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
