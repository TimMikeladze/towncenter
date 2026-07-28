"use client"

import { MoreHorizontal, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { OPEN_PALETTE_EVENT } from "@/components/command-palette"
import { ThemeToggleRow } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { MOBILE_TAB_HREFS, NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const TABS = MOBILE_TAB_HREFS.map((href) => NAV_ITEMS.find((item) => item.href === href)).filter((item) => !!item)

/** Everything the tab bar could not fit. This is what "More" opens onto. */
const OVERFLOW = NAV_ITEMS.filter((item) => !MOBILE_TAB_HREFS.includes(item.href))

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * One tab. The icon sits in a pill that fills on the active route, which reads
 * at a glance on a small screen far better than a colour change alone.
 */
function TabContents({ icon: Icon, label, active }: { icon: typeof MoreHorizontal; label: string; active: boolean }) {
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
  const [moreOpen, setMoreOpen] = useState(false)

  // "More" carries the active state for every route it hides, so the bar never
  // shows nothing selected.
  const onOverflowRoute = OVERFLOW.some((item) => isActive(pathname, item.href))

  return (
    <>
      <nav
        aria-label="Primary"
        // Fixed to the visual bottom, with its own safe-area padding so the row
        // of labels never sits under the home indicator.
        className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/92 backdrop-blur-xl md:hidden"
        style={{ paddingLeft: "var(--safe-left)", paddingRight: "var(--safe-right)" }}
      >
        <ul className="grid grid-cols-5" style={{ height: "var(--tab-bar-height)" }}>
          {TABS.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href} className="flex">
                <Link href={item.href} aria-current={active ? "page" : undefined} className={TAB_CLASS}>
                  <TabContents icon={item.icon} label={item.shortLabel ?? item.label} active={active} />
                </Link>
              </li>
            )
          })}
          {/* Search has a permanent slot: it is the fastest route to anything
              in the app and belongs to no page, so it cannot live in a header
              the phone no longer draws. */}
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
          <li className="flex">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={TAB_CLASS}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              aria-label="More sections"
            >
              <TabContents icon={MoreHorizontal} label="More" active={moreOpen || onOverflowRoute} />
            </button>
          </li>
        </ul>
      </nav>

      {/*
       * Bottom sheet, not a side drawer: it opens off the control that spawned
       * it and lands its list within thumb reach instead of at the top of the
       * screen.
       */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[78dvh] flex-col gap-0 rounded-t-2xl p-0 md:hidden"
          style={{ paddingBottom: "var(--safe-bottom)" }}
        >
          {/* Grabber: the one affordance that says "this sheet drags down". */}
          <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-border" aria-hidden />
          <SheetTitle className="px-5 pt-3 pb-1 font-display text-sm uppercase tracking-[0.18em]">More</SheetTitle>
          <SheetDescription className="sr-only">Every section that is not in the tab bar</SheetDescription>
          <nav className="scroll-contain flex-1 overflow-y-auto p-2 pb-4" aria-label="More sections">
            {OVERFLOW.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  aria-current={active ? "page" : undefined}
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

            {/* Not a destination, so it sits below a rule rather than in the
                list. The header carries this on tablet and up. */}
            <div className="mt-2 border-t pt-2">
              <ThemeToggleRow />
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
