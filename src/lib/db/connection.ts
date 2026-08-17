import fs from "node:fs"
import path from "node:path"
import { type DuckDBConnection, DuckDBInstance } from "@duckdb/node-api"

const PARQUET_DIR = path.join(process.cwd(), "export", "parquet")

let initPromise: Promise<DuckDBConnection> | null = null

async function initialize(): Promise<DuckDBConnection> {
  const instance = await DuckDBInstance.create(":memory:")
  const connection = await instance.connect()

  const tables = fs
    .readdirSync(PARQUET_DIR)
    .filter((file) => file.endsWith(".parquet"))
    .map((file) => path.basename(file, ".parquet"))
    .sort()

  for (const table of tables) {
    await connection.run(`
      CREATE TABLE "${table}" AS
      SELECT * FROM read_parquet('${PARQUET_DIR}/${table}.parquet')
    `)
  }

  console.log(`[DuckDB] Loaded ${tables.length} tables`)
  return connection
}

export function getConnection(): Promise<DuckDBConnection> {
  if (!initPromise) {
    initPromise = initialize().catch((error) => {
      // Allow a later request to retry instead of caching the failure forever.
      initPromise = null
      throw new Error(`Failed to initialize DuckDB: ${error}`)
    })
  }
  return initPromise
}

/** Run a query and return its rows, typed by the caller's row interface. */
export async function queryRows<T>(sql: string): Promise<T[]> {
  const conn = await getConnection()
  const reader = await conn.runAndReadAll(sql)
  return reader.getRowObjects() as T[]
}

export async function closeConnection(): Promise<void> {
  if (!initPromise) return
  const pending = initPromise
  initPromise = null
  try {
    const connection = await pending
    connection.closeSync()
  } catch (error) {
    console.error("[DuckDB] Error closing connection:", error)
  }
}
