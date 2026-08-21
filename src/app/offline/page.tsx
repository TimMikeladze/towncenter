import { CloudOff } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { PageShell } from "@/components/layout/page-shell"
import { RetryButton } from "@/components/pwa/retry-button"
import { Button } from "@/components/ui/button"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Offline",
  description: "Town Center could not reach the network. Pages already visited on this device still work.",
  path: "/offline",
  // A service-worker fallback with no content of its own — nothing to index,
  // and indexing it would put an error page in the results for the site name.
  noIndex: true,
})

/**
 * What the service worker serves for a page that was never visited while the
 * connection was up. Static on purpose: it has to render from the cache with
 * no server and no data behind it.
 */
export default function OfflinePage() {
  return (
    <PageShell width="narrow">
      <div className="panel flex flex-col items-center gap-3 px-6 py-16 text-center">
        <CloudOff className="h-6 w-6 text-muted-foreground" aria-hidden />
        <h1 className="text-2xl">No connection</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This page has not been opened before, so there is no copy of it on the device. Anything already visited still
          works.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <RetryButton />
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
