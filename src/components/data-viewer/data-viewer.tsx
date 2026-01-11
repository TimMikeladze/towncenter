"use client"

import { useState, useMemo, useEffect } from "react"
import { LayoutGrid, TableIcon, Search, Filter, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { DataCard } from "./data-card"
import { DataTable } from "./data-table"
import type { DataViewerConfig, ViewMode, DataItem } from "./types"

interface DataViewerProps<T extends DataItem> {
  config: DataViewerConfig<T>
  data: T[]
  defaultView?: ViewMode
  showViewToggle?: boolean
  showSearch?: boolean
  showFilters?: boolean
}

export function DataViewer<T extends DataItem>({
  config,
  data,
  defaultView = "cards",
  showViewToggle = true,
  showSearch = true,
  showFilters = true,
}: DataViewerProps<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<string | null>(config.sortOptions?.[0]?.key || null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search focus
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("data-search")?.focus()
      }
      // Cmd/Ctrl + T for table view
      if ((e.metaKey || e.ctrlKey) && e.key === "t") {
        e.preventDefault()
        setViewMode("table")
      }
      // Cmd/Ctrl + G for card/grid view
      if ((e.metaKey || e.ctrlKey) && e.key === "g") {
        e.preventDefault()
        setViewMode("cards")
      }
      // Cmd/Ctrl + / for keyboard shortcuts help
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        setShowKeyboardHelp(!showKeyboardHelp)
      }
      // Escape to clear search
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [searchQuery, showKeyboardHelp])

  // Filter data based on search and active filters
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchQuery && config.searchFields) {
      result = result.filter((item) =>
        config.searchFields!.some((field) => {
          const value = item[field]
          return String(value).toLowerCase().includes(searchQuery.toLowerCase())
        }),
      )
    }

    // Apply filters
    if (config.filters) {
      config.filters.forEach((filter) => {
        const activeValue = activeFilters[filter.key]
        if (activeValue && activeValue !== "all") {
          result = result.filter((item) => filter.filterFn(item, activeValue))
        }
      })
    }

    // Apply sorting
    if (sortBy && config.sortOptions) {
      const sortOption = config.sortOptions.find((opt) => opt.key === sortBy)
      if (sortOption) {
        result.sort((a, b) => {
          const comparison = sortOption.sortFn(a, b)
          return sortDirection === "asc" ? comparison : -comparison
        })
      }
    }

    return result
  }, [data, searchQuery, activeFilters, sortBy, sortDirection, config])

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortDirection("asc")
    }
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchQuery("")
  }

  const activeFilterCount = Object.values(activeFilters).filter((v) => v && v !== "all").length + (searchQuery ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 flex-1 md:flex-row md:items-center">
          {/* Search */}
          {showSearch && config.searchFields && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="data-search"
                placeholder={config.searchPlaceholder || "Search..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-2"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="h-5 w-5 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <kbd className="kbd-shortcut">⌘K</kbd>
              </div>
            </div>
          )}

          {/* Sort Controls */}
          {config.sortOptions && config.sortOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy || ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    setSortBy(value)
                  } else {
                    setSortBy(null)
                  }
                }}
                className="text-sm border-2 rounded-md px-3 py-1.5 bg-background"
              >
                <option value="">Sort by...</option>
                {config.sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              {sortBy && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  className="border-2"
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* View Toggle */}
        {showViewToggle && (
          <div className="flex items-center gap-2 border-2 rounded-lg p-1 bg-muted/30">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className={viewMode === "cards" ? "" : "hover:bg-muted"}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cards
              <kbd className="kbd-shortcut ml-1">⌘G</kbd>
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "" : "hover:bg-muted"}
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Table
              <kbd className="kbd-shortcut ml-1">⌘T</kbd>
            </Button>
          </div>
        )}

        {showKeyboardHelp && (
          <Card className="p-3 border text-xs">
            <div className="font-bold mb-2">KEYBOARD SHORTCUTS</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div>
                <kbd className="kbd-shortcut">⌘K</kbd> Focus search
              </div>
              <div>
                <kbd className="kbd-shortcut">⌘T</kbd> Table view
              </div>
              <div>
                <kbd className="kbd-shortcut">⌘G</kbd> Grid view
              </div>
              <div>
                <kbd className="kbd-shortcut">ESC</kbd> Clear search
              </div>
              <div>
                <kbd className="kbd-shortcut">⌘/</kbd> Toggle help
              </div>
            </div>
          </Card>
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
                  onClick={() => handleFilterChange(filter.key, option.value)}
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
            Sorted by {config.sortOptions?.find((o) => o.key === sortBy)?.label} {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>

      {/* Data Display */}
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
