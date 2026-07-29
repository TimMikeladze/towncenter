"use client"

import { RefreshCw } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useLayoutEffect, useRef, useTransition } from "react"
import { haptic } from "@/lib/haptics"
import { navHistory } from "@/lib/nav-history"

/** How close to the left edge a touch must start to mean "go back". */
const EDGE_ZONE = 30

/** Travel before the gesture commits to an axis and stops being a tap. */
const AXIS_LOCK = 12

/** Fraction of the screen a back swipe must cross to commit on release. */
const BACK_COMMIT = 0.32

/** px/ms that counts as a throw, whatever the distance covered. */
const FLING = 0.4

const PULL_MAX = 92
const PULL_TRIGGER = 64
/** Where the pane parks while the refresh is in flight. */
const PULL_REST = 56
/** Past the first few pixels a pull gets progressively harder, as it does natively. */
const PULL_RESISTANCE = 0.55

/** Longest the outgoing screen may sit off-screen waiting for the one behind it. */
const HANDOFF_MS = 800
/** A refresh that resolves instantly should still look like it happened. */
const MIN_SPIN_MS = 550
/** Backstop in case the refresh transition never reports finishing. */
const REFRESH_TIMEOUT_MS = 3000

type Mode = "idle" | "pending" | "back" | "pull"

/**
 * The two gestures a phone user will try on any app, and which a web app has
 * neither of once it is installed to the home screen.
 *
 * **Swipe from the left edge to go back.** In a browser tab this is the
 * browser's own gesture; launched standalone there is no browser, no back
 * button, and — with the tab bar owning the bottom of the screen — no way back
 * at all except a Back link the page may not have. So the screen is dragged
 * with the thumb, one-to-one, and thrown off the side if the swipe carries far
 * or fast enough.
 *
 * **Pull down to refresh.** Same story: `overscroll-behavior` had to be pinned
 * to keep the shell from rubber-banding, which also removes the platform's
 * refresh gesture. This puts it back, tied to a real RSC refetch.
 *
 * Everything here writes to the DOM directly. A drag that re-renders React on
 * every touchmove is a drag that visibly lags the thumb, and lag is the exact
 * thing this is here to remove.
 */
