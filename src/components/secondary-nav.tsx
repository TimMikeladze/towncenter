"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SecondaryNavItem {
  label: string
  value: string
  href?: string
}

interface SecondaryNavProps {
  items: SecondaryNavItem[]
  defaultValue?: string
  onValueChange?: (value: string) => void
  type?: "tabs" | "links"
}

function SecondaryNavContent({ items, defaultValue, onValueChange, type = "tabs" }: SecondaryNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || defaultValue || items[0]?.value

  if (type === "links") {
    return (
      <div className="w-full border-b bg-muted/10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1 h-10 overflow-x-auto">
            {items.map((item) => {
              const isActive = item.href ? pathname === item.href : currentTab === item.value
              return (
                <Link key={item.value} href={item.href || `?tab=${item.value}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "font-mono text-[10px] h-8 px-3 uppercase tracking-wider rounded-none border-b-2 border-transparent",
                      isActive && "border-foreground bg-muted",
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border-b bg-muted/10">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center gap-1 h-10 overflow-x-auto">
          {items.map((item) => {
            const isActive = currentTab === item.value
            return (
              <Button
                key={item.value}
                variant="ghost"
                size="sm"
                onClick={() => onValueChange?.(item.value)}
                className={cn(
                  "font-mono text-[10px] h-8 px-3 uppercase tracking-wider rounded-none border-b-2 border-transparent",
                  isActive && "border-foreground bg-muted",
                )}
              >
                {item.label}
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

function SecondaryNavFallback({ items, defaultValue }: Pick<SecondaryNavProps, "items" | "defaultValue">) {
  const currentTab = defaultValue || items[0]?.value

  return (
    <div className="w-full border-b bg-muted/10">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center gap-1 h-10 overflow-x-auto">
          {items.map((item) => {
            const isActive = currentTab === item.value
            return (
              <Button
                key={item.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "font-mono text-[10px] h-8 px-3 uppercase tracking-wider rounded-none border-b-2 border-transparent",
                  isActive && "border-foreground bg-muted",
                )}
              >
                {item.label}
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export function SecondaryNav(props: SecondaryNavProps) {
  return (
    <Suspense fallback={<SecondaryNavFallback items={props.items} defaultValue={props.defaultValue} />}>
      <SecondaryNavContent {...props} />
    </Suspense>
  )
}
