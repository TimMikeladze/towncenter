import fs from "node:fs"
import path from "node:path"
import type { MetadataRoute } from "next"
import { getAllBuildings, getAllCivilizations, getAllTechnologies, getAllUnits } from "@/lib/data"
import { buildingHref, civilizationHref, technologyHref, unitHref } from "@/lib/hrefs"
import { absoluteUrl } from "@/lib/seo"

/**
 * Nothing here changes between deploys, so the sitemap is generated once at
 * build time rather than on every crawl.
 */
export const dynamic = "force-static"

/**
 * The game data is the only thing on this site that ever changes, and it
 * changes when the parquet export is regenerated. Reporting that date is
 * honest; reporting the build date would tell crawlers every page changed
 * every time a button got restyled.
 */
function dataExportedAt(): Date {
  try {
    return fs.statSync(path.join(process.cwd(), "export", "parquet", "units.parquet")).mtime
  } catch {
    return new Date()
  }
}

/** The routes that are not one entity: the front page and the tools. */
const STATIC_ROUTES: {
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
}[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/units", priority: 0.9, changeFrequency: "weekly" },
  { path: "/civilizations", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tech-tree", priority: 0.8, changeFrequency: "weekly" },
  { path: "/buildings", priority: 0.8, changeFrequency: "weekly" },
  { path: "/technologies", priority: 0.8, changeFrequency: "weekly" },
  { path: "/counters", priority: 0.8, changeFrequency: "weekly" },
  { path: "/battle", priority: 0.7, changeFrequency: "monthly" },
  { path: "/compare", priority: 0.7, changeFrequency: "monthly" },
  { path: "/civilizations/compare", priority: 0.6, changeFrequency: "monthly" },
  { path: "/changes", priority: 0.6, changeFrequency: "weekly" },
  { path: "/about", priority: 0.3, changeFrequency: "yearly" },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [units, civs, buildings, techs] = await Promise.all([
    getAllUnits(),
    getAllCivilizations(),
    getAllBuildings(),
    getAllTechnologies(),
  ])

  const lastModified = dataExportedAt()

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // Civilizations and units are what people search for by name, so they sit
  // above buildings and technologies in priority.
  const entityGroups: [{ id: string; name: string }[], (entity: { id: string; name: string }) => string, number][] = [
    [civs, civilizationHref, 0.8],
    [units, unitHref, 0.7],
    [buildings, buildingHref, 0.6],
    [techs, technologyHref, 0.6],
  ]

  for (const [items, href, priority] of entityGroups) {
    for (const item of items) {
      entries.push({
        url: absoluteUrl(href(item)),
        lastModified,
        changeFrequency: "monthly",
        priority,
      })
    }
  }

  return entries
}
