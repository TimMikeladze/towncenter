import type React from "react"
export interface DataItem {
  id: string
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
  sortable?: boolean
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
