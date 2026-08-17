"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { haptic } from "@/lib/haptics"
import { navHistory } from "@/lib/nav-history"

/** Back affordance sized for a thumb: 44px tall, negative margin so it does
 *  not add visual space above the title. */
const BACK_LINK_CLASS =
  "press -my-2 inline-flex min-h-11 items-center gap-1 py-2 text-sm text-muted-foreground transition-colors md:my-0 md:min-h-0 md:py-0 md:hover:text-foreground"

/**
 * "Back" that actually goes back.
 *
 * As a plain link this pushes a *new* entry for the page above, so the history
 * stack grows every time someone walks a list — open a unit, tap back, open
 * another — and the phone's own back gesture then has to unwind all of it.
 * Native back pops. So when there is an in-app screen behind this one, this
 * pops too, and the arriving screen animates in from the left like the pop it
 * is. The `href` stays as the fallback for a cold start on a deep link, where
 * there is nothing to pop to and the parent list has to be pushed for real.
 */
export function BackLink({ href, label, className }: { href: string; label: string; className?: string }) {
  const router = useRouter()

  return (
    <Link
      href={href}
      className={className ?? BACK_LINK_CLASS}
      onClick={(event) => {
        haptic("tick")
        if (!navHistory.canGoBack()) return
        event.preventDefault()
        router.back()
      }}
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  )
}
