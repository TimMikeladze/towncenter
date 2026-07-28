import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-mono font-bold uppercase">Not found</h1>
        <p className="text-sm text-muted-foreground">That unit, civilization, building or technology does not exist.</p>
        <Button asChild>
          <Link href="/units">Browse units</Link>
        </Button>
      </div>
    </div>
  )
}
