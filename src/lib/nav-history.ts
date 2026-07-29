/**
 * Which way the app is moving.
 *
 * A native app knows whether it is pushing a screen or popping one, and
 * animates accordingly: forward screens arrive from the right, back screens
 * from the left. The browser does not tell React any of this — a route change
 * looks identical whether it came from a link or the back button — so the two
 * signals it does give us are recorded here and read on the next render.
 *
 * Module state rather than context: the gesture handlers are not React
 * children of the screen they move, and a context would put a re-render
 * between a thumb and the pixels it is dragging.
 */

export type ScreenDirection = "forward" | "back" | "none"

/** Set by `popstate`, consumed by the route change that follows it. */
let popped = false

/**
 * How many in-app screens are behind this one. Counted rather than read off
 * `history.length`, which also counts entries from before the app was opened
 * and cannot tell an in-app entry from the page the user came in from — the
 * difference between a back gesture that returns to a list and one that leaves
 * the app entirely.
 */
let depth = 0

/** The direction of the route change currently on screen. */
let last: ScreenDirection = "none"

let listening = false

export const navHistory = {
  /** Called once, from the screen container. */
  listen() {
    if (listening || typeof window === "undefined") return
    listening = true
    window.addEventListener("popstate", () => {
      popped = true
    })
  },

  /** Reads — and clears — the direction of the route change being rendered. */
  takeDirection(): ScreenDirection {
    const wasPop = popped
    popped = false

    if (wasPop) depth = Math.max(0, depth - 1)
    else depth += 1

    last = wasPop ? "back" : "forward"
    return last
  },

  /**
   * The direction of the change already being rendered, for everything that
   * has to react to it *after* the screen container has claimed it — scroll
   * restoration, chiefly, which only restores a saved offset when going back.
   */
  lastDirection(): ScreenDirection {
    return last
  },

  /** Whether there is an in-app screen to go back to. */
  canGoBack() {
    return depth > 0
  },
}
