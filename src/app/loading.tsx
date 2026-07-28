import { PageShell } from "@/components/layout/page-shell"

/** Skeleton mirrors the standard page frame: header block, toolbar, card grid. */
export default function Loading() {
  return (
    <PageShell>
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="panel h-16 animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => index).map((index) => (
          <div key={index} className="panel h-52 animate-pulse" />
        ))}
      </div>
    </PageShell>
  )
}
