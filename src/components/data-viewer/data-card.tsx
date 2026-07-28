import Link from "next/link"
import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DataItem, DataViewerConfig } from "./types"

interface DataCardProps<T extends DataItem> {
  item: T
  config: DataViewerConfig<T>
}

export function DataCard<T extends DataItem>({ item, config }: DataCardProps<T>) {
  const href = config.itemLink?.(item)
  const CardWrapper = href
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={href} className="group block">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => <>{children}</>

  return (
    <CardWrapper>
      <Card className="border-2 card-minimal h-full overflow-hidden bg-card">
        {/* Header Image/Color Bar */}
        {config.cardHeader?.(item)}

        <CardHeader className="space-y-1.5 py-3 px-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-mono font-bold tracking-tight uppercase">
                {config.cardTitle(item)}
              </CardTitle>
              {config.cardDescription && (
                <CardDescription className="mt-1 text-[10px] font-mono uppercase tracking-wider">
                  {config.cardDescription(item)}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 text-xs font-mono py-3 px-4">{config.cardContent(item)}</CardContent>
      </Card>
    </CardWrapper>
  )
}
