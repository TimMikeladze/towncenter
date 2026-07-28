"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import type { SearchEntry } from "@/lib/db/queries/search-index"

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
    <div className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh] px-4">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-black/50 cursor-default"
        onClick={() => setOpen(false)}
      />
      <div
        className="relative w-full max-w-xl bg-background border-2 rounded-lg shadow-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
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
            placeholder="Search units, civs, techs, buildings..."
            className="w-full bg-transparent py-3 text-sm outline-none"
            aria-label="Search everything"
          />
          <kbd className="kbd-shortcut">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No matches</p>
          ) : (
            results.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.href)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full text-left px-4 py-2 flex items-center justify-between gap-3 ${
                  index === activeIndex ? "bg-muted" : ""
                }`}
              >
                <span className="font-mono text-sm">{item.name}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {item.kind} • {item.subtitle}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
