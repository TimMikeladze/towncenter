"use client"

import { usePathname } from "next/navigation"
import { useLayoutEffect, useRef } from "react"

/** How long a new route is held at the top before the reader gets the wheel. */
const SETTLE_MS = 1200

/** Anything that means "I am reading now, stop moving the page under me". */
const READER_INTENT = ["wheel", "touchstart", "pointerdown", "keydown"] as const

/**
 * Sends the content pane back to the top on navigation.
 *
 * The browser does this for free when the document is the scroller. It is not
 * the scroller here — the shell is locked and `.app-scroll` moves instead — so
 * a new route would otherwise open at the last route's scroll position.
 *
 * Next has its own handler for this, and on these pages it lands in the wrong
 * place: it skips `position: sticky` elements when choosing what to scroll
 * into view, so on any page fronted by a section rail it picks the element
 * *below* the rail and leaves the rail scrolled off the top. It runs when the
 * segment commits, which for a streamed page is several frames after this
 * effect — too late to simply out-order it.
 *
 * So the top is held for a beat rather than set once, and the hold releases the
 * moment the reader touches the page.
 */
export function ScrollReset({ targetId }: { targetId: string }) {
  const pathname = usePathname()
  const previous = useRef(pathname)

  useLayoutEffect(() => {
    // Only on a real route change. Firing on mount too would scroll away from
    // whatever a `#anchor` deep link had just landed on.
    if (previous.current === pathname) return
    previous.current = pathname

    const pane = document.getElementById(targetId)
    if (!pane) return

    let frame = 0
    const release = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      for (const event of READER_INTENT) window.removeEventListener(event, release)
    }
    // Explicitly instant. The pane scrolls smoothly so that `#anchor` jumps
    // glide, and without this override a route change animates all the way
    // back up — several screens of content smeared past on every tap.
    const hold = () => {
      pane.scrollTo({ top: 0, behavior: "instant" })
      frame = requestAnimationFrame(hold)
    }

    const timer = setTimeout(release, SETTLE_MS)
    for (const event of READER_INTENT) window.addEventListener(event, release, { passive: true, once: true })
    hold()

    return release
  }, [pathname, targetId])

  return null
}
