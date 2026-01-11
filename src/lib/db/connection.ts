import { DuckDBInstance, DuckDBConnection } from '@duckdb/node-api'
import path from 'path'

let instance: DuckDBInstance | null = null
let connection: DuckDBConnection | null = null
let isInitializing = false

const PARQUET_DIR = path.join(process.cwd(), 'export', 'parquet')
const IMG_DIR = path.join(process.cwd(), 'export', 'img')

export async function getConnection(): Promise<DuckDBConnection> {
  // Return cached connection if available
  if (connection) {
    return connection
  }

  // Prevent race conditions - wait if already initializing
  if (isInitializing) {
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 100))
    return getConnection()
  }

  isInitializing = true

  try {
    // Create in-memory DuckDB instance
    instance = await DuckDBInstance.create(':memory:')
    connection = await instance.connect()

    // Load all parquet files into tables
    const tables = [
      'age_names', 'buildings', 'building_armours', 'building_attacks',
      'civilizations', 'civ_buildings', 'civ_names', 'civ_techs',
      'civ_uniques', 'civ_units', 'node_types', 'techs', 'units',
      'unit_armours', 'unit_attacks', 'unit_upgrades'
    ]

    for (const table of tables) {
      await connection.run(`
        CREATE TABLE ${table} AS
        SELECT * FROM read_parquet('${PARQUET_DIR}/${table}.parquet')
      `)
    }

    console.log('[DuckDB] Connection initialized successfully')
    return connection
  } catch (error) {
    console.error('[DuckDB] Failed to initialize connection:', error)
    // Clean up on failure
    connection = null
    instance = null
    throw new Error(`Failed to initialize DuckDB: ${error}`)
  } finally {
    isInitializing = false
  }
}

export function getImagePath(relativePath: string): string {
  return `/${relativePath}`
}

export async function closeConnection(): Promise<void> {
  try {
    if (connection) {
      connection.closeSync()
      connection = null
    }
    instance = null
    console.log('[DuckDB] Connection closed successfully')
  } catch (error) {
    console.error('[DuckDB] Error closing connection:', error)
    // Force cleanup even if close fails
    connection = null
    instance = null
  }
}
