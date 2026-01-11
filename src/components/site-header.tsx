"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/units", label: "Units", shortcut: "U" },
  { href: "/civilizations", label: "Civs", shortcut: "C" },
  { href: "/buildings", label: "Buildings", shortcut: "B" },
  { href: "/technologies", label: "Techs", shortcut: "T" },
  { href: "/maps", label: "Maps", shortcut: "M" },
  { href: "/competitive", label: "Comp", shortcut: "P" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm uppercase tracking-wider">AoE2:DE</span>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname.startsWith(item.href) ? "default" : "ghost"}
                    size="sm"
                    className="font-mono text-xs h-8 px-3"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />

            <Button variant="ghost" size="icon" asChild className="hidden md:flex h-8 w-8">
              <Link href="/search">
                <Search className="h-3 w-3" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/">
                    <span className="font-mono font-bold text-lg uppercase tracking-wider">AoE2:DE Companion</span>
                  </Link>
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={pathname.startsWith(item.href) ? "default" : "ghost"}
                          className="w-full justify-start font-mono text-xs"
                        >
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
