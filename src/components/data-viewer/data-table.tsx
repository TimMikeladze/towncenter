"use client"

import type React from "react"
import Link from "next/link"
import type { DataViewerConfig, DataItem } from "./types"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataTableProps<T extends DataItem> {
  data: T[]
  config: DataViewerConfig<T>
  onSort?: (key: string) => void
  sortBy?: string | null
  sortDirection?: "asc" | "desc"
}

export function DataTable<T extends DataItem>({ data, config, onSort, sortBy, sortDirection }: DataTableProps<T>) {
  if (!config.tableColumns) {
    return <div className="p-4 text-center text-muted-foreground">Table view not configured</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 border-b">
          <tr>
            {config.tableColumns.map((column) => (
              <th key={column.key} className="text-left px-3 py-2 font-mono text-[10px] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  {column.header}
                  {column.sortable && onSort && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSort(column.key)}
                      className="h-4 w-4 p-0 hover:bg-foreground/10"
                    >
                      <ArrowUpDown className={`h-2.5 w-2.5 ${sortBy === column.key ? "opacity-100" : "opacity-30"}`} />
                    </Button>
                  )}
                  {sortBy === column.key && <span className="text-[8px]">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const RowWrapper = config.itemLink
              ? ({ children }: { children: React.ReactNode }) => (
                  <tr className="border-b hover:bg-muted/20 transition-colors cursor-pointer">
                    <td colSpan={config.tableColumns!.length} className="p-0">
                      <Link href={config.itemLink!(item)} className="block">
                        <table className="w-full">
                          <tbody>
                            <tr>{children}</tr>
                          </tbody>
                        </table>
                      </Link>
                    </td>
                  </tr>
                )
              : ({ children }: { children: React.ReactNode }) => (
                  <tr className="border-b hover:bg-muted/20 transition-colors">{children}</tr>
                )

            return (
              <RowWrapper key={item.id}>
                {config.tableColumns!.map((column) => (
                  <td key={column.key} className="px-3 py-2">
                    {column.render(item)}
                  </td>
                ))}
              </RowWrapper>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
