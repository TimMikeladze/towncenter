"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useRef } from "react"
import { Rail } from "@/components/ui/rail"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"

interface SecondaryNavItem {
  label: string
  value: string
}

interface SecondaryNavProps {
  items: SecondaryNavItem[]
  defaultValue: string
  currentValue?: string
}

/**
 * Category rail that sits directly under the header. Scrolls horizontally on
 * touch, and keeps its selection in the `type` search param.
 */
export function SecondaryNav(props: SecondaryNavProps) {
  return (
    <Suspense fallback={<div className="h-11 border-b" />}>
      <SecondaryNavInner {...props} />
    </Suspense>
  )
}

function SecondaryNavInner({ items, defaultValue, currentValue }: SecondaryNavProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const railRef = useRef<HTMLDivElement>(null)

  const activeValue = currentValue || searchParams.get("type") || defaultValue

  const select = useCallback(
    (value: string) => {
      haptic("tick")
      const params = new URLSearchParams(searchParams.toString())
      if (value === defaultValue) params.delete("type")
      else params.set("type", value)
      const query = params.toString()
      router.push(query ? `?${query}` : "?", { scroll: false })
    },
    [router, searchParams, defaultValue],
  )

  /*
   * A selection that is scrolled off the end of the rail is a selection nobody
   * can see. This matters most on arrival — a shared link to `?type=Cavalry`
   * lands with the rail at its start and the active chip somewhere off the
   * right edge — so it runs on every change of the active value, not just on
   * a tap.
   *
   * biome-ignore lint/correctness/useExhaustiveDependencies: the active value is the trigger — the effect reads the DOM it produced, not the value itself.
   */
  useEffect(() => {
    const chip = railRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    // `nearest` on the block axis so bringing a chip into view sideways never
    // also scrolls the page vertically.
    chip?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" })
  }, [activeValue])

  return (
    // Sticky to the top of the content pane, which already starts below the
    // header — so this pins at 0 rather than clearing anything.
    <div ref={railRef} className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
      <Rail className="gap-1.5 px-3 py-2 sm:px-4">
        {items.map((item) => {
          const active = activeValue === item.value
          return (
            <button
              type="button"
              key={item.value}
              onClick={() => select(item.value)}
              aria-pressed={active}
              data-active={active}
              className={cn(
                "press h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
                active
                  ? "border-primary/50 bg-primary/12 text-primary"
                  : "border-border/70 text-muted-foreground md:hover:bg-muted md:hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          )
        })}
      </Rail>
    </div>
  )
}
