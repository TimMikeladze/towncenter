"use client"

import { Menu, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { OPEN_PALETTE_EVENT } from "@/components/command-palette"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      // Fixed, not sticky: with `viewport-fit=cover` the header also has to own
      // the status-bar strip, and it must not scroll away with the content.
      className="fixed inset-x-0 top-0 z-50 border-b bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
      style={{ paddingTop: "var(--safe-top)", paddingLeft: "var(--safe-left)", paddingRight: "var(--safe-right)" }}
    >
      <div className="flex items-center gap-1 px-2 sm:gap-2 sm:px-4" style={{ height: "var(--header-height)" }}>
        {/* Phone: the section menu is the first thing under the thumb. */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="press touch-target -ml-1 md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-[86vw] max-w-sm flex-col p-0">
            <SheetTitle
              className="border-b px-4 pb-3 font-display text-sm uppercase tracking-[0.18em]"
              style={{ paddingTop: "calc(var(--safe-top) + 0.875rem)" }}
            >
              Town Center
            </SheetTitle>
            <nav
              className="scroll-contain flex flex-1 flex-col gap-0.5 overflow-y-auto p-2"
              aria-label="All sections"
              style={{ paddingBottom: "calc(var(--safe-bottom) + 0.5rem)" }}
            >
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "press flex items-start gap-3 rounded-md px-3 py-3 transition-colors",
                      active ? "bg-accent text-accent-foreground" : "active:bg-muted",
                    )}
                  >
                    <item.icon
                      className={cn("mt-0.5 h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.description}</span>
                    </span>
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="press flex min-w-0 shrink-0 items-center gap-2" aria-label="Home">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10 font-display text-[13px] font-bold text-primary">
            II
          </span>
          <span className="truncate font-display text-[13px] font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]">
            Town Center
          </span>
        </Link>

        {/* Tablet and desktop: one scrollable rail keeps every route reachable
            without an overflow menu. */}
        <nav className="rail nav-rail-fade hidden min-w-0 flex-1 items-center gap-0.5 md:flex" aria-label="Primary">
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

        <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0 md:gap-1">
          <button
            type="button"
            onClick={openPalette}
            className="hidden h-9 w-56 items-center gap-2 rounded-md border bg-muted/50 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted lg:flex xl:w-64"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search everything</span>
            <kbd className="kbd-shortcut">⌘K</kbd>
          </button>

          {/* The phone reaches search from the tab bar, so this is desktop-only
              and the header stays uncluttered on a 375px screen. */}
          <Button
            variant="ghost"
            size="icon"
            className="press touch-target hidden md:inline-flex lg:hidden"
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
