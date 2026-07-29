import { PageShell } from "@/components/layout/page-shell"

/**
 * Skeleton mirrors the standard page frame: header block, toolbar, card grid.
 *
 * Shaped like the page that is coming rather than a spinner in the middle of
 * an empty screen — the layout does not jump when the real content lands,
 * which is most of what makes a native screen feel like it opened instantly
 * even when it did not.
 */
export default function Loading() {
  return (
    <PageShell>
      <div className="space-y-2">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-4 w-80 max-w-full" />
      </div>
      <div className="skeleton h-16 rounded-lg" />
      {/*
        Card heights follow the real cards, which are short rows on a phone and
        tall tiles from `md` up. A grid of tall tiles on a phone is a skeleton
        promising a page that never arrives, and the swap is the jolt this is
        supposed to prevent.
      */}
      <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => index).map((index) => (
          <div key={index} className="skeleton h-48 rounded-lg md:h-52" />
        ))}
      </div>
    </PageShell>
  )
}
