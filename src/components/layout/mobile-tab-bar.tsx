"use client"

import { MoreHorizontal, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"
import { useState } from "react"
import { OPEN_PALETTE_EVENT } from "@/components/command-palette"
import { ThemeToggleRow } from "@/components/theme-toggle"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { haptic } from "@/lib/haptics"
import { ABOUT_ITEM, HOME_ITEM, isRouteActive, MOBILE_TAB_HREFS, NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const TABS = MOBILE_TAB_HREFS.map((href) => NAV_ITEMS.find((item) => item.href === href)).filter((item) => !!item)

/**
 * Everything the tab bar could not fit. This is what "More" opens onto.
 *
 * Home leads it: the tab bar holds three sections, search and this sheet, and
 * the header that would normally carry a way back to the front page is
 * collapsed to the status bar on a phone. Without this row there is no route
 * home at all.
 */
const OVERFLOW = [HOME_ITEM, ...NAV_ITEMS.filter((item) => !MOBILE_TAB_HREFS.includes(item.href)), ABOUT_ITEM]

/** Tapping the tab you are already on takes you back to the top of it. */
function scrollScreenToTop() {
  document.getElementById("app-scroll")?.scrollTo({ top: 0, behavior: "smooth" })
}

/**
 * One tab. The icon sits in a pill that fills on the active route, which reads
 * at a glance on a small screen far better than a colour change alone.
 *
 * The pill's animation is attached by the active class rather than triggered in
 * JS: applying a rule that carries an `animation` is what starts it, so the
 * icon springs into the selection at exactly the moment the route becomes
 * current, with no state and no timers.
 */
function TabContents({ icon: Icon, label, active }: { icon: typeof MoreHorizontal; label: string; active: boolean }) {
  return (
    <>
      <span
        className={cn(
          "grid h-7 w-12 place-items-center rounded-full transition-colors duration-150",
          active ? "tab-pill-active bg-primary/15 text-primary" : "text-muted-foreground",
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

/**
 * Dims rather than shrinks: tabs share edges with their neighbours, and a tab
 * that scales on press opens a gap down both sides of itself.
 */
const TAB_CLASS =
  "press-dim flex w-full flex-col items-center justify-center gap-0.5 px-0.5 pt-1.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60"

/** Phone-only bottom navigation; tablets and desktops use the header rail. */
export function MobileTabBar() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  // "More" carries the active state for every route it hides, so the bar never
  // shows nothing selected.
  const onOverflowRoute = OVERFLOW.some((item) => isRouteActive(pathname, item.href))

  const onTabPress = (event: React.MouseEvent, active: boolean) => {
    haptic("tick")
    if (!active) return
    // Already here: the platform convention is that this scrolls to the top
    // rather than reloading the screen.
    event.preventDefault()
    scrollScreenToTop()
  }

  return (
    <>
      <nav
        aria-label="Primary"
        // The last child of the shell, not a fixed overlay: it holds the bottom
        // because nothing above it can scroll past. Its own safe-area padding
        // keeps the row of labels clear of the home indicator.
        className="pb-safe bg-background shrink-0 border-t border-border/80 md:hidden"
        style={{ paddingLeft: "var(--safe-left)", paddingRight: "var(--safe-right)" }}
      >
        <ul className="grid grid-cols-5" style={{ height: "var(--tab-bar-height)" }}>
          {TABS.map((item) => {
            const active = isRouteActive(pathname, item.href)
            return (
              <li key={item.href} className="flex">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={TAB_CLASS}
                  onClick={(event) => onTabPress(event, active)}
                >
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
              onClick={() => {
                haptic("tick")
                window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))
              }}
              className={TAB_CLASS}
              aria-label="Search everything"
            >
              <TabContents icon={Search} label="Search" active={false} />
            </button>
          </li>
          <li className="flex">
            <button
              type="button"
              onClick={() => {
                haptic("tick")
                setMoreOpen(true)
              }}
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
       * it, lands its list within thumb reach instead of at the top of the
       * screen, and can be thrown back down without aiming at anything.
       */}
      <BottomSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        title="More"
        description="Every section that is not in the tab bar"
        className="max-h-[78dvh] md:hidden"
      >
        {/* No entrance animation on the rows: the sheet is already moving, and
            content that slides inside a sliding container reads as lag. */}
        <nav className="scroll-contain min-h-0 flex-1 overflow-y-auto p-2 pb-4" aria-label="More sections">
          {OVERFLOW.map((item) => {
            const active = isRouteActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  haptic("tick")
                  setMoreOpen(false)
                }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press-dim flex items-start gap-3 rounded-md px-3 py-3 transition-colors",
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
      </BottomSheet>
    </>
  )
}
