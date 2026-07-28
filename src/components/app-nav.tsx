"use client"

import { Menu, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { OPEN_PALETTE_EVENT } from "@/components/command-palette"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const mainNavItems = [
  { href: "/units", label: "Units" },
  { href: "/civilizations", label: "Civilizations" },
  { href: "/buildings", label: "Buildings" },
  { href: "/technologies", label: "Technologies" },
  { href: "/tech-tree", label: "Tech Tree" },
  { href: "/maps", label: "Maps" },
  { href: "/counters", label: "Counters" },
  { href: "/compare", label: "Compare" },
  { href: "/changes", label: "Changes" },
  { href: "/competitive", label: "Competitive" },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-12 items-center px-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="flex items-center">
            <span className="font-mono font-bold text-xs uppercase tracking-widest">AOE2:DE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {mainNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`font-mono text-[10px] h-8 px-3 uppercase tracking-wider ${isActive ? "bg-muted" : ""}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
          >
            <Search className="h-3 w-3" />
            <span className="sr-only">Search (⌘K)</span>
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/">
                  <span className="font-mono font-bold text-sm uppercase tracking-widest">AOE2:DE</span>
                </Link>
                <nav className="flex flex-col gap-1">
                  {mainNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className="w-full justify-start font-mono text-xs uppercase"
                        >
                          {item.label}
                        </Button>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
