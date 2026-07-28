"use client"

import { useEffect } from "react"

/**
 * The bits of "feels like an app" that cannot be expressed in CSS or a meta
 * tag. Renders nothing.
 *
 * 1. Zoom is disabled for real. iOS Safari has ignored `user-scalable=no`
 *    since iOS 10, so pinch has to be cancelled at the gesture events. Without
 *    this the page can end up zoomed, and a zoomed page positions every
 *    `position: fixed` element against the layout viewport — which is exactly
 *    how a bottom tab bar ends up floating in the middle of the screen.
 * 2. `data-display-mode` on <html> lets CSS tell a home-screen launch from a
 *    browser tab.
 */
export function AppChrome() {
  useEffect(() => {
    const root = document.documentElement

    const syncDisplayMode = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // iOS predates the display-mode media query for home-screen launches.
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
      root.dataset.displayMode = standalone ? "standalone" : "browser"
    }

    syncDisplayMode()
    const standaloneQuery = window.matchMedia("(display-mode: standalone)")
    standaloneQuery.addEventListener("change", syncDisplayMode)

    // Pinch-to-zoom (Safari's proprietary gesture events).
    const blockGesture = (event: Event) => event.preventDefault()
    document.addEventListener("gesturestart", blockGesture, { passive: false })
    document.addEventListener("gesturechange", blockGesture, { passive: false })
    document.addEventListener("gestureend", blockGesture, { passive: false })

    // Pinch-to-zoom on browsers that report it as a multi-touch move instead.
    const blockMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault()
    }
    document.addEventListener("touchmove", blockMultiTouch, { passive: false })

    // Double-tap zoom is already handled by `touch-action: manipulation` in
    // the base stylesheet. Doing it again here in JS would swallow the second
    // of two quick taps on the +/- steppers, so it is deliberately left alone.

    return () => {
      standaloneQuery.removeEventListener("change", syncDisplayMode)
      document.removeEventListener("gesturestart", blockGesture)
      document.removeEventListener("gesturechange", blockGesture)
      document.removeEventListener("gestureend", blockGesture)
      document.removeEventListener("touchmove", blockMultiTouch)
    }
  }, [])

  return null
}
