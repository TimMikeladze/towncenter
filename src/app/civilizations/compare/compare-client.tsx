"use client"

import { useRouter } from "next/navigation"
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
    <div className="panel flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
      <Select value={a ?? ""} onValueChange={(value) => navigate({ a: value })}>
        <SelectTrigger className="h-10 w-full sm:w-64" aria-label="First civilization">
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

      <span className="label-caps px-1 text-center">vs</span>

      <Select value={b ?? ""} onValueChange={(value) => navigate({ b: value })}>
        <SelectTrigger className="h-10 w-full sm:w-64" aria-label="Second civilization">
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
    </div>
  )
}
