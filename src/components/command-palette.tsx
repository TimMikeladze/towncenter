"use client"

import { CornerDownLeft, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import type { SearchEntry } from "@/lib/db/queries/search-index"
import { cn } from "@/lib/utils"

const RESULT_LIMIT = 30
export const OPEN_PALETTE_EVENT = "open-command-palette"

export function CommandPalette({ items }: { items: SearchEntry[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === "Escape") setOpen(false)
    }
    const onOpen = () => setOpen(true)

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery("")
      setActiveIndex(0)
      inputRef.current?.focus()
    }
  }, [open])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items.slice(0, RESULT_LIMIT)
    return items
      .filter((item) => item.name.toLowerCase().includes(needle) || item.kind.toLowerCase().includes(needle))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(needle) ? 0 : 1
        const bStarts = b.name.toLowerCase().startsWith(needle) ? 0 : 1
        return aStarts - bStarts || a.name.localeCompare(b.name)
      })
      .slice(0, RESULT_LIMIT)
  }, [items, query])

  if (!open) return null

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center px-3 pt-[12vh] sm:px-4">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <div
        className="panel relative w-full max-w-xl overflow-hidden shadow-raised"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault()
                setActiveIndex((index) => Math.min(index + 1, results.length - 1))
              }
              if (event.key === "ArrowUp") {
                event.preventDefault()
                setActiveIndex((index) => Math.max(index - 1, 0))
              }
              if (event.key === "Enter" && results[activeIndex]) {
                event.preventDefault()
                go(results[activeIndex].href)
              }
            }}
            placeholder="Search units, civs, techs, buildings…"
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search everything"
          />
          <kbd className="kbd-shortcut">ESC</kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto overscroll-contain">
          {results.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No matches</p>
          ) : (
            results.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.href)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors",
                  index === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted/60",
                )}
              >
                <span className="min-w-0 truncate text-sm font-medium">{item.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="label-caps">
                    {item.kind} · {item.subtitle}
                  </span>
                  {index === activeIndex && <CornerDownLeft className="h-3 w-3 text-muted-foreground" aria-hidden />}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
