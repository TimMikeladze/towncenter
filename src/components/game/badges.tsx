import type React from "react"
import type { Age } from "@/lib/types"
import { cn } from "@/lib/utils"

const AGE_TONE: Record<string, string> = {
  Dark: "var(--age-dark)",
  Feudal: "var(--age-feudal)",
  Castle: "var(--age-castle)",
  Imperial: "var(--age-imperial)",
}

const TYPE_TONE: Record<string, string> = {
  Infantry: "var(--type-infantry)",
  Archer: "var(--type-archer)",
  Cavalry: "var(--type-cavalry)",
  Siege: "var(--type-siege)",
  Monk: "var(--type-monk)",
  Naval: "var(--type-naval)",
  Economy: "var(--type-economy)",
  Unique: "var(--type-unique)",
}

/**
 * One chip shape for every taxonomy in the app. `tone` colours the text, the
 * border and a 10% background wash so chips stay legible in both themes.
 */
export function Chip({
  children,
  tone,
  className,
  title,
}: {
  children: React.ReactNode
  tone?: string
  className?: string
  title?: string
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase leading-4 tracking-[0.08em]",
        tone ? "border-[color-mix(in_srgb,var(--tone)_45%,transparent)] text-[var(--tone)]" : "text-muted-foreground",
        className,
      )}
      style={
        tone
          ? ({
              "--tone": tone,
              backgroundColor: "color-mix(in srgb, var(--tone) 12%, transparent)",
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </span>
  )
}

export function AgeBadge({ age, className }: { age: Age | string; className?: string }) {
  return (
    <Chip tone={AGE_TONE[age] ?? "var(--age-dark)"} className={className}>
      {age}
    </Chip>
  )
}

export function TypeBadge({ type, className }: { type: string; className?: string }) {
  return (
    <Chip tone={TYPE_TONE[type]} className={className}>
      {type}
    </Chip>
  )
}
