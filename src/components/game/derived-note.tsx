import { Info } from "lucide-react"

/**
 * Marks output that this app computes rather than reads out of the game files.
 *
 * Everything else on the site is the shipped game data. The counter engine and
 * the unit/building categories are our own model on top of it, so they carry
 * this note wherever they appear.
 */
export function DerivedNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-md border border-dashed px-3 py-2 text-[13px] text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  )
}
