"use client"

import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react"
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
  const listRef = useRef<HTMLDivElement>(null)

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

  // The page behind a full-screen sheet must not scroll with it.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setQuery("")
    setActiveIndex(0)
    // Focusing on the next frame lets the sheet finish mounting first, which
    // stops iOS from scrolling the page under the keyboard.
    const timer = setTimeout(() => inputRef.current?.focus(), 40)
    return () => clearTimeout(timer)
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

  // Keyboard navigation has to drag the list along with it.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  if (!open) return null

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <div className="fixed inset-0 z-100 flex flex-col sm:items-center sm:justify-start sm:px-4 sm:pt-[10vh]">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />

      {/*
        Phone: a full-height sheet, so the keyboard has somewhere to go and the
        results list owns the whole screen. Tablet and up: the usual centred
        dialog.
      */}
      <div
        className={cn(
          "panel relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none border-x-0 border-b-0 shadow-raised",
          "sm:h-auto sm:max-h-[70vh] sm:max-w-xl sm:flex-none sm:rounded-lg sm:border",
        )}
        style={{ paddingTop: "var(--safe-top)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className="flex shrink-0 items-center gap-2 border-b px-3 sm:px-3">
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
            placeholder="Search units, civs, techs…"
            // `text-base` is not cosmetic: anything under 16px makes iOS zoom
            // the whole page the moment this input takes focus.
            className="min-w-0 flex-1 bg-transparent py-3.5 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
            aria-label="Search everything"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          <kbd className="kbd-shortcut hidden sm:inline-flex">ESC</kbd>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="press touch-target -mr-1 grid shrink-0 place-items-center text-muted-foreground sm:hidden"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={listRef}
          className="scroll-contain min-h-0 flex-1 overflow-y-auto sm:max-h-[55vh] sm:flex-none"
          style={{ paddingBottom: "var(--safe-bottom)" }}
        >
          {results.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">No matches for “{query.trim()}”</p>
          ) : (
            results.map((item, index) => (
              <button
                key={item.id}
                type="button"
                data-index={index}
                onClick={() => go(item.href)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-b-0 active:bg-accent",
                  index === activeIndex ? "sm:bg-accent sm:text-accent-foreground" : "sm:hover:bg-muted/60",
                )}
              >
                {/*
                  Name and metadata stack in one min-w-0 column and truncate.
                  Side-by-side with a non-shrinking meta column is what pushed
                  the row — and the whole page — past the screen edge.
                */}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium leading-tight">{item.name}</span>
                  <span className="label-caps mt-1 block truncate">
                    {item.kind}
                    {item.subtitle ? ` · ${item.subtitle}` : ""}
                  </span>
                </span>
                {index === activeIndex ? (
                  <CornerDownLeft className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" aria-hidden />
                ) : null}
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 sm:hidden" aria-hidden />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
