"use client"

import { usePathname } from "next/navigation"
import { useEffect, useLayoutEffect, useRef } from "react"
import { navHistory } from "@/lib/nav-history"

/** How long a new route is held at its target offset before the reader gets the wheel. */
const SETTLE_MS = 1200

/** Anything that means "I am reading now, stop moving the page under me". */
const READER_INTENT = ["wheel", "touchstart", "pointerdown", "keydown"] as const

/**
 * Puts the content pane where the screen being shown expects to find it: at the
 * top for a screen being opened, and back where it was left for one being
 * returned to.
 *
 * Restoring on back is the half people notice. Tapping the 200th unit in a list
 * and coming back to the top of that list is the single most obvious way an app
 * announces it is a web page; every native list controller restores its offset.
 *
 * The browser does none of this for us. It restores scroll on the *document*,
 * and the document is not the scroller here — the shell is locked and
 * `.app-scroll` moves instead. Next's own handler is no help either: it skips
 * `position: sticky` elements when choosing what to scroll into view, so on any
 * page fronted by a section rail it targets the element below the rail and
 * leaves the rail scrolled off the top, and it runs several frames after this
 * effect on a streamed page, too late to simply out-order.
 *
 * So the target offset is *held* for a beat rather than set once — which also
 * solves restoring into a page whose content has not streamed in yet, since the
 * pane is not tall enough to hold the old offset until it has. The hold
 * releases the moment the reader touches the page.
 */
export function ScrollMemory({ targetId }: { targetId: string }) {
  const pathname = usePathname()
  const previous = useRef<string | null>(null)
  const currentKey = useRef(pathname)
  const positions = useRef(new Map<string, number>())

  // Record where each screen was left. Coalesced onto a frame: scroll fires far
  // faster than anything needs to be written down, and a listener that does
  // real work per event is how a list starts dropping frames.
  useEffect(() => {
    const pane = document.getElementById(targetId)
    if (!pane) return

    let frame = 0
    const record = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        positions.current.set(currentKey.current, pane.scrollTop)
      })
    }

    pane.addEventListener("scroll", record, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      pane.removeEventListener("scroll", record)
    }
  }, [targetId])

  useLayoutEffect(() => {
    const first = previous.current === null
    if (previous.current === pathname) return
    previous.current = pathname
    currentKey.current = pathname

    // On mount there is nothing to restore and possibly a `#anchor` deep link
    // to leave alone.
    if (first) return

    const pane = document.getElementById(targetId)
    if (!pane) return

    const back = navHistory.lastDirection() === "back"
    const target = back ? (positions.current.get(pathname) ?? 0) : 0
    // A screen opened afresh starts at the top, even if it was visited before —
    // the saved offset belongs to a history entry that has been left behind.
    if (!back) positions.current.delete(pathname)

    let frame = 0
    const release = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      for (const event of READER_INTENT) window.removeEventListener(event, release)
    }
    // Explicitly instant. The pane scrolls smoothly so that `#anchor` jumps
    // glide, and without this override a route change animates all the way
    // back — several screens of content smeared past on every tap.
    const hold = () => {
      const reachable = Math.max(0, pane.scrollHeight - pane.clientHeight)
      pane.scrollTo({ top: Math.min(target, reachable), behavior: "instant" })
      frame = requestAnimationFrame(hold)
    }

    const timer = setTimeout(release, SETTLE_MS)
    for (const event of READER_INTENT) window.addEventListener(event, release, { passive: true, once: true })
    hold()

    return release
  }, [pathname, targetId])

  return null
}
