import type { LucideIcon } from "lucide-react"
import type React from "react"
import { cn } from "@/lib/utils"

/** Compact metric block used in cards, detail heroes and calculators. */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: LucideIcon
  className?: string
}) {
  return (
    <div className={cn("rounded-md border bg-background/40 px-2.5 py-2", className)}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" aria-hidden />}
        <span className="label-caps">{label}</span>
      </div>
      <p className="tabular mt-0.5 font-mono text-sm font-semibold leading-5">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Label/value line for the vertical stat lists on detail pages. */
export function StatRow({
  label,
  value,
  className,
}: {
  label: React.ReactNode
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-1.5 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular font-mono font-medium">{value}</span>
    </div>
  )
}

export function StatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>{children}</div>
}
