# DuckDB Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace mock TypeScript data with DuckDB-backed parquet files and enable server-side rendering

**Architecture:** Create a DuckDB connection layer that queries parquet files directly, transform existing client components to server components with React Server Components pattern, serve static images from export/img directory via Next.js public folder or rewrites

**Tech Stack:** DuckDB Node.js Neo API (@duckdb/node-api), Next.js 16 App Router, Server Components, Parquet files

---

## Task 1: Install Dependencies and Setup DuckDB

**Files:**
- Modify: `package.json`

**Step 1: Install @duckdb/node-api**

Run: `bun add @duckdb/node-api`
Expected: Package installed successfully

**Step 2: Verify installation**

Run: `bun install`
Expected: No errors, lockfile updated

**Step 3: Commit**

```bash
git add package.json bun.lockb
git commit -m "feat: add @duckdb/node-api dependency"
```

---

## Task 2: Create DuckDB Connection Module

**Files:**
- Create: `src/lib/db/connection.ts`

**Step 1: Create db directory**

Run: `mkdir -p src/lib/db`
Expected: Directory created

**Step 2: Write DuckDB connection module**

Create `src/lib/db/connection.ts`:

```typescript
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
```

**Step 3: Test connection manually**

Create a test script to verify:

```typescript
// Test in development console:
import { getConnection } from './src/lib/db/connection'
const conn = await getConnection()
const result = await conn.runAndReadAll('SELECT COUNT(*) as count FROM civilizations')
console.log(result.getRowObjects())
```

**Step 4: Commit**

```bash
git add src/lib/db/connection.ts
git commit -m "feat: create DuckDB connection module with parquet loading"
```

---

## Task 3: Configure Next.js for Static Assets

**Files:**
- Modify: `next.config.ts`

**Step 1: Add export/img to public access**

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Serve export directory images
  async rewrites() {
    return [
      {
        source: '/img/:path*',
        destination: '/export/img/:path*',
      },
    ]
  },
};

export default nextConfig;
```

**Step 2: Create symbolic link or copy images**

Run: `ln -s ../export/img public/img`
Expected: Symbolic link created (or use rewrites as above)

**Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: configure Next.js to serve export/img assets"
```

---

## Task 4: Create Data Query Functions for Civilizations

**Files:**
- Create: `src/lib/db/queries/civilizations.ts`

**Step 1: Create queries directory**

Run: `mkdir -p src/lib/db/queries`
Expected: Directory created

**Step 2: Write civilization queries**

Create `src/lib/db/queries/civilizations.ts`:

```typescript
import { getConnection } from '../connection'
import type { Civilization } from '@/lib/types'

export async function getAllCivilizations(): Promise<Civilization[]> {
  const conn = await getConnection()

  const reader = await conn.runAndReadAll(`
    SELECT
      c.name,
      c.image_path,
      cu.castle_age_unique_unit,
      cu.imperial_age_unique_unit,
      cu.castle_age_unique_tech,
      cu.imperial_age_unique_tech
    FROM civilizations c
    LEFT JOIN civ_uniques cu ON c.name = cu.civ_name
    ORDER BY c.name
  `)

  const rows = reader.getRowObjects()

  // Transform database rows to application types
  // Note: This is a simplified mapping - you'll need to enrich with bonuses,
  // strengths, weaknesses, etc. from other tables or JSON data
  return rows.map((row: any) => ({
    id: row.name.toLowerCase().replace(/\s+/g, '-'),
    name: row.name,
    type: "Archer", // TODO: Derive from civ characteristics
    bonuses: [], // TODO: Query from additional tables or supplement
    uniqueUnits: [
      row.castle_age_unique_unit?.toString(),
      row.imperial_age_unique_unit?.toString()
    ].filter(Boolean),
    uniqueTechs: {
      castle: row.castle_age_unique_tech?.toString() || "",
      imperial: row.imperial_age_unique_tech?.toString() || ""
    },
    teamBonus: "", // TODO: Supplement from additional data
    strengths: [], // TODO: Supplement from additional data
    weaknesses: [], // TODO: Supplement from additional data
    techTree: {
      missingUnits: [],
      missingTechs: []
    }
  }))
}

export async function getCivilizationById(id: string): Promise<Civilization | null> {
  const civs = await getAllCivilizations()
  return civs.find(c => c.id === id) || null
}
```

**Step 3: Commit**

```bash
git add src/lib/db/queries/civilizations.ts
git commit -m "feat: add DuckDB civilization queries"
```

---

## Task 5: Create Data Query Functions for Units

**Files:**
- Create: `src/lib/db/queries/units.ts`

