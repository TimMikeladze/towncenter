"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-mono font-bold uppercase">Something broke</h1>
        <p className="text-sm text-muted-foreground">
          The page could not be rendered. If this keeps happening the game-data export may be missing or corrupt —
          re-run <code className="font-mono">bun run sync-data</code>.
        </p>
        {error.digest && <p className="text-[10px] font-mono text-muted-foreground">digest: {error.digest}</p>}
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
