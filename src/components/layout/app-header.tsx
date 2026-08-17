"use client"

import { Github, Info, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { OPEN_PALETTE_EVENT } from "@/components/command-palette"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { ABOUT_ITEM, HOME_ITEM, isRouteActive, NAV_ITEMS, REPO_URL } from "@/lib/navigation"
import { cn } from "@/lib/utils"

function openPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))
}

/** Home first, then the sections. Nothing else in the app links back to it. */
const RAIL_ITEMS = [HOME_ITEM, ...NAV_ITEMS]

export function AppHeader() {
  const pathname = usePathname()
  const aboutActive = isRouteActive(pathname, ABOUT_ITEM.href)

  return (
    <header
      // A flow child of the shell, not a fixed overlay. Nothing scrolls
      // underneath it, so it is opaque rather than blurred, and it owns the
      // status-bar strip through its own safe-area padding.
      //
      // On a phone that strip is all it is. The row below is hidden and
      // `--header-height` is 0, so what survives is a band exactly the height
      // of the status bar — and nothing at all in a browser tab, where there
      // is no status bar to cover.
      className="bg-background shrink-0 md:border-b"
      style={{ paddingTop: "var(--safe-top)", paddingLeft: "var(--safe-left)", paddingRight: "var(--safe-right)" }}
    >
      <div
        className="hidden items-center gap-1 px-2 sm:gap-2 sm:px-4 md:flex"
        style={{ height: "var(--header-height)" }}
      >
        {/* Tablet and desktop: one scrollable rail keeps every route reachable
            without an overflow menu. */}
        <nav className="rail nav-rail-fade min-w-0 flex-1 items-center gap-0.5" aria-label="Primary">
          {RAIL_ITEMS.map((item) => {
            const active = isRouteActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press shrink-0 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors lg:px-3",
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
          {/* Search is an icon at every width: the rail wants the room, and the
              palette is the real interface anyway. */}
          <Button variant="ghost" size="icon" className="press touch-target" onClick={openPalette} aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>

          <Button asChild variant="ghost" size="icon" className="press touch-target">
            <a href={REPO_URL} target="_blank" rel="noreferrer noopener" aria-label="Source on GitHub">
              <Github className="h-4 w-4" />
            </a>
          </Button>

          <Button asChild variant="ghost" size="icon" className="press touch-target">
            <Link href={ABOUT_ITEM.href} aria-label={ABOUT_ITEM.label} aria-current={aboutActive ? "page" : undefined}>
              <Info className={cn("h-4 w-4", aboutActive && "text-foreground")} />
            </Link>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
