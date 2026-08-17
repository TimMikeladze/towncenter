"use client"

import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { DataItem, DataViewerConfig } from "./types"

interface DataTableProps<T extends DataItem> {
  data: T[]
  config: DataViewerConfig<T>
  onSort?: (key: string) => void
  sortBy?: string | null
  sortDirection?: "asc" | "desc"
}

/**
 * CSS grid rather than a <table>: rows are links, and every row shares the
 * header's column tracks.
 */
export function DataTable<T extends DataItem>({ data, config, onSort, sortBy, sortDirection }: DataTableProps<T>) {
  const columns = config.tableColumns
  if (!columns) {
    return <div className="p-6 text-center text-sm text-muted-foreground">Table view not configured</div>
  }

  const gridTemplate = columns.map((column) => column.width || "1fr").join(" ")

  return (
    // `scroll-contain` keeps a sideways swipe inside the table instead of
    // handing it to the browser as a back-navigation gesture.
    <div className="scroll-contain overflow-x-auto">
      <div className="min-w-[720px]">
        <div
          className="sticky top-0 z-10 grid border-b bg-muted/70 backdrop-blur"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {columns.map((column) => {
            const sortable = column.sortKey && onSort
            const active = sortBy === column.sortKey
            return (
              <div key={column.key} className="px-3 py-2">
                {sortable ? (
                  <button
                    type="button"
                    onClick={() => onSort?.(column.sortKey as string)}
                    className={cn(
                      "label-caps flex items-center gap-1 transition-colors hover:text-foreground",
                      active && "text-foreground",
                    )}
                  >
                    {column.header}
                    {active ? (
                      sortDirection === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </button>
                ) : (
                  <span className="label-caps">{column.header}</span>
                )}
              </div>
            )
          })}
        </div>

        {data.map((item, index) => {
          const cells = columns.map((column) => (
            <div key={column.key} className="flex min-w-0 items-center px-3 py-2.5 text-sm">
              {column.render(item)}
            </div>
          ))

          const rowClass = cn(
            "grid border-b border-border/60 transition-colors last:border-b-0",
            index % 2 === 1 && "bg-muted/25",
          )

          return config.itemLink ? (
            <Link
              key={item.id}
              href={config.itemLink(item)}
              className={cn(rowClass, "hover:bg-accent/60")}
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {cells}
            </Link>
          ) : (
            <div key={item.id} className={rowClass} style={{ gridTemplateColumns: gridTemplate }}>
              {cells}
            </div>
          )
        })}
      </div>
    </div>
  )
}
