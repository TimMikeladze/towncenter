/** Civilizations are keyed by name upstream; URLs use a slug. */
export function civId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-")
}

/** Lowercase, hyphens, nothing else — safe in a path segment and readable in a SERP. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Units, buildings and technologies are keyed by the game's numeric ids, which
 * make for URLs that say nothing — `/units/74` tells neither a reader nor a
 * crawler that the page is about the Knight. The id stays in front so the URL
 * is still unique (15 unit names collide upstream, mostly elite variants) and
 * every old numeric link keeps resolving; the slug rides behind it for the
 * keyword. Civilizations already have name-shaped ids and are left alone.
 */
export function entitySegment(id: string, name: string): string {
  if (!/^\d+$/.test(id)) return id
  const slug = slugify(name)
  return slug ? `${id}-${slug}` : id
}

export function entityPath(base: string, id: string, name: string): string {
  return `${base}/${entitySegment(id, name)}`
}

/**
 * The inverse, applied to the route param. `74-knight`, `74` and a stale
 * `74-old-name` all resolve to the same entity, so a rename upstream never
 * breaks a link that is already out in the world.
 */
export function entityIdFromParam(param: string): string {
  const decoded = decodeURIComponent(param)
  const numeric = decoded.match(/^(\d+)(?:-.*)?$/)
  return numeric ? numeric[1] : decoded
}
