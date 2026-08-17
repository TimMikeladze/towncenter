"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * A horizontally scrolling strip of chips or tabs.
 *
 * A phone shows no scrollbar, so a rail that overflows looks identical to one
 * that does not — the row just appears to be cut off at the screen edge. This
 * fades whichever edge still has content behind it, and drops the fade the
 * moment there is nothing more that way, so the cue is never a lie.
 */
export function Rail({ children, className, ...props }: React.ComponentProps<"div"> & { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: false, end: false })

  const measure = useCallback(() => {
    const node = ref.current
    if (!node) return
    const max = node.scrollWidth - node.clientWidth
    // 1px of slack: sub-pixel layout means scrollLeft rarely hits max exactly.
    setEdges({ start: node.scrollLeft > 1, end: node.scrollLeft < max - 1 })
  }, [])

  useEffect(() => {
    const node = ref.current
    if (!node) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    for (const child of Array.from(node.children)) observer.observe(child)
    return () => observer.disconnect()
  }, [measure])

  return (
    <div
      ref={ref}
      onScroll={measure}
      data-fade-start={edges.start || undefined}
      data-fade-end={edges.end || undefined}
      className={cn("rail rail-fade", className)}
      {...props}
    >
      {children}
    </div>
  )
}
