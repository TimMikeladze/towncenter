import type React from "react"
export interface DataItem {
  id: string
  // Configs index items by arbitrary field names, so the value type is open.
  // biome-ignore lint/suspicious/noExplicitAny: generic data viewer contract
  [key: string]: any
}

export type ViewMode = "cards" | "table"

export interface FilterOption {
  label: string
  value: string
}

export interface Filter<T> {
  key: string
  label: string
  options: FilterOption[]
  filterFn: (item: T, value: string) => boolean
}

export interface SortOption<T> {
  key: string
  label: string
  sortFn: (a: T, b: T) => number
}

export interface TableColumn<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  /** Key of an entry in `sortOptions`; a column without one is not sortable. */
  sortKey?: string
  /** Grid track for this column, e.g. "2fr" or "120px". Defaults to "1fr". */
  width?: string
}

export interface DataViewerConfig<T extends DataItem> {
  // General
  itemName?: string // e.g., "units", "civilizations"

  // Search
  searchFields?: (keyof T)[]
  searchPlaceholder?: string

  // Filters
  filters?: Filter<T>[]

  // Sorting
  sortOptions?: SortOption<T>[]

  // Card View
  cardTitle: (item: T) => React.ReactNode
  cardDescription?: (item: T) => React.ReactNode
  cardHeader?: (item: T) => React.ReactNode
  cardContent: (item: T) => React.ReactNode
  cardGridCols?: string // Tailwind grid classes

  // Table View
  tableColumns?: TableColumn<T>[]

  // Navigation
  itemLink?: (item: T) => string
}
