"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import type React from "react"
import { useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

/** Drag far enough and it goes, however slowly it was dragged. */
const DISMISS_DISTANCE = 96
/** …or flick it, however short the flick. */
const DISMISS_VELOCITY = 0.45
/** Matches the transition set on the panel when a dismiss commits. */
const CLOSE_MS = 220
/** Pulling a sheet up past its top gets progressively harder and goes nowhere. */
const OVERDRAG_RESISTANCE = 0.25
/** Travel before a touch stops being a tap on a list row and becomes a drag. */
const AXIS_LOCK = 6

/**
 * A bottom sheet that can be thrown away with a thumb.
 *
 * Radix supplies what is genuinely hard — focus trapping, inert background,
 * escape and outside-press, the accessible name — and nothing at all for the
 * part a phone user judges it on: that the sheet follows the finger, and that
 * flicking it down dismisses it. A sheet that can only be closed by a small X
 * in a corner is a dialog wearing a sheet's shape.
 *
 * `vaul` does this too, and is already in the tree, but it takes over `body`
 * with `position: fixed` and a scroll offset to work around iOS scrolling the
 * page behind it. This app's body never scrolls — the shell is a locked
 * full-height frame — so that workaround has nothing to fix and would fight
 * the layout that keeps the tab bar pinned.
 *
 * The drag is deliberately conditional: it only starts when the content under
 * the finger is already scrolled to its top, which is the rule the platform
 * uses. Otherwise a flick meant to scroll the list would throw the sheet away.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  /** Screen-reader only; the visible sheet needs no subtitle. */
  description: string
  children: React.ReactNode
  className?: string
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, allowed: false, y: 0, at: 0, delta: 0 })
  const closing = useRef(false)

  const paint = useCallback((offset: number) => {
    const panel = panelRef.current
    const overlay = overlayRef.current
    if (!panel) return
    panel.style.transform = `translate3d(0, ${offset}px, 0)`
    if (overlay) {
      const progress = Math.min(1, offset / Math.max(1, panel.offsetHeight))
      overlay.style.opacity = String(1 - progress * 0.7)
    }
  }, [])

  const settle = useCallback(() => {
    const panel = panelRef.current
    if (!panel) return
    // The drag set `transition: none` inline, which would outrank the rule that
    // makes this spring back.
    panel.style.removeProperty("transition")
    panel.removeAttribute("data-dragging")
    panel.setAttribute("data-settling", "")
    paint(0)
    setTimeout(() => panel.removeAttribute("data-settling"), CLOSE_MS)
  }, [paint])

  const dismiss = useCallback(() => {
    const panel = panelRef.current
    const overlay = overlayRef.current
    closing.current = true
    if (panel) {
      // Finish the movement the thumb started rather than handing back to the
      // exit animation, which would snap the sheet up to rest first. The
      // `data-dragging` flag stays on so that animation never runs.
      panel.style.transition = `transform ${CLOSE_MS}ms var(--ease-in-native)`
      panel.style.transform = "translate3d(0, 100%, 0)"
    }
    if (overlay) {
      overlay.style.transition = `opacity ${CLOSE_MS}ms var(--ease-standard)`
      overlay.style.opacity = "0"
    }
    setTimeout(() => {
      closing.current = false
      onOpenChange(false)
    }, CLOSE_MS)
  }, [onOpenChange])

  /** True when something between the finger and the panel can still scroll up. */
  const scrolledContentAbove = (from: EventTarget | null) => {
    let node = from instanceof Element ? from : null
    while (node && node !== panelRef.current) {
      if (node.scrollHeight - node.clientHeight > 1 && node.scrollTop > 0) return true
      node = node.parentElement
    }
    return false
  }

  const onTouchStart = (event: React.TouchEvent) => {
    if (closing.current || event.touches.length !== 1) {
      drag.current.allowed = false
      return
    }
    const touch = event.touches[0]
    drag.current = {
      active: false,
      allowed: !scrolledContentAbove(event.target),
      y: touch.clientY,
      at: Date.now(),
      delta: 0,
    }
  }

  const onTouchMove = (event: React.TouchEvent) => {
    const state = drag.current
    if (!state.allowed || closing.current) return
    const dy = event.touches[0].clientY - state.y
    if (!state.active) {
      if (dy < AXIS_LOCK) return
      state.active = true
      panelRef.current?.setAttribute("data-dragging", "")
      panelRef.current?.style.setProperty("transition", "none")
    }
    // Upward is a dead end, but it should feel like one rather than like a
    // frozen sheet.
    state.delta = dy >= 0 ? dy : dy * OVERDRAG_RESISTANCE
    paint(state.delta)
  }

  const onTouchEnd = () => {
    const state = drag.current
    if (!state.active) return
    state.active = false
    state.allowed = false
    const velocity = state.delta / Math.max(1, Date.now() - state.at)
    if (state.delta > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) dismiss()
    else settle()
  }

  // The overlay's fade is a CSS animation with a `backwards` fill, so once it
  // has finished the inline opacity written during a drag is what shows.
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        // Escape, outside press and the close button all animate out through
        // Radix's own exit; only a drag bypasses it.
        if (!next && closing.current) return
        onOpenChange(next)
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay ref={overlayRef} className="sheet-overlay" />
        <DialogPrimitive.Content
          ref={panelRef}
          className={cn("sheet-panel", className)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={settle}
          style={{ paddingBottom: "var(--safe-bottom)" }}
        >
          <div className="sheet-grabber" aria-hidden />
          <DialogPrimitive.Title className="px-5 pt-2 pb-1 font-display text-sm uppercase tracking-[0.18em]">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
