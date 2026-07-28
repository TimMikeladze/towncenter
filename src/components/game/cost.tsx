import type React from "react"
import type { UnitCost } from "@/lib/types"
import { cn } from "@/lib/utils"

const RESOURCES = [
  { key: "food", label: "Food", short: "F", tone: "var(--resource-food)" },
  { key: "wood", label: "Wood", short: "W", tone: "var(--resource-wood)" },
  { key: "gold", label: "Gold", short: "G", tone: "var(--resource-gold)" },
  { key: "stone", label: "Stone", short: "S", tone: "var(--resource-stone)" },
] as const

/**
 * Costs are read at a glance everywhere in the app, so they always render as
 * the same coloured amount + resource initial.
 */
export function CostChips({
  cost,
  className,
  size = "sm",
}: {
  cost: UnitCost
  className?: string
  size?: "sm" | "md"
}) {
  const entries = RESOURCES.filter((resource) => {
    const amount = cost[resource.key]
    return typeof amount === "number" && amount > 0
  })

  if (entries.length === 0) {
    return <span className="font-mono text-xs text-muted-foreground">Free</span>
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {entries.map((resource) => (
        <span
          key={resource.key}
          title={`${cost[resource.key]} ${resource.label}`}
          className={cn(
            "tabular inline-flex items-center gap-1 rounded-md border px-1.5 font-mono font-medium leading-5",
            size === "sm" ? "text-[11px]" : "text-xs",
          )}
          style={
            {
              borderColor: `color-mix(in srgb, ${resource.tone} 40%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${resource.tone} 10%, transparent)`,
              color: resource.tone,
            } as React.CSSProperties
          }
        >
          {cost[resource.key]}
          <span className="opacity-70">{resource.short}</span>
        </span>
      ))}
    </div>
  )
}
