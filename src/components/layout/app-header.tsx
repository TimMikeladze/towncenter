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
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Home">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-primary/40 bg-primary/10 font-display text-sm font-bold text-primary">
            II
          </span>
          <span className="font-display text-[13px] font-semibold uppercase tracking-[0.16em] sm:text-sm sm:tracking-[0.18em]">
            Town Center
          </span>
        </Link>

        {/* Tablet and desktop: one scrollable rail keeps every route reachable
            without an overflow menu. */}
        <nav
          className="no-scrollbar nav-rail-fade hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:flex"
          aria-label="Primary"
        >
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

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button
            type="button"
            onClick={openPalette}
            className="hidden h-9 w-56 items-center gap-2 rounded-md border bg-muted/50 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted lg:flex xl:w-64"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search everything</span>
            <kbd className="kbd-shortcut">⌘K</kbd>
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="touch-target lg:hidden"
            onClick={openPalette}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <ThemeToggle />

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="touch-target md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-sm p-0">
              <SheetTitle className="border-b px-4 py-4 font-display text-sm uppercase tracking-[0.18em]">
                Town Center
              </SheetTitle>
              <nav className="flex flex-col gap-0.5 p-2" aria-label="All sections">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(pathname, item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors",
                        active ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                      )}
                    >
                      <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
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
        </div>
      </div>
    </header>
  )
}
