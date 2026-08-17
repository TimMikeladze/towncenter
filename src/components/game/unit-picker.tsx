"use client"

import { ChevronsUpDown, Plus, Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { TypeBadge } from "@/components/game/badges"
import { EntityIcon } from "@/components/game/entity-icon"
import { Rail } from "@/components/ui/rail"
import { cn } from "@/lib/utils"

export interface PickableUnit {
  id: string
  name: string
  type: string
  age?: string
  image_path?: string | null
}

/**
 * Searchable unit chooser. A native select is unusable at 245 options on a
 * phone, so this is a full-screen sheet on small screens and a centered
 * dialog above that.
 */
export function UnitPicker({
  units,
  value,
  onChange,
  label = "Select unit",
  className,
}: {
  units: PickableUnit[]
  value?: PickableUnit
  onChange: (id: string) => void
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [type, setType] = useState("all")
  const inputRef = useRef<HTMLInputElement>(null)

  // "all" is the reset, so it leads. Sorting it in with the rest buried it at
  // the end of the rail, past the edge of the screen, because a lowercase "a"
  // sorts after every capitalised type name.
  const types = useMemo(() => ["all", ...[...new Set(units.map((unit) => unit.type))].sort()], [units])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return units
      .filter((unit) => (type === "all" || unit.type === type) && (!needle || unit.name.toLowerCase().includes(needle)))
      .sort((a, b) => {
        if (!needle) return a.name.localeCompare(b.name)
        const aStarts = a.name.toLowerCase().startsWith(needle) ? 0 : 1
        const bStarts = b.name.toLowerCase().startsWith(needle) ? 0 : 1
        return aStarts - bStarts || a.name.localeCompare(b.name)
      })
      .slice(0, 120)
  }, [units, query, type])

  useEffect(() => {
    if (!open) return
    setQuery("")
    const timer = setTimeout(() => inputRef.current?.focus(), 40)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)

    // The list behind the sheet must not scroll with it.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      clearTimeout(timer)
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "press flex w-full items-center gap-2.5 rounded-md border bg-background/50 px-2.5 py-2 text-left transition-colors active:bg-muted/60 md:hover:bg-muted/60",
          className,
        )}
      >
        {value ? (
          <EntityIcon src={value.image_path} alt="" size="md" />
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-dashed text-muted-foreground">
            <Plus className="h-4 w-4" aria-hidden />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[15px] font-semibold leading-tight">
            {value?.name ?? label}
          </span>
          {value && (
            <span className="mt-1 flex items-center gap-1">
              <TypeBadge type={value.type} />
            </span>
          )}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-100 flex items-start justify-center sm:px-4 sm:pt-[10vh]">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="panel relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-none shadow-raised sm:h-auto sm:max-h-[70vh] sm:max-w-lg sm:rounded-lg"
            style={{ paddingTop: "var(--safe-top)" }}
          >
            <div className="flex shrink-0 items-center gap-2 border-b px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search units…"
                // 16px minimum, or iOS zooms the page on focus.
                className="min-w-0 flex-1 bg-transparent py-3.5 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="search"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="press touch-target -mr-1 grid shrink-0 place-items-center text-muted-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Rail className="shrink-0 gap-1.5 border-b px-3 py-2">
              {types.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  aria-pressed={type === option}
                  className={cn(
                    "press h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors",
                    type === option
                      ? "border-primary/50 bg-primary/12 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {option === "all" ? "All" : option}
                </button>
              ))}
            </Rail>

            <div
              className="scroll-contain min-h-0 flex-1 overflow-y-auto"
              style={{ paddingBottom: "var(--safe-bottom)" }}
            >
              {results.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">No matches</p>
              ) : (
                results.map((unit) => (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => {
                      onChange(unit.id)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 border-b border-border/50 px-3 py-2.5 text-left transition-colors last:border-b-0 active:bg-muted/60",
                      unit.id === value?.id && "bg-accent text-accent-foreground",
                    )}
                  >
                    <EntityIcon src={unit.image_path} alt="" size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{unit.name}</span>
                    <TypeBadge type={unit.type} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
