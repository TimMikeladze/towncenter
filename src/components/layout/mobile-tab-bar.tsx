"use client"

import { Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { OPEN_PALETTE_EVENT } from "@/components/command-palette"
import { MOBILE_TAB_HREFS, NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const TABS = MOBILE_TAB_HREFS.map((href) => NAV_ITEMS.find((item) => item.href === href)).filter((item) => !!item)

/**
 * One tab. The icon sits in a pill that fills on the active route, which reads
 * at a glance on a small screen far better than a colour change alone.
 */
function TabContents({ icon: Icon, label, active }: { icon: typeof Search; label: string; active: boolean }) {
  return (
    <>
      <span
        className={cn(
          "grid h-7 w-12 place-items-center rounded-full transition-colors duration-150",
          active ? "bg-primary/15 text-primary" : "text-muted-foreground",
        )}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <span
        className={cn(
          "max-w-full truncate text-[10px] font-medium leading-none tracking-tight transition-colors",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </>
  )
}

const TAB_CLASS =
  "press flex w-full flex-col items-center justify-center gap-0.5 px-0.5 pt-1.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60"

/** Phone-only bottom navigation; tablets and desktops use the header rail. */
export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      // Fixed to the visual bottom, with its own safe-area padding so the row
      // of labels never sits under the home indicator.
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/92 backdrop-blur-xl md:hidden"
      style={{ paddingLeft: "var(--safe-left)", paddingRight: "var(--safe-right)" }}
    >
      <ul className="grid grid-cols-5" style={{ height: "var(--tab-bar-height)" }}>
        {TABS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <li key={item.href} className="flex">
              <Link href={item.href} aria-current={active ? "page" : undefined} className={TAB_CLASS}>
                <TabContents icon={item.icon} label={item.shortLabel ?? item.label} active={active} />
              </Link>
            </li>
          )
        })}
        <li className="flex">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            className={TAB_CLASS}
            aria-label="Search everything"
          >
            <TabContents icon={Search} label="Search" active={false} />
          </button>
        </li>
      </ul>
    </nav>
  )
}
