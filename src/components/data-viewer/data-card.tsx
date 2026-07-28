import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { DataItem, DataViewerConfig } from "./types"

interface DataCardProps<T extends DataItem> {
  item: T
  config: DataViewerConfig<T>
}

/**
 * One shape for units, civs, buildings, techs and maps — in two orientations.
 *
 * A phone gets a **row**: art in a fixed leading column, everything else
 * beside it. A full-bleed art strip above the title is a desktop idea; on a
 * 390px screen it costs an entire viewport per item, which turns a 245-unit
 * list into 245 screens of scrolling. From `md` up the art goes back on top
 * and the card reads as a card.
 */
export function DataCard<T extends DataItem>({ item, config }: DataCardProps<T>) {
  const href = config.itemLink?.(item)
  const media = config.cardMedia?.(item)

  const body = (
    <article
      className={cn(
        "panel flex h-full overflow-hidden max-md:flex-row md:flex-col",
        href && "panel-interactive group cursor-pointer",
      )}
    >
      {media && (
        <div className="flex shrink-0 justify-center bg-muted/40 max-md:w-[4.75rem] max-md:items-start max-md:border-r max-md:pt-3 md:items-center md:border-b md:py-4">
          {media}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2 px-3 pt-2.5 md:px-3.5 md:pt-3">
          <div className="min-w-0 space-y-1.5">
            <h3 className="truncate font-display text-[15px] font-semibold leading-tight">{config.cardTitle(item)}</h3>
            {config.cardDescription && (
              <div className="flex flex-wrap items-center gap-1.5">{config.cardDescription(item)}</div>
            )}
          </div>
          {href && (
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform md:group-hover:translate-x-0.5" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-2 text-sm md:gap-2.5 md:px-3.5 md:pb-3.5 md:pt-2.5">
          {config.cardContent(item)}
        </div>
      </div>
    </article>
  )

  return href ? (
    <Link
      href={href}
      className="press block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {body}
    </Link>
  ) : (
    body
  )
}
