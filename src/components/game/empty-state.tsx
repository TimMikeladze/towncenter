import type { LucideIcon } from "lucide-react"
import type React from "react"

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
}) {
  return (
    <div className="panel flex flex-col items-center gap-2 px-6 py-12 text-center">
      {Icon && <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />}
      <p className="font-display text-base font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  )
}
