"use client"

import { ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
    return <div className="p-4 text-center text-muted-foreground">Table view not configured</div>
  }

  const gridTemplate = columns.map((column) => column.width || "1fr").join(" ")

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] text-xs">
        <div
          className="grid bg-muted/50 border-b font-mono text-[10px] uppercase tracking-wider"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {columns.map((column) => (
            <div key={column.key} className="px-3 py-2 flex items-center gap-1.5">
              {column.header}
              {column.sortKey && onSort && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSort(column.sortKey as string)}
                  className="h-4 w-4 p-0 hover:bg-foreground/10"
                  aria-label={`Sort by ${column.header}`}
                >
                  <ArrowUpDown className={`h-2.5 w-2.5 ${sortBy === column.sortKey ? "opacity-100" : "opacity-30"}`} />
                </Button>
              )}
              {column.sortKey && sortBy === column.sortKey && (
                <span className="text-[8px]">{sortDirection === "asc" ? "↑" : "↓"}</span>
              )}
            </div>
          ))}
        </div>

        {data.map((item) => {
          const cells = columns.map((column) => (
            <div key={column.key} className="px-3 py-2">
              {column.render(item)}
            </div>
          ))

          return config.itemLink ? (
            <Link
              key={item.id}
              href={config.itemLink(item)}
              className="grid border-b hover:bg-muted/20 transition-colors"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {cells}
            </Link>
          ) : (
            <div key={item.id} className="grid border-b" style={{ gridTemplateColumns: gridTemplate }}>
              {cells}
            </div>
          )
        })}
      </div>
    </div>
  )
}
