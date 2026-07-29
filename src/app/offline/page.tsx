import { CloudOff } from "lucide-react"
import Link from "next/link"
import { PageShell } from "@/components/layout/page-shell"
import { RetryButton } from "@/components/pwa/retry-button"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Offline — Town Center",
}

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
