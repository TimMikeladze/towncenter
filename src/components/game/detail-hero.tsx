import type React from "react"
import { EntityIcon } from "@/components/game/entity-icon"

/**
 * Shared masthead for unit / civ / building / tech detail pages: art, name,
 * taxonomy chips, blurb, and a row of quick stats.
 */
export function DetailHero({
  name,
  image,
  meta,
  description,
  stats,
  actions,
}: {
  name: string
  image?: string | null
  meta?: React.ReactNode
  description?: React.ReactNode
  stats?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-6">
        <EntityIcon src={image} alt={name} size="xl" className="h-20 w-20 sm:h-24 sm:w-24" />
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-2xl leading-tight sm:text-3xl">{name}</h1>
          {meta && <div className="flex flex-wrap items-center gap-1.5">{meta}</div>}
          {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
          {actions && <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div>}
        </div>
      </div>
      {stats && <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4 sm:p-6">{stats}</div>}
    </div>
  )
}
