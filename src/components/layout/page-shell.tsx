import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import type React from "react"
import { cn } from "@/lib/utils"

type Width = "narrow" | "default" | "wide"

const WIDTHS: Record<Width, string> = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
}

/**
 * The single page frame. Every route renders inside one so gutters, max width
 * and vertical rhythm never drift between pages.
 */
export function PageShell({
  children,
  width = "wide",
  className,
}: {
  children: React.ReactNode
  width?: Width
  className?: string
}) {
  return (
    <div className="px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:pb-12 lg:pt-8">
      <div className={cn("mx-auto space-y-5 lg:space-y-8", WIDTHS[width], className)}>{children}</div>
    </div>
  )
}

/** Back affordance sized for a thumb: 44px tall, negative margin so it does
 *  not add visual space above the title. */
const BACK_LINK_CLASS =
  "press -my-2 inline-flex min-h-11 items-center gap-1 py-2 text-sm text-muted-foreground transition-colors md:my-0 md:min-h-0 md:py-0 md:hover:text-foreground"

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={BACK_LINK_CLASS}>
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  )
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  back,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  actions?: React.ReactNode
  back?: { href: string; label: string }
}) {
  return (
    <header className="space-y-2.5 sm:space-y-3">
      {back && (
        <Link href={back.href} className={BACK_LINK_CLASS}>
          <ChevronLeft className="h-4 w-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0 space-y-1.5">
          {eyebrow && <p className="label-caps">{eyebrow}</p>}
          <h1 className="text-[26px] leading-tight sm:text-3xl">{title}</h1>
          {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="space-y-1">
            {title && <h2 className="rule-accent text-lg leading-none">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

/**
 * Bordered panel used for section bodies; matches Card without its padding
 * rules.
 *
 * `min-w-0` is load-bearing. Grid and flex items default to `min-width: auto`,
 * so a panel refuses to shrink below the min-content of anything inside it —
 * one `whitespace-nowrap` select label is enough to push the panel wider than
 * the phone screen. This lets the track win instead, and the nowrap content
 * clips inside its own box where it belongs.
 */
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("panel min-w-0 p-4 sm:p-5", className)}>{children}</div>
}
