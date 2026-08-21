/**
 * Where each kind of entity lives. Every link in the app and every URL in the
 * sitemap goes through here, so the canonical form is decided in one place
 * instead of being spelled out at 20 call sites.
 */
import { entityPath, entitySegment } from "@/lib/game/ids"

export const unitHref = (unit: { id: string; name: string }) => entityPath("/units", unit.id, unit.name)

export const buildingHref = (building: { id: string; name: string }) =>
  entityPath("/buildings", building.id, building.name)

export const technologyHref = (tech: { id: string; name: string }) => entityPath("/technologies", tech.id, tech.name)

export const civilizationHref = (civ: { id: string; name: string }) => entityPath("/civilizations", civ.id, civ.name)

/** The `[id]` route param for an entity — the same value the href ends in. */
export const entityParam = (entity: { id: string; name: string }) => entitySegment(entity.id, entity.name)

/**
 * The full set of params a detail route prerenders. These routes set
 * `dynamicParams = false`, which is what makes an unknown id a real 404: the
 * app streams a `loading.tsx` shell, and once those bytes are out the status
 * line is already sent — a `notFound()` after that renders the not-found body
 * under a 200, which is exactly the soft 404 that gets a page dropped from an
 * index. Bare numeric ids are redirected to these by `next.config.ts`.
 */
export function entityParams(entity: { id: string; name: string }): { id: string }[] {
  return [{ id: entityParam(entity) }]
}
