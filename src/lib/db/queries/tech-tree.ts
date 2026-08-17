import { cache } from "react"
import { ageFromId, techTreeColumnRank, techTreeColumns } from "@/lib/game/classes"
import type { Age, Building, Civilization, Technology, TechTreeKind, TechTreeNode, Unit, UnitCost } from "@/lib/types"
import { queryRows } from "../connection"
import { getAllBuildings } from "./buildings"
import { getCivilizationById } from "./civilizations"
import { getAllTechnologies } from "./technologies"
import { getAllUnits } from "./units"

interface CivEntityRow {
  entity_type: string
  entity_id: number
  age: number
}

/** Everything one civ can train, build and research, with the age it unlocks. */
export interface CivTechTree {
  civ: Civilization
  units: { entity: Unit; age: Age }[]
  buildings: { entity: Building; age: Age }[]
  techs: { entity: Technology; age: Age }[]
  /** The same entities as a hierarchy: one root per tech tree column. */
  roots: TechTreeNode[]
}

interface NodeLinkRow {
  entity_type: string
  entity_id: number
  building_id: number | null
  upgrades_from_id: number | null
}

interface NodeLink {
  /** The column (building) this node is drawn in. */
  buildingId: string | null
  /** The node this one upgrades from, within the same entity type. */
  upgradesFrom: string | null
}

const NODE_LINKS_SQL = `SELECT entity_type, entity_id, building_id, upgrades_from_id FROM node_types`

const nodeKey = (kind: TechTreeKind, id: string) => `${kind}:${id}`

const KIND_ORDER: Record<TechTreeKind, number> = { unit: 0, building: 1, tech: 2 }
const AGE_ORDER: Record<Age, number> = { Dark: 0, Feudal: 1, Castle: 2, Imperial: 3 }

const RESOURCE_LABELS: [keyof UnitCost, string][] = [
  ["food", "F"],
  ["wood", "W"],
  ["gold", "G"],
  ["stone", "S"],
]

function formatCost(cost: UnitCost): string {
  const parts = RESOURCE_LABELS.filter(([key]) => (cost[key] ?? 0) > 0).map(([key, short]) => `${cost[key]}${short}`)
  return parts.length > 0 ? parts.join(" ") : "Free"
}

/**
 * Parent of a node: whatever it upgrades from if the civ has that too,
 * otherwise the building it is trained at, built from or researched in. A
 * building that heads its own column has no parent — it is a root.
 */
function resolveParent(key: string, link: NodeLink | undefined, present: Set<string>): string | null {
  if (!link) return null
  const [kind, id] = key.split(":")
  if (link.upgradesFrom) {
    const parent = nodeKey(kind as TechTreeKind, link.upgradesFrom)
    if (parent !== key && present.has(parent)) return parent
  }
  for (const column of techTreeColumns(kind, Number(id), link.buildingId === null ? null : Number(link.buildingId))) {
    const parent = nodeKey("building", String(column))
    if (parent === key) return null
    if (present.has(parent)) return parent
  }
  return null
}

/**
 * Guard against a loop in the upstream links. Walking up from every node, the
 * edge that closes a cycle is dropped so that node becomes a root and its
 * descendants stay where they are.
 */
function withoutCycles(parents: Map<string, string>): Map<string, string> {
  const safe = new Map(parents)
  for (const key of parents.keys()) {
    const path = new Set([key])
    let cursor = safe.get(key)
    while (cursor !== undefined) {
      if (path.has(cursor)) {
        safe.delete(cursor)
        break
      }
      path.add(cursor)
      cursor = safe.get(cursor)
    }
  }
  return safe
}

function sortNodes(nodes: TechTreeNode[], rankOf: (node: TechTreeNode) => number): void {
  nodes.sort(
    (a, b) =>
      rankOf(a) - rankOf(b) ||
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
      AGE_ORDER[a.age] - AGE_ORDER[b.age] ||
      a.name.localeCompare(b.name),
  )
  for (const node of nodes) sortNodes(node.children, () => 0)
}