export function TouchGestures({ targetId }: { targetId: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [refreshing, startRefresh] = useTransition()

  const indicatorRef = useRef<HTMLDivElement>(null)
  const spinnerRef = useRef<HTMLSpanElement>(null)

  const gesture = useRef({ mode: "idle" as Mode, x: 0, y: 0, at: 0, delta: 0, canBack: false, canPull: false })
  /** A committed back swipe, waiting for the screen behind it to arrive. */
  const leaving = useRef(false)
  /** A refresh in flight, with the pane parked open. */
  const refreshingRef = useRef(false)
  const refreshStartedAt = useRef(0)
  const handoffTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const move = useCallback(
    (x: number, y: number, transition: string) => {
      const pane = document.getElementById(targetId)
      if (!pane) return
      pane.style.transition = transition
      pane.style.transform = `translate3d(${x}px, ${y}px, 0)`
    },
    [targetId],
  )

  const paintPull = useCallback((offset: number, spinning = false) => {
    const indicator = indicatorRef.current
    const spinner = spinnerRef.current
    if (!indicator || !spinner) return
    const progress = Math.min(1, offset / PULL_TRIGGER)
    indicator.style.opacity = String(progress)
    // The spinner winds up as it is pulled, so the gesture reads as charging
    // something rather than merely revealing it.
    spinner.style.transform = spinning ? "scale(1)" : `scale(${0.72 + progress * 0.28}) rotate(${progress * 270}deg)`
    spinner.toggleAttribute("data-spinning", spinning)
  }, [])

  const releasePull = useCallback(() => {
    refreshingRef.current = false
    move(0, 0, "transform var(--duration-base) var(--ease-out-native)")
    paintPull(0)
  }, [move, paintPull])

  // Touch handling. One effect, one listener set, one state machine — the two
  // gestures share a start and diverge on whichever axis the thumb picks.
  useEffect(() => {
    const pane = document.getElementById(targetId)
    if (!pane) return

    /**
     * Whether something between the finger and the pane scrolls on this axis.
     * A filter rail near the left edge owns its own horizontal swipes, and a
     * table that can still scroll up owns its own vertical ones; stealing
     * either would make those controls feel broken.
     */
    const scrollerBetween = (from: EventTarget | null, axis: "x" | "y") => {
      let node = from instanceof Element ? from : null
      while (node && node !== pane) {
        const style = getComputedStyle(node)
        const overflow = axis === "x" ? style.overflowX : style.overflowY
        if (overflow === "auto" || overflow === "scroll") {
          const room = axis === "x" ? node.scrollWidth - node.clientWidth : node.scrollHeight - node.clientHeight
          if (room > 1) return true
        }
        node = node.parentElement
      }
      return false
    }

    const abandon = () => {
      const mode = gesture.current.mode
      gesture.current.mode = "idle"
      if (mode === "back") {
        move(0, 0, "transform var(--duration-base) var(--ease-out-native)")
        setTimeout(() => pane.removeAttribute("data-swiping"), 220)
      }
      if (mode === "pull") releasePull()
    }

    const onStart = (event: TouchEvent) => {
      const state = gesture.current
      if (event.touches.length !== 1 || leaving.current || refreshingRef.current) {
        state.mode = "idle"
        return
      }
      const touch = event.touches[0]
      state.x = touch.clientX
      state.y = touch.clientY
      state.at = event.timeStamp
      state.delta = 0
      state.canBack = touch.clientX <= EDGE_ZONE && navHistory.canGoBack() && !scrollerBetween(event.target, "x")
      state.canPull = pane.scrollTop <= 0 && !scrollerBetween(event.target, "y")
      state.mode = state.canBack || state.canPull ? "pending" : "idle"
    }

    const onMove = (event: TouchEvent) => {
      const state = gesture.current
      if (state.mode === "idle") return
      if (event.touches.length !== 1) {
        abandon()
        return
      }

      const touch = event.touches[0]
      const dx = touch.clientX - state.x
      const dy = touch.clientY - state.y

      if (state.mode === "pending") {
        // Below the lock distance this is still potentially a tap, and a tap
        // must not move anything.
        if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return
        if (state.canBack && dx > 0 && Math.abs(dx) > Math.abs(dy)) {
          state.mode = "back"
          // Lifts the screen off whatever it is being dragged away from, so
          // the movement reads as one layer over another rather than as the
          // page detaching from the window.
          pane.setAttribute("data-swiping", "")
        } else if (state.canPull && dy > 0 && dy > Math.abs(dx)) state.mode = "pull"
        else {
          // The page asked for this one.
          state.mode = "idle"
          return
        }
      }

      if (state.mode === "back") {
        event.preventDefault()
        state.delta = Math.max(0, dx)
        move(state.delta, 0, "none")
        return
      }

      // The pane can be scrolled by something else mid-gesture (an anchor, a
      // focused input); a pull only makes sense from the very top.
      if (pane.scrollTop > 0) {
        abandon()
        return
      }
      event.preventDefault()
      state.delta = Math.min(PULL_MAX, Math.max(0, dy) * PULL_RESISTANCE)
      move(0, state.delta, "none")
      paintPull(state.delta)
    }

    const onEnd = (event: TouchEvent) => {
      const state = gesture.current
      const mode = state.mode
      state.mode = "idle"
      if (mode !== "back" && mode !== "pull") return

      const velocity = state.delta / Math.max(1, event.timeStamp - state.at)

      if (mode === "back") {
        const progress = state.delta / Math.max(1, pane.clientWidth)
        if (progress < BACK_COMMIT && velocity < FLING) {
          move(0, 0, "transform var(--duration-base) var(--ease-out-native)")
          setTimeout(() => pane.removeAttribute("data-swiping"), 220)
          return
        }
        leaving.current = true
        haptic("commit")
        // The screen carries on the way it was thrown and leaves; the one
        // behind it animates in from the other side the moment it is ready.
        move(pane.clientWidth, 0, "transform var(--duration-screen) var(--ease-out-native)")
        router.back()
        handoffTimer.current = setTimeout(() => {
          // The history entry did not change the pathname (a query-only step),
          // so nothing is coming to replace this screen. Put it back.
          leaving.current = false
          move(0, 0, "transform var(--duration-base) var(--ease-out-native)")
          setTimeout(() => pane.removeAttribute("data-swiping"), 220)
        }, HANDOFF_MS)
        return
      }

      if (state.delta < PULL_TRIGGER) {
        releasePull()
        return
      }

      const startedAt = performance.now()
      refreshingRef.current = true
      refreshStartedAt.current = startedAt
      haptic("commit")
      move(0, PULL_REST, "transform var(--duration-base) var(--ease-out-native)")
      paintPull(PULL_REST, true)
      startRefresh(() => router.refresh())
      // Backstop. The effect below closes the pane when the transition reports
      // it has finished — but a refresh that resolves before React ever flips
      // the pending flag reports nothing at all, and the pane would stay parked
      // open forever. Keyed on the start time so a later pull is never closed
      // by an earlier pull's timer.
      setTimeout(() => {
        if (refreshingRef.current && refreshStartedAt.current === startedAt) releasePull()
      }, REFRESH_TIMEOUT_MS)
    }

    pane.addEventListener("touchstart", onStart, { passive: true })
    // Non-passive: a gesture that has claimed an axis has to stop the pane
    // scrolling or rubber-banding along with it.
    pane.addEventListener("touchmove", onMove, { passive: false })
    pane.addEventListener("touchend", onEnd, { passive: true })
    pane.addEventListener("touchcancel", abandon, { passive: true })

    return () => {
      pane.removeEventListener("touchstart", onStart)
      pane.removeEventListener("touchmove", onMove)
      pane.removeEventListener("touchend", onEnd)
      pane.removeEventListener("touchcancel", abandon)
    }
  }, [targetId, router, move, paintPull, releasePull])

  // The screen behind a committed back swipe has arrived: drop the pane back
  // into place before the frame paints, so the incoming screen plays its own
  // entrance from where it should start rather than from off the right edge.
  //
  // biome-ignore lint/correctness/useExhaustiveDependencies: the pathname is the trigger, not an input — it is what "the new screen is here" looks like from React.
  useLayoutEffect(() => {
    if (!leaving.current) return
    leaving.current = false
    if (handoffTimer.current) clearTimeout(handoffTimer.current)
    document.getElementById(targetId)?.removeAttribute("data-swiping")
    move(0, 0, "none")
  }, [pathname, move, targetId])

  // Hold the spinner long enough to be seen, then close the pane.
  useEffect(() => {
    if (!refreshingRef.current || refreshing) return
    const remaining = Math.max(0, MIN_SPIN_MS - (performance.now() - refreshStartedAt.current))
    const timer = setTimeout(releasePull, remaining)
    return () => clearTimeout(timer)
  }, [refreshing, releasePull])

  useEffect(() => {
    return () => {
      if (handoffTimer.current) clearTimeout(handoffTimer.current)
    }
  }, [])

  return (
    <div ref={indicatorRef} className="ptr-indicator" style={{ opacity: 0 }} aria-hidden>
      <span ref={spinnerRef} className="ptr-spinner">
        <RefreshCw className="h-3.5 w-3.5" />
      </span>
    </div>
  )
}
