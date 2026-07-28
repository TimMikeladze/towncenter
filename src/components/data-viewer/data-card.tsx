import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { DataItem, DataViewerConfig } from "./types"

interface DataCardProps<T extends DataItem> {
  item: T
  config: DataViewerConfig<T>
}

/**
 * One card shape for units, civs, buildings, techs and maps: media strip,
 * title + taxonomy, then whatever the page's config puts in the body.
 */
export function DataCard<T extends DataItem>({ item, config }: DataCardProps<T>) {
  const href = config.itemLink?.(item)

  const body = (
    <article
      className={cn("panel flex h-full flex-col overflow-hidden", href && "panel-interactive group cursor-pointer")}
    >
      {config.cardHeader?.(item)}

      <div className="flex items-start justify-between gap-2 px-3.5 pt-3">
        <div className="min-w-0 space-y-1.5">
          <h3 className="truncate font-display text-[15px] font-semibold leading-tight">{config.cardTitle(item)}</h3>
          {config.cardDescription && (
            <div className="flex flex-wrap items-center gap-1.5">{config.cardDescription(item)}</div>
          )}
        </div>
        {href && (
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-3.5 pb-3.5 pt-2.5 text-sm">{config.cardContent(item)}</div>
    </article>
  )

  return href ? (
    <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {body}
    </Link>
  ) : (
    body
  )
}
