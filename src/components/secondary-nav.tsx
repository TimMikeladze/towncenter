"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface SecondaryNavItem {
  label: string
  value: string
}

interface SecondaryNavProps {
  items: SecondaryNavItem[]
  defaultValue: string
  currentValue?: string
}

export function SecondaryNav({ items, defaultValue, currentValue }: SecondaryNavProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeValue = currentValue || searchParams.get('type') || defaultValue

  const handleValueChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === defaultValue) {
      params.delete('type')
    } else {
      params.set('type', value)
    }
    router.push(`?${params.toString()}`)
  }, [router, searchParams, defaultValue])

  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto">
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => handleValueChange(item.value)}
              className={`px-4 py-2 text-sm font-mono uppercase tracking-wide transition-colors ${
                activeValue === item.value
                  ? 'border-b-2 border-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
