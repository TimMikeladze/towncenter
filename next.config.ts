import fs from "node:fs"
import path from "node:path"
import type { NextConfig } from "next"

const EXPORT_JSON = path.join(process.cwd(), "export", "json")

/** The export writes one JSON object per line. */
function readJsonl<T>(file: string): T[] {
  const raw = fs.readFileSync(path.join(EXPORT_JSON, file), "utf8")
  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T)
}

/**
 * Mirrors `slugify` in `src/lib/game/ids.ts`. Next transpiles this config file
 * alone, so it cannot import from the app — `tests/seo.test.ts` asserts the two
 * stay in step rather than trusting them to.
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface NameRow {
  entity_type: string
  entity_id: number
  name: string
}

interface EntityRow {
  id: number
  internal_name: string
}

/** `/units/74` → `/units/74-knight`, for every entity the export knows about. */
export function legacyIdRedirects() {
  const names = new Map<string, string>()
  for (const row of readJsonl<NameRow>("names.json")) {
    names.set(`${row.entity_type}:${row.entity_id}`, row.name)
  }

  const groups: [string, string, string][] = [
    ["unit", "units", "units.json"],
    ["building", "buildings", "buildings.json"],
    ["tech", "technologies", "techs.json"],
  ]

  return groups.flatMap(([entityType, base, file]) =>
    readJsonl<EntityRow>(file)
      .map((row) => {
        // The app falls back to the internal name the same way when the game
        // ships no display string for an entity.
        const slug = slugify(names.get(`${entityType}:${row.id}`) || row.internal_name)
        return {
          source: `/${base}/${row.id}`,
          destination: slug ? `/${base}/${row.id}-${slug}` : `/${base}/${row.id}`,
          permanent: true,
        }
      })
      // A name that slugs to nothing keeps the bare id as its canonical URL,
      // and a route may not redirect to itself.
      .filter((redirect) => redirect.source !== redirect.destination),
  )
}

const nextConfig: NextConfig = {
  reactCompiler: true,

  // External packages for native modules like DuckDB
  serverExternalPackages: ["@duckdb/node-api", "@duckdb/node-bindings"],

  // Two things tracing cannot infer: the parquet files (read at runtime by
  // path) and libduckdb.so (loaded by the native addon, not required by JS).
  // Without both, every server-rendered page 500s in production.
  outputFileTracingIncludes: {
    "/**": [
      "./export/parquet/**",
      "./node_modules/@duckdb/node-bindings-linux-x64/**",
      "./node_modules/@duckdb/node-bindings-linux-arm64/**",
    ],
  },

  // Empty turbopack config to allow build
  turbopack: {},

  /**
   * Unit, building and technology URLs carry a slug after the game's numeric
   * id. The bare id was the URL before that, and is still what someone types
   * from memory, so each one is a permanent redirect to its canonical form.
   *
   * These are declared here rather than handled inside the page so they answer
   * as a real 308: those routes render a `loading.tsx` shell, and a redirect
   * thrown from inside that Suspense boundary arrives too late to be anything
   * but a client-side one.
   */
  async redirects() {
    return legacyIdRedirects()
  },
}

export default nextConfig
