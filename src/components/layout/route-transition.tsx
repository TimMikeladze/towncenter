"use client"

import { usePathname } from "next/navigation"
import type React from "react"
import { useEffect, useRef } from "react"
import { navHistory } from "@/lib/nav-history"

/**
 * Wraps each route in a screen that animates in.
 *
 * The `key` is the pathname, so React tears the old screen down and builds a
 * new one on every navigation — which is the only way a CSS entrance animation
 * can run more than once. It is deliberately *not* keyed on the query string:
 * every filter, sort and view toggle in the app lives in the URL, and a screen
 * that re-animated on each keystroke of a search box would be unusable.
 *
 * Direction comes from `navHistory`, so a push and a pop of the same route
 * arrive from opposite sides.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const rendered = useRef<string | null>(null)
  const direction = useRef<"forward" | "back" | "none">("none")

  // Read during render because the direction has to be on the element the
  // frame it mounts — an effect would set it after the animation had already
  // started with the wrong one. The ref guard keeps this to one read per
  // navigation even though React may render twice.
  if (rendered.current !== pathname) {
    // A cold start is not a navigation. The first screen is simply already
    // there, the way an app that was just launched is.
    direction.current = rendered.current === null ? "none" : navHistory.takeDirection()
    rendered.current = pathname
  }

  useEffect(() => {
    navHistory.listen()
  }, [])

  return (
    <div key={pathname} className="screen" data-direction={direction.current}>
      {children}
    </div>
  )
}
