"use client"

import { Filter, LayoutGrid, Search, TableIcon, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DataCard } from "./data-card"
import { DataTable } from "./data-table"
import type { DataItem, DataViewerConfig, ViewMode } from "./types"

interface DataViewerProps<T extends DataItem> {
  config: DataViewerConfig<T>
  data: T[]
  defaultView?: ViewMode
  showViewToggle?: boolean
  showSearch?: boolean
  showFilters?: boolean
}

export function DataViewer<T extends DataItem>(props: DataViewerProps<T>) {
  return (
    <Suspense fallback={null}>
      <DataViewerInner {...props} />
    </Suspense>
  )
}

function DataViewerInner<T extends DataItem>({
  config,
  data,
  defaultView = "cards",
  showViewToggle = true,
  showSearch = true,
  showFilters = true,
}: DataViewerProps<T>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Every control lives in the URL, so any view is shareable and the back
  // button works.
  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") next.delete(key)
        else next.set(key, value)
      }
      const query = next.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const searchQuery = searchParams.get("q") ?? ""
  const viewMode = (searchParams.get("view") as ViewMode | null) ?? defaultView
  const sortBy = searchParams.get("sort") ?? config.sortOptions?.[0]?.key ?? null
  const sortDirection = searchParams.get("dir") === "desc" ? "desc" : "asc"

  const activeFilters = useMemo(() => {
    const values: Record<string, string> = {}
    for (const filter of config.filters ?? []) {
      values[filter.key] = searchParams.get(filter.key) ?? "all"
    }
    return values
  }, [config.filters, searchParams])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "t") {
        event.preventDefault()
        setParams({ view: "table" })
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "g") {
        event.preventDefault()
        setParams({ view: "cards" })
      }
      if (event.key === "Escape" && searchQuery) {
        setParams({ q: null })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [searchQuery, setParams])

  const filteredData = useMemo(() => {
    let result = [...data]

    if (searchQuery && config.searchFields) {
      const needle = searchQuery.toLowerCase()
      result = result.filter((item) =>
        (config.searchFields ?? []).some((field) => String(item[field]).toLowerCase().includes(needle)),
      )
    }

    for (const filter of config.filters ?? []) {
      const value = activeFilters[filter.key]
      if (value && value !== "all") {
        result = result.filter((item) => filter.filterFn(item, value))
      }
    }

    if (sortBy && config.sortOptions) {
      const sortOption = config.sortOptions.find((option) => option.key === sortBy)
      if (sortOption) {
        result.sort((a, b) => {
          const comparison = sortOption.sortFn(a, b)
          return sortDirection === "asc" ? comparison : -comparison
        })
      }
    }

    return result
  }, [data, searchQuery, activeFilters, sortBy, sortDirection, config])

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setParams({ dir: sortDirection === "asc" ? "desc" : "asc" })
    } else {
      setParams({ sort: key, dir: "asc" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 flex-1 md:flex-row md:items-center">
          {showSearch && config.searchFields && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="data-search"
                placeholder={config.searchPlaceholder || "Search..."}
                value={searchQuery}
                onChange={(event) => setParams({ q: event.target.value })}
                className="pl-9 border-2"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setParams({ q: null })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 p-0"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {config.sortOptions && config.sortOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={sortBy ?? ""}
                onChange={(event) => setParams({ sort: event.target.value || null })}
                className="text-sm border-2 rounded-md px-3 py-1.5 bg-background"
                aria-label="Sort by"
              >
                {config.sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams({ dir: sortDirection === "asc" ? "desc" : "asc" })}
                className="border-2"
                aria-label="Toggle sort direction"
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          )}
        </div>

        {showViewToggle && (
          <div className="flex items-center gap-2 border-2 rounded-lg p-1 bg-muted/30">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setParams({ view: "cards" })}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cards
              <kbd className="kbd-shortcut ml-1">⌘G</kbd>
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setParams({ view: "table" })}
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Table
              <kbd className="kbd-shortcut ml-1">⌘T</kbd>
            </Button>
          </div>
        )}
      </div>

      {showFilters && config.filters && config.filters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center border-t border-b py-2">
          <Filter className="h-3 w-3 mr-1" />
          {config.filters.map((filter) => (
            <div key={filter.key} className="flex flex-wrap gap-1">
              {filter.options.map((option) => (
                <Button
                  key={option.value}
                  variant={activeFilters[filter.key] === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setParams({ [filter.key]: option.value })}
                  className="h-6 px-2 text-[10px] font-mono uppercase"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredData.length} of {data.length} {config.itemName || "items"}
        </span>
        {sortBy && (
          <span>
            Sorted by {config.sortOptions?.find((option) => option.key === sortBy)?.label}{" "}
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>

      {filteredData.length > 0 ? (
        viewMode === "cards" ? (
          <div className={`grid gap-4 ${config.cardGridCols || "md:grid-cols-2 lg:grid-cols-3"}`}>
            {filteredData.map((item) => (
              <DataCard key={item.id} item={item} config={config} />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden border-2">
            <DataTable
              data={filteredData}
              config={config}
              onSort={toggleSort}
              sortBy={sortBy}
              sortDirection={sortDirection}
            />
          </Card>
        )
      ) : (
        <Card className="p-12 text-center border-2">
          <p className="text-muted-foreground">No {config.itemName || "items"} found matching your criteria</p>
        </Card>
      )}
    </div>
  )
}
