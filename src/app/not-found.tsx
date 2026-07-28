import { Compass } from "lucide-react"
import Link from "next/link"
import { PageShell } from "@/components/layout/page-shell"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <PageShell width="narrow">
      <div className="panel flex flex-col items-center gap-3 px-6 py-16 text-center">
        <Compass className="h-6 w-6 text-muted-foreground" aria-hidden />
        <h1 className="text-2xl">Not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          That unit, civilization, building or technology does not exist.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/units">Browse units</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
