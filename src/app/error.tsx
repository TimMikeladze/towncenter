"use client"

import { TriangleAlert } from "lucide-react"
import { useEffect } from "react"
import { PageShell } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <PageShell width="narrow">
      <div className="panel flex flex-col items-center gap-3 px-6 py-16 text-center">
        <TriangleAlert className="h-6 w-6 text-destructive" aria-hidden />
        <h1 className="text-2xl">Something broke</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page could not be rendered. If this keeps happening the game-data export may be missing or corrupt —
          re-run <code className="kbd-shortcut">bun run sync-data</code>.
        </p>
        {error.digest && <p className="font-mono text-[11px] text-muted-foreground">digest: {error.digest}</p>}
        <Button onClick={reset} className="mt-2">
          Try again
        </Button>
      </div>
    </PageShell>
  )
}
