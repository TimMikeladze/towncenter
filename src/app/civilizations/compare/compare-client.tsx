"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CivComparePickerProps {
  options: { id: string; name: string }[]
  a?: string
  b?: string
}

export function CivComparePicker({ options, a, b }: CivComparePickerProps) {
  const router = useRouter()

  const navigate = (next: { a?: string; b?: string }) => {
    const params = new URLSearchParams()
    const civA = next.a ?? a
    const civB = next.b ?? b
    if (civA) params.set("a", civA)
    if (civB) params.set("b", civB)
    router.push(`/civilizations/compare?${params.toString()}`)
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-6 md:flex-row md:items-center">
        <Select value={a ?? ""} onValueChange={(value) => navigate({ a: value })}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="First civilization" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-muted-foreground font-mono text-sm">vs</span>

        <Select value={b ?? ""} onValueChange={(value) => navigate({ b: value })}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="Second civilization" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