function buildRoots(tree: Omit<CivTechTree, "roots">, links: Map<string, NodeLink>): TechTreeNode[] {
  const flat: TechTreeNode[] = [
    ...tree.units.map(({ entity, age }) => ({
      id: entity.id,
      kind: "unit" as const,
      name: entity.name,
      age,
      detail: `${entity.type} · ${entity.stats.hp} HP · ${entity.stats.attack} atk`,
      unique: entity.civSpecific === tree.civ.id,
      image_path: entity.image_path ?? null,
      children: [],
    })),
    ...tree.buildings.map(({ entity, age }) => ({
      id: entity.id,
      kind: "building" as const,
      name: entity.name,
      age,
      detail: `${entity.type} · ${entity.hitPoints} HP`,
      unique: false,
      image_path: entity.image_path ?? null,
      children: [],
    })),
    ...tree.techs.map(({ entity, age }) => ({
      id: entity.id,
      kind: "tech" as const,
      name: entity.name,
      age,
      detail: formatCost(entity.cost),
      unique: entity.civSpecific === tree.civ.id,
      image_path: entity.image_path ?? null,
      children: [],
    })),
  ]

  const byKey = new Map(flat.map((node) => [nodeKey(node.kind, node.id), node]))
  const parents = new Map<string, string>()
  for (const [key] of byKey) {
    const parent = resolveParent(key, links.get(key), new Set(byKey.keys()))
    if (parent) parents.set(key, parent)
  }

  const roots: TechTreeNode[] = []
  const resolved = withoutCycles(parents)
  for (const [key, node] of byKey) {
    const parent = resolved.get(key)
    if (parent) byKey.get(parent)?.children.push(node)
    else roots.push(node)
  }

  // Roots follow the in-game column order; everything below sorts by age.
  sortNodes(roots, (node) => (node.kind === "building" ? techTreeColumnRank(Number(node.id)) : Number.MAX_SAFE_INTEGER))
  return roots
}

const CIV_ENTITIES_SQL = (civName: string) => `
  SELECT 'unit' AS entity_type, unit_id AS entity_id, age FROM civ_units WHERE civ_name = '${civName}'
  UNION ALL
  SELECT 'building', building_id, age FROM civ_buildings WHERE civ_name = '${civName}'
  UNION ALL
  SELECT 'tech', tech_id, age FROM civ_techs WHERE civ_name = '${civName}'
`

export const getCivTechTree = cache(async (id: string): Promise<CivTechTree | null> => {
  const civ = await getCivilizationById(id)
  if (!civ) return null

  const rows = await queryRows<CivEntityRow>(CIV_ENTITIES_SQL(civ.name.replace(/'/g, "''")))
  const [units, buildings, techs, linkRows] = await Promise.all([
    getAllUnits(),
    getAllBuildings(),
    getAllTechnologies(),
    queryRows<NodeLinkRow>(NODE_LINKS_SQL),
  ])

  const ages = new Map(rows.map((row) => [`${row.entity_type}:${row.entity_id}`, ageFromId(row.age)]))
  const pick = <T extends { id: string }>(items: T[], kind: string) =>
    items
      .filter((item) => ages.has(`${kind}:${item.id}`))
      .map((entity) => ({ entity, age: ages.get(`${kind}:${entity.id}`) as Age }))

  const links = new Map<string, NodeLink>(
    linkRows.map((row) => [
      `${row.entity_type}:${row.entity_id}`,
      {
        buildingId: row.building_id !== null ? String(row.building_id) : null,
        upgradesFrom: row.upgrades_from_id !== null ? String(row.upgrades_from_id) : null,
      },
    ]),
  )

  const flat = {
    civ,
    units: pick(units, "unit"),
    buildings: pick(buildings, "building"),
    techs: pick(techs, "tech"),
  }
  return { ...flat, roots: buildRoots(flat, links) }
})

export interface CivComparison {
  a: Civilization
  b: Civilization
  onlyA: { units: Unit[]; techs: Technology[]; buildings: Building[] }
  onlyB: { units: Unit[]; techs: Technology[]; buildings: Building[] }
}

/** Set difference between two civs' tech trees. */
export const compareCivilizations = cache(async (idA: string, idB: string): Promise<CivComparison | null> => {
  const [treeA, treeB] = await Promise.all([getCivTechTree(idA), getCivTechTree(idB)])
  if (!treeA || !treeB) return null

  const idsOf = (tree: CivTechTree, kind: "units" | "buildings" | "techs") =>
    new Set(tree[kind].map((item) => item.entity.id))

  const diff = <T extends { id: string }>(from: { entity: T }[], other: Set<string>) =>
    from.filter((item) => !other.has(item.entity.id)).map((item) => item.entity)

  return {
    a: treeA.civ,
    b: treeB.civ,
    onlyA: {
      units: diff(treeA.units, idsOf(treeB, "units")),
      techs: diff(treeA.techs, idsOf(treeB, "techs")),
      buildings: diff(treeA.buildings, idsOf(treeB, "buildings")),
    },
    onlyB: {
      units: diff(treeB.units, idsOf(treeA, "units")),
      techs: diff(treeB.techs, idsOf(treeA, "techs")),
      buildings: diff(treeB.buildings, idsOf(treeA, "buildings")),
    },
  }
})
