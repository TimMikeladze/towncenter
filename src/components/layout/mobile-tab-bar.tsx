"use client"

import { Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { OPEN_PALETTE_EVENT } from "@/components/command-palette"
import { MOBILE_TAB_HREFS, NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const TABS = MOBILE_TAB_HREFS.map((href) => NAV_ITEMS.find((item) => item.href === href)).filter((item) => !!item)

/** Phone-only bottom navigation; tablets and desktops use the header rail. */
export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden />
                {item.shortLabel ?? item.label}
              </Link>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            className="flex h-14 w-full flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground"
          >
            <Search className="h-5 w-5" aria-hidden />
            Search
          </button>
        </li>
      </ul>
    </nav>
  )
}
