"use client"

import { ArrowRight, Building2, Castle, CornerDownLeft, Scroll, Search, Swords, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { SearchEntry } from "@/lib/db/queries/search-index"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"

const RESULT_LIMIT = 30
export const OPEN_PALETTE_EVENT = "open-command-palette"

/** Must match the exit animation on `.palette-panel[data-state="closed"]`. */
const CLOSE_MS = 140

const KIND_ICONS = {
  Unit: Swords,
  Civilization: Castle,
  Technology: Scroll,
  Building: Building2,
} as const

export function CommandPalette({ items }: { items: SearchEntry[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  // Kept mounted for the length of its exit animation. Without this the panel
  // vanishes on the frame it is dismissed, which is the one moment a search
  // sheet is being watched closely.
  const [closing, setClosing] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  /** Only the keyboard moves the list; a hover or a fresh open must not. */
  const keyboardMoved = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const close = useCallback(() => {
    setClosing(true)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, CLOSE_MS)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === "Escape") close()
    }
    const onOpen = () => {
      setClosing(false)
      setOpen(true)
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen)
    }
  }, [close])

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

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

  // Keyboard navigation has to drag the list along with it — and nothing else
  // does. Scrolling on open would nudge the first result half out of view,
  // because "nearest" is measured while the panel is still animating into
  // place and is therefore not yet where it will end up.
  useEffect(() => {
    if (!keyboardMoved.current) return
    keyboardMoved.current = false
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  if (!open) return null

  const state = closing ? "closed" : "open"

  const go = (href: string) => {
    haptic("select")
    close()
    router.push(href)
  }

  return (
    <div className="fixed inset-0 z-100 flex flex-col sm:items-center sm:justify-start sm:px-4 sm:pt-[10vh]">
      <button
        type="button"
        aria-label="Close search"
        data-state={state}
        className="palette-overlay absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
        onClick={close}
      />

      {/*
        Phone: a full-height sheet, so the keyboard has somewhere to go and the
        results list owns the whole screen. Tablet and up: the usual centred
        dialog.
      */}
      <div
        data-state={state}
        className={cn(
          "palette-panel panel relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-none border-x-0 border-b-0 shadow-raised",
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
                keyboardMoved.current = true
                setActiveIndex((index) => Math.min(index + 1, results.length - 1))
              }
              if (event.key === "ArrowUp") {
                event.preventDefault()
                keyboardMoved.current = true
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
            onClick={close}
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
            <p className="rise-in px-4 py-12 text-center text-sm text-muted-foreground">
              No matches for “{query.trim()}”
            </p>
          ) : (
            results.map((item, index) => {
              const KindIcon = KIND_ICONS[item.kind]
              return (
                <button
                  key={item.id}
                  type="button"
                  data-index={index}
                  onClick={() => go(item.href)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "press-dim flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-b-0 active:bg-accent",
                    index === activeIndex ? "sm:bg-accent sm:text-accent-foreground" : "sm:hover:bg-muted/60",
                  )}
                >
                  {/* The kind is already spelled out below the name; the icon
                      is there so the eye can group the list without reading
                      it. */}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border bg-muted/40 text-muted-foreground">
                    <KindIcon className="h-4 w-4" aria-hidden />
                  </span>
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
                    <CornerDownLeft
                      className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block"
                      aria-hidden
                    />
                  ) : null}
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 sm:hidden" aria-hidden />
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
