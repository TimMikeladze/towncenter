"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

/** A reload, not a router refresh: there may be no worker-cached route to route to. */
export function RetryButton() {
  return (
    <Button className="press" onClick={() => window.location.reload()}>
      <RefreshCw className="h-4 w-4" />
      Try again
    </Button>
  )
}
