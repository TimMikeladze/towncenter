"use client"

import { ArrowDownAZ, ArrowUpAZ, LayoutGrid, Rows3, Search, SlidersHorizontal, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useMemo } from "react"
import { EmptyState } from "@/components/game/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Rail } from "@/components/ui/rail"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
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

  const hasActiveFilters = Object.values(activeFilters).some((value) => value !== "all") || searchQuery !== ""

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
    if (sortBy === key) setParams({ dir: sortDirection === "asc" ? "desc" : "asc" })
    else setParams({ sort: key, dir: "asc" })
  }

  const clearAll = () => {
    const cleared: Record<string, string | null> = { q: null }
    for (const filter of config.filters ?? []) cleared[filter.key] = null
    setParams(cleared)
  }

  return (
    <div className="space-y-3">
      <div className="panel space-y-2.5 p-2.5 sm:space-y-3 sm:p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {showSearch && config.searchFields && (
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="data-search"
                type="search"
                placeholder={config.searchPlaceholder || "Search..."}
                value={searchQuery}
                onChange={(event) => setParams({ q: event.target.value })}
                className="h-11 pl-9 pr-10 sm:h-10"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="search"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setParams({ q: null })}
                  className="press absolute right-1 top-1/2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {config.sortOptions && config.sortOptions.length > 0 && (
              <>
                <Select value={sortBy ?? ""} onValueChange={(value) => setParams({ sort: value })}>
                  {/* `min-w-0` lets the trigger shrink on a 320px screen rather
                      than pushing the row past the viewport. */}
                  <SelectTrigger
                    className="h-11 w-full min-w-0 flex-1 sm:h-10 sm:w-44 sm:flex-none"
                    aria-label="Sort by"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.sortOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="press h-11 w-11 shrink-0 sm:h-10 sm:w-10"
                  onClick={() => setParams({ dir: sortDirection === "asc" ? "desc" : "asc" })}
                  aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
                >
                  {sortDirection === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
                </Button>
              </>
            )}

            {showViewToggle && (
              <div className="hidden items-center rounded-md border p-0.5 md:flex">
                <Button
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => setParams({ view: "cards" })}
                  aria-pressed={viewMode === "cards"}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden lg:inline">Cards</span>
                </Button>
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-9 gap-1.5"
                  onClick={() => setParams({ view: "table" })}
                  aria-pressed={viewMode === "table"}
                >
                  <Rows3 className="h-4 w-4" />
                  <span className="hidden lg:inline">Table</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {showFilters && config.filters && config.filters.length > 0 && (
          <div className="space-y-2 border-t pt-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:space-y-0">
            {config.filters.map((filter) => (
              <div key={filter.key} className="sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
                <span className="label-caps mb-1.5 flex items-center gap-1 sm:mb-0">
                  <SlidersHorizontal className="h-3 w-3" aria-hidden />
                  {filter.label}
                </span>
                {/*
                  A phone cannot show eight filter chips in a row, and wrapping
                  them turns the toolbar into half a screen. They scroll
                  sideways inside their own rail instead, flush to the gutter.
                */}
                <Rail className="-mx-2.5 gap-1.5 px-2.5 sm:mx-0 sm:contents sm:px-0">
                  {filter.options.map((option) => {
                    const active = activeFilters[filter.key] === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          haptic("tick")
                          setParams({ [filter.key]: option.value })
                        }}
                        aria-pressed={active}
                        className={cn(
                          "press h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors",
                          active
                            ? "border-primary/50 bg-primary/12 text-primary"
                            : "border-border text-muted-foreground md:hover:bg-muted md:hover:text-foreground",
                        )}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </Rail>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-0.5 text-xs text-muted-foreground">
        <span className="tabular">
          {filteredData.length} of {data.length} {config.itemName || "items"}
        </span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="press -my-1 h-8 gap-1 text-xs" onClick={clearAll}>
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {filteredData.length === 0 ? (
        <EmptyState
          title={`No ${config.itemName || "items"} found`}
          description="Try a different search term or clear the active filters."
          icon={Search}
          action={
            hasActiveFilters ? (
              <Button variant="outline" size="sm" className="mt-2" onClick={clearAll}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : viewMode === "table" ? (
        <div className="panel overflow-hidden">
          <DataTable
            data={filteredData}
            config={config}
            onSort={toggleSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
          />
        </div>
      ) : (
        <div
          // `stagger-grid` animates the first screenful in as a wave. It runs
          // again whenever a filter creates new rows, which is what makes a
          // filter change read as the list reloading rather than as a redraw.
          className={cn(
            "stagger-grid grid gap-2 sm:gap-3",
            config.cardGridCols || "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          )}
        >
          {filteredData.map((item) => (
            <DataCard key={item.id} item={item} config={config} />
          ))}
        </div>
      )}
    </div>
  )
}
