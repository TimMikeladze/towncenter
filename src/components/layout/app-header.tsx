"use client"

import { Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { OPEN_PALETTE_EVENT } from "@/components/command-palette"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"

function openPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header
      // Fixed, not sticky: with `viewport-fit=cover` the header also has to own
      // the status-bar strip, and it must not scroll away with the content.
      //
      // On a phone that strip is all it is. The row below is hidden and
      // `--header-height` is 0, so what survives is a blurred scrim exactly the
      // height of the status bar — and nothing at all in a browser tab, where
      // there is no status bar to cover.
      className="fixed inset-x-0 top-0 z-50 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 md:border-b"
      style={{ paddingTop: "var(--safe-top)", paddingLeft: "var(--safe-left)", paddingRight: "var(--safe-right)" }}
    >
      <div
        className="hidden items-center gap-1 px-2 sm:gap-2 sm:px-4 md:flex"
        style={{ height: "var(--header-height)" }}
      >
        {/* Tablet and desktop: one scrollable rail keeps every route reachable
            without an overflow menu. */}
        <nav className="rail nav-rail-fade min-w-0 flex-1 items-center gap-0.5" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors lg:px-3",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.shortLabel && <span className="lg:hidden">{item.shortLabel}</span>}
                <span className={item.shortLabel ? "hidden lg:inline" : undefined}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
          <button
            type="button"
            onClick={openPalette}
            className="hidden h-9 w-56 items-center gap-2 rounded-md border bg-muted/50 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted lg:flex xl:w-64"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search everything</span>
            <kbd className="kbd-shortcut">⌘K</kbd>
          </button>

          {/* Tablet has the rail eating the width, so search collapses to an
              icon rather than pushing routes off the end. */}
          <Button
            variant="ghost"
            size="icon"
            className="press touch-target lg:hidden"
            onClick={openPalette}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
