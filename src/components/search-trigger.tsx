"use client"

import type React from "react"
import { OPEN_PALETTE_EVENT } from "@/components/command-palette"

/** Opens the ⌘K palette from anywhere a link used to point at /search. */
export function SearchTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}>
      {children}
    </button>
  )
}
