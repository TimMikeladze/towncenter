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
      {/*
        The art sits beside the name on a phone, not above it: stacked, an 80px
        square plus a 2-line title pushes the stats — the reason anyone opened
        the page — below the fold.
      */}
      <div className="border-b p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-5">
          <EntityIcon src={image} alt={name} size="xl" className="h-16 w-16 sm:h-24 sm:w-24" />
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="text-2xl leading-tight sm:text-3xl">{name}</h1>
            {meta && <div className="flex flex-wrap items-center gap-1.5">{meta}</div>}
          </div>
        </div>
        {(description || actions) && (
          <div className="mt-3 space-y-3 sm:ml-[calc(6rem+1.25rem)] sm:mt-2">
            {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        )}
      </div>
      {stats && <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4 sm:p-6">{stats}</div>}
    </div>
  )
}
