import { DuckDBInstance, DuckDBConnection } from '@duckdb/node-api'
import path from 'path'

let instance: DuckDBInstance | null = null
let connection: DuckDBConnection | null = null

const PARQUET_DIR = path.join(process.cwd(), 'export', 'parquet')
const IMG_DIR = path.join(process.cwd(), 'export', 'img')

export async function getConnection(): Promise<DuckDBConnection> {
  if (connection) {
    return connection
  }

  // Create in-memory DuckDB instance
  instance = await DuckDBInstance.create(':memory:')
  connection = await instance.connect()

  // Load all parquet files into tables
  await connection.run(`
    CREATE TABLE age_names AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/age_names.parquet')
  `)

  await connection.run(`
    CREATE TABLE buildings AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/buildings.parquet')
  `)

  await connection.run(`
    CREATE TABLE building_armours AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/building_armours.parquet')
  `)

  await connection.run(`
    CREATE TABLE building_attacks AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/building_attacks.parquet')
  `)

  await connection.run(`
    CREATE TABLE civilizations AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/civilizations.parquet')
  `)

  await connection.run(`
    CREATE TABLE civ_buildings AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/civ_buildings.parquet')
  `)

  await connection.run(`
    CREATE TABLE civ_names AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/civ_names.parquet')
  `)

  await connection.run(`
    CREATE TABLE civ_techs AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/civ_techs.parquet')
  `)

  await connection.run(`
    CREATE TABLE civ_uniques AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/civ_uniques.parquet')
  `)

  await connection.run(`
    CREATE TABLE civ_units AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/civ_units.parquet')
  `)

  await connection.run(`
    CREATE TABLE node_types AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/node_types.parquet')
  `)

  await connection.run(`
    CREATE TABLE techs AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/techs.parquet')
  `)

  await connection.run(`
    CREATE TABLE units AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/units.parquet')
  `)

  await connection.run(`
    CREATE TABLE unit_armours AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/unit_armours.parquet')
  `)

  await connection.run(`
    CREATE TABLE unit_attacks AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/unit_attacks.parquet')
  `)

  await connection.run(`
    CREATE TABLE unit_upgrades AS
    SELECT * FROM read_parquet('${PARQUET_DIR}/unit_upgrades.parquet')
  `)

  return connection
}

export function getImagePath(relativePath: string): string {
  // Return path for Next.js public folder access
  return `/${relativePath}`
}

export async function closeConnection(): Promise<void> {
  if (connection) {
    connection.closeSync()
    connection = null
  }
  instance = null
}