**Step 1: Write unit queries**

Create `src/lib/db/queries/units.ts`:

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/db/queries/units.ts
git commit -m "feat: add DuckDB unit queries"
```

---

## Task 6: Create Data Query Functions for Buildings

**Files:**
- Create: `src/lib/db/queries/buildings.ts`

**Step 1: Write building queries**

Create `src/lib/db/queries/buildings.ts`:

```typescript
import { getConnection } from '../connection'
import type { Building, Age } from '@/lib/types'

export async function getAllBuildings(): Promise<Building[]> {
  const conn = await getConnection()

  const reader = await conn.runAndReadAll(`
    SELECT
      b.*
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
```

**Step 2: Commit**

```bash
git add src/lib/db/queries/buildings.ts
git commit -m "feat: add DuckDB building queries"
```

---

## Task 7: Create Data Query Functions for Technologies

**Files:**
- Create: `src/lib/db/queries/technologies.ts`

**Step 1: Write technology queries**

Create `src/lib/db/queries/technologies.ts`:

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/db/queries/technologies.ts
git commit -m "feat: add DuckDB technology queries"
```

---

## Task 8: Update Main Data Layer with DuckDB Queries

**Files:**
- Modify: `src/lib/data.ts`

**Step 1: Replace imports and functions**

Update `src/lib/data.ts`:

```typescript
import type { Unit, Civilization, BuildOrder, Matchup, Building, Technology, Map } from "@/lib/types"

// Import DuckDB queries
import { getAllUnits as dbGetAllUnits, getUnitById as dbGetUnitById, getUnitsByType as dbGetUnitsByType } from "./db/queries/units"
import { getAllCivilizations as dbGetAllCivilizations, getCivilizationById as dbGetCivilizationById } from "./db/queries/civilizations"
import { getAllBuildings as dbGetAllBuildings, getBuildingById as dbGetBuildingById, getBuildingsByType as dbGetBuildingsByType } from "./db/queries/buildings"
import { getAllTechnologies as dbGetAllTechnologies, getTechnologyById as dbGetTechnologyById, getTechnologiesByCategory as dbGetTechnologiesByCategory } from "./db/queries/technologies"

// Keep mock data for features not yet migrated
import { buildOrders } from "@/data/build-orders"
import { matchups } from "@/data/matchups"
import { maps } from "@/data/maps"

export async function getAllUnits(): Promise<Unit[]> {
  return await dbGetAllUnits()
}

export async function getUnitById(id: string): Promise<Unit | undefined> {
  return await dbGetUnitById(id) || undefined
}

export async function getUnitsByType(type: string): Promise<Unit[]> {
  return await dbGetUnitsByType(type)
}

export function getUnitsByCiv(civId: string): Unit[] {
  // TODO: Implement with DuckDB civ_units table
  return []
}

export async function getAllCivilizations(): Promise<Civilization[]> {
  return await dbGetAllCivilizations()
}

export async function getCivilizationById(id: string): Promise<Civilization | undefined> {
  return await dbGetCivilizationById(id) || undefined
}

export function getAllBuildOrders(): BuildOrder[] {
  return buildOrders
}

export function getBuildOrdersByCiv(civId: string): BuildOrder[] {
  return buildOrders.filter((bo) => bo.civs.includes(civId))
}

export function getAllMatchups(): Matchup[] {
  return matchups
}

export function getMatchupsByCiv(civId: string): Matchup[] {
  return matchups.filter((m) => m.civA === civId || m.civB === civId)
}

export function getMatchup(civA: string, civB: string): Matchup | undefined {
  return matchups.find((m) => (m.civA === civA && m.civB === civB) || (m.civA === civB && m.civB === civA))
}

export async function getAllBuildings(): Promise<Building[]> {
  return await dbGetAllBuildings()
}

export async function getBuildingById(id: string): Promise<Building | undefined> {
  return await dbGetBuildingById(id) || undefined
}

export async function getBuildingsByType(type: string): Promise<Building[]> {
  return await dbGetBuildingsByType(type)
}

export async function getAllTechnologies(): Promise<Technology[]> {
  return await dbGetAllTechnologies()
}

export async function getTechnologyById(id: string): Promise<Technology | undefined> {
  return await dbGetTechnologyById(id) || undefined
}

export async function getTechnologiesByCategory(category: string): Promise<Technology[]> {
  return await dbGetTechnologiesByCategory(category)
}

export function getAllMaps(): Map[] {
  return maps
}

export function getMapById(id: string): Map | undefined {
  return maps.find((m) => m.id === id)
}

export function getMapsByType(type: string): Map[] {
  if (type === "all") return maps
  return maps.filter((m) => m.type === type)
}
```

**Step 2: Commit**

```bash
git add src/lib/data.ts
git commit -m "feat: integrate DuckDB queries into main data layer"
```

---

## Task 9: Convert Civilizations Page to Server Component

**Files:**
- Modify: `src/app/civilizations/page.tsx`

**Step 1: Remove "use client" and make async**

Update `src/app/civilizations/page.tsx`:

```typescript
import { SecondaryNav } from "@/components/secondary-nav"
import { DataViewer } from "@/components/data-viewer"
import type { DataViewerConfig } from "@/components/data-viewer"
import { getAllCivilizations } from "@/lib/data"
import type { Civilization } from "@/lib/types"
import { Users, Crown, Swords } from "lucide-react"

const civTypes = ["all", "Archer", "Cavalry", "Infantry", "Defensive", "Naval", "Monk"] as const

const secondaryNavItems = [
  { label: "All Civs", value: "all" },
  { label: "Archer", value: "Archer" },
  { label: "Cavalry", value: "Cavalry" },
  { label: "Infantry", value: "Infantry" },
  { label: "Defensive", value: "Defensive" },
  { label: "Naval", value: "Naval" },
  { label: "Monk", value: "Monk" },
]

export default async function CivilizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const params = await searchParams
  const activeTab = params.type || "all"
  const allCivs = await getAllCivilizations()

  const filteredCivs = activeTab === "all" ? allCivs : allCivs.filter((civ) => civ.type === activeTab)

  const config: DataViewerConfig<Civilization> = {
    itemName: "civilizations",
    searchFields: ["name", "type"],
    searchPlaceholder: "Search civilizations...",

    filters: [],

    sortOptions: [
      {
        key: "name",
        label: "Name",
        sortFn: (a, b) => a.name.localeCompare(b.name),
      },
      {
        key: "bonuses",
        label: "Bonus Count",
        sortFn: (a, b) => b.bonuses.length - a.bonuses.length,
      },
    ],

    cardTitle: (civ) => civ.name,
    cardDescription: (civ) => (
      <span className="px-2 py-0.5 text-[9px] font-bold border rounded uppercase tracking-wider">
        {civ.type} Civilization
      </span>
    ),
    cardHeader: (civ) => (
      <div className="relative h-32 bg-muted flex items-center justify-center border-b">
        <img
          src={`/.jpg?height=128&width=300&query=${encodeURIComponent(civ.name + " civilization flag banner")}`}
          alt={civ.name}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute bottom-2 left-3">
          <Crown className="h-6 w-6" />
        </div>
      </div>
    ),
    cardContent: (civ) => (
      <>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1.5 font-bold flex items-center gap-1">
            <Users className="h-3 w-3" />
            Strengths
          </p>
          <div className="flex flex-wrap gap-1">
            {civ.strengths.slice(0, 3).map((strength) => (
              <span key={strength} className="px-2 py-0.5 text-[9px] font-bold border rounded uppercase tracking-wide">
                {strength}
              </span>
            ))}
          </div>
        </div>
        <div className="p-2 border">
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide mb-1">Team Bonus</p>
          <p className="text-[10px] leading-tight line-clamp-2">{civ.teamBonus}</p>
        </div>
      </>
    ),

    tableColumns: [
      {
        key: "name",
        header: "CIVILIZATION",
        sortable: true,
        render: (civ) => (
          <div>
            <div className="font-bold flex items-center gap-2 uppercase">
              <Crown className="h-3 w-3" />
              {civ.name}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              <span className="px-1.5 py-0.5 border rounded uppercase">{civ.type}</span>
            </div>
          </div>
        ),
      },
      {
        key: "strengths",
        header: "STRENGTHS",
        render: (civ) => (
          <div className="flex flex-wrap gap-1">
            {civ.strengths.slice(0, 3).map((strength) => (
              <span key={strength} className="px-1.5 py-0.5 text-[10px] border rounded uppercase tracking-wide">
                {strength}
              </span>
            ))}
          </div>
        ),
      },
      {
        key: "bonuses",
        header: "KEY BONUSES",
        render: (civ) => (
          <div className="text-[10px] space-y-0.5 font-mono">
            {civ.bonuses.slice(0, 2).map((bonus) => (
              <div key={bonus.id} className="text-muted-foreground">
                • {bonus.description.substring(0, 50)}...
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "unique",
        header: "UNIQUE",
        render: (civ) => (
          <div className="flex items-center gap-1">
            <Swords className="h-3 w-3" />
            <span className="text-[10px] font-bold font-mono">{civ.uniqueUnits.length}</span>
          </div>
        ),
      },
    ],

    itemLink: (civ) => `/civilizations/${civ.id}`,
  }

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h1 className="text-xl font-mono font-bold uppercase tracking-tight">Civilizations</h1>
                <p className="text-muted-foreground text-[10px] mt-0.5 uppercase tracking-wide">
                  Showing {filteredCivs.length} of {allCivs.length} civilizations
                </p>
              </div>
            </div>

            <DataViewer config={config} data={filteredCivs} defaultView="table" />
          </div>
        </div>
      </div>
    </>
  )
}
```

**Step 2: Update SecondaryNav to handle server-side navigation**

Note: SecondaryNav needs to become a client component that uses URL search params for navigation

**Step 3: Test the page**

Run: `bun run dev`
Navigate to: http://localhost:3000/civilizations
Expected: Page loads with DuckDB data

**Step 4: Commit**

```bash
git add src/app/civilizations/page.tsx
git commit -m "feat: convert civilizations page to server component"
```

---

## Task 10: Update SecondaryNav for Server Component Support

**Files:**
- Modify: `src/components/secondary-nav.tsx`

**Step 1: Read current SecondaryNav implementation**

Run: `cat src/components/secondary-nav.tsx`

**Step 2: Update to use URL search params**

Modify SecondaryNav to use `useRouter` and `useSearchParams` for client-side navigation that works with server components.

```typescript
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface SecondaryNavItem {
  label: string
  value: string
}

interface SecondaryNavProps {
  items: SecondaryNavItem[]
  defaultValue: string
  currentValue?: string
}

export function SecondaryNav({ items, defaultValue, currentValue }: SecondaryNavProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeValue = currentValue || searchParams.get('type') || defaultValue

  const handleValueChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === defaultValue) {
      params.delete('type')
    } else {
      params.set('type', value)
    }
    router.push(`?${params.toString()}`)
  }, [router, searchParams, defaultValue])

  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => handleValueChange(item.value)}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-wide transition-colors ${
                activeValue === item.value
                  ? 'border-b-2 border-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/secondary-nav.tsx
git commit -m "feat: update SecondaryNav for server component support with URL params"
```

---

## Task 11: Convert Units Page to Server Component

**Files:**
- Modify: `src/app/units/page.tsx`

**Step 1: Remove "use client" and make async**

Similar to civilizations page transformation, update to be async server component with searchParams.

**Step 2: Test and commit**

```bash
git add src/app/units/page.tsx
git commit -m "feat: convert units page to server component"
```

---

## Task 12: Convert Buildings Page to Server Component

**Files:**
- Modify: `src/app/buildings/page.tsx`

**Step 1: Remove "use client" and make async**

**Step 2: Test and commit**

```bash
git add src/app/buildings/page.tsx
git commit -m "feat: convert buildings page to server component"
```

---

## Task 13: Convert Technologies Page to Server Component

**Files:**
- Modify: `src/app/technologies/page.tsx`

**Step 1: Remove "use client" and make async**

**Step 2: Test and commit**

```bash
git add src/app/technologies/page.tsx
git commit -m "feat: convert technologies page to server component"
```

---

## Task 14: Update DataViewer for Server Component Support

**Files:**
- Modify: `src/components/data-viewer.tsx`

**Step 1: Check if DataViewer uses client-side state**

DataViewer likely uses useState for search, filters, and view toggling. It should remain a client component, but receive pre-filtered data from server.

**Step 2: Ensure proper "use client" directive**

Verify DataViewer has "use client" at the top.

**Step 3: Commit if changes made**

```bash
git add src/components/data-viewer.tsx
git commit -m "fix: ensure DataViewer is properly marked as client component"
```

---

## Task 15: Convert Individual Entity Pages to Server Components

**Files:**
- Modify: `src/app/civilizations/[id]/page.tsx`
- Modify: `src/app/units/[id]/page.tsx`
- Modify: `src/app/buildings/[id]/page.tsx`
- Modify: `src/app/technologies/[id]/page.tsx`

**Step 1: Update civilization detail page**

Make it async, fetch data server-side using `getCivilizationById(params.id)`.

**Step 2: Update other detail pages similarly**

**Step 3: Test all detail pages**

**Step 4: Commit**

```bash
git add src/app/civilizations/[id]/page.tsx src/app/units/[id]/page.tsx src/app/buildings/[id]/page.tsx src/app/technologies/[id]/page.tsx
git commit -m "feat: convert all detail pages to server components"
```

---

## Task 16: Update Image Paths Throughout Application

**Files:**
- Modify: All pages using placeholder images

**Step 1: Replace placeholder image URLs**

Find all instances of:
```typescript
src={`/.jpg?height=...`}
```

Replace with actual image paths from database:
```typescript
src={`/img/${entityType}/${entity.id}.webp`}
```

**Step 2: Add fallback image handling**

Create a utility function for image paths with fallbacks.

**Step 3: Test image loading**

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: update image paths to use export/img assets"
```

---

## Task 17: Add Database Connection Caching and Error Handling

**Files:**
- Modify: `src/lib/db/connection.ts`

**Step 1: Add better error handling**

Wrap connection logic in try-catch, add logging.

**Step 2: Add connection retry logic**

**Step 3: Add graceful degradation**

If DuckDB fails, fall back to mock data with warning.

**Step 4: Test error scenarios**

**Step 5: Commit**

```bash
git add src/lib/db/connection.ts
git commit -m "feat: add error handling and connection caching to DuckDB layer"
```

---

## Task 18: Performance Optimization - Add React Cache

**Files:**
- Modify: `src/lib/db/queries/civilizations.ts`
- Modify: `src/lib/db/queries/units.ts`
- Modify: `src/lib/db/queries/buildings.ts`
- Modify: `src/lib/db/queries/technologies.ts`

**Step 1: Wrap query functions with React cache**

```typescript
import { cache } from 'react'

export const getAllCivilizations = cache(async function(): Promise<Civilization[]> {
  // ... existing implementation
})
```

**Step 2: Test caching behavior**

**Step 3: Commit**

```bash
git add src/lib/db/queries/
git commit -m "perf: add React cache to DuckDB queries for deduplication"
```

---

## Task 19: Add Development Database Inspection Tool

**Files:**
- Create: `src/app/api/db-inspect/route.ts`

**Step 1: Create API route for database inspection**

```typescript
import { getConnection } from '@/lib/db/connection'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  }

  try {
    const conn = await getConnection()
    const reader = await conn.runAndReadAll(query)
    const data = reader.getRowObjects()

    return NextResponse.json({ data, count: data.length })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
```

**Step 2: Test API route**

Visit: http://localhost:3000/api/db-inspect?query=SELECT COUNT(*) FROM civilizations

**Step 3: Commit**

```bash
git add src/app/api/db-inspect/route.ts
git commit -m "dev: add database inspection API route for development"
```

---

## Task 20: Update README with DuckDB Information

**Files:**
- Modify: `README.md` (if exists) or Create: `docs/ARCHITECTURE.md`

**Step 1: Document DuckDB integration**

Add section explaining:
- How DuckDB is used
- Parquet file structure
- How to query the database
- How to add new data sources

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add DuckDB integration documentation"
```

---

## Final Task: Test Complete Application

**Step 1: Run full build**

Run: `bun run build`
Expected: No errors, successful build

**Step 2: Test all pages**

- [ ] Civilizations list page
- [ ] Civilization detail pages
- [ ] Units list page
- [ ] Unit detail pages
- [ ] Buildings list page
- [ ] Building detail pages
- [ ] Technologies list page
- [ ] Technology detail pages
- [ ] Maps page (still using mock data)

**Step 3: Verify SSR**

View page source to confirm data is rendered server-side.

**Step 4: Check performance**

Measure initial page load, check for server-side rendering.

**Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete DuckDB integration with SSR for all entity types"
```

---

## Notes for Implementation

### Data Mapping Challenges

The parquet data is normalized database tables with numeric IDs and minimal metadata. The current TypeScript types expect rich objects with descriptions, bonuses, counters, etc. You'll need to:

1. **Supplement DuckDB data**: Either enrich the parquet files or maintain a hybrid approach where core stats come from DuckDB and rich metadata comes from JSON or TypeScript files.

2. **Handle missing data gracefully**: Use empty arrays, undefined values, or placeholder text where data isn't available in parquet files.

3. **Consider data enrichment step**: You may want to create a data processing step that combines parquet data with supplementary JSON to create fully-populated entities.

### Client vs Server Component Strategy

- **Server Components**: All listing pages, detail pages (for initial render)
- **Client Components**: Interactive elements (DataViewer, SecondaryNav, search, filters, view toggles)
- **Hybrid Pattern**: Server component wraps client component, passing pre-fetched data as props

### Image Serving Strategy

Two options:
1. **Symbolic link**: `ln -s ../export/img public/img` (simple, but may not work in all deployment environments)
2. **Next.js rewrites**: Configure in `next.config.ts` (more robust, works everywhere)

Recommend using rewrites for production reliability.
