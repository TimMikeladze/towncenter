"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AGES } from "@/lib/game/classes"
import type { Age, CivBonus } from "@/lib/types"
import { getEntityImagePath } from "@/lib/utils/images"

interface TreeEntry {
  id: string
  name: string
  kind: string
  age: Age
  image_path: string | null
  unique?: boolean
  hp?: number
  attack?: number
}

interface TechTreeClientProps {
  civs: { id: string; name: string }[]
  tree: {
    civ: { id: string; name: string; types: string[]; teamBonus: string; bonuses: CivBonus[] }
    units: TreeEntry[]
    buildings: TreeEntry[]
    techs: TreeEntry[]
  }
  selectedAge: string
}

function EntryGrid({ entries, hrefBase }: { entries: TreeEntry[]; hrefBase: string }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing in this age.</p>
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <Link key={entry.id} href={`${hrefBase}/${entry.id}`}>
          <div className="border rounded-lg p-2 hover:bg-accent transition-colors flex items-center gap-2 h-full">
            <Image
              src={getEntityImagePath(entry.image_path)}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 object-contain shrink-0"
            />
            <div className="min-w-0">
              <div className="font-mono text-sm font-semibold truncate">
                {entry.name}
                {entry.unique && <span className="ml-2 text-[9px] uppercase border px-1 rounded">unique</span>}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {entry.kind}
                {entry.hp !== undefined && ` • ${entry.hp} HP • ${entry.attack} atk`}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function TechTreeClient({ civs, tree, selectedAge }: TechTreeClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigate = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === "all") params.delete(key)
      else params.set(key, value)
    }
    const query = params.toString()
    router.push(query ? `/tech-tree?${query}` : "/tech-tree")
  }

  const ages = selectedAge === "all" ? [...AGES] : [selectedAge as Age]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-mono font-bold">Tech Tree</h1>
              <p className="text-muted-foreground">
                Exactly what {tree.civ.name} can train, build and research, by age
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/civilizations/${tree.civ.id}`}>{tree.civ.name} details</Link>
            </Button>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="w-full md:w-64">
              <Select value={tree.civ.id} onValueChange={(value) => navigate({ civ: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select civilization" />
                </SelectTrigger>
                <SelectContent>
                  {civs.map((civ) => (
                    <SelectItem key={civ.id} value={civ.id}>
                      {civ.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedAge} onValueChange={(value) => navigate({ age: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  {AGES.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age} Age
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/civilizations/compare?a=${tree.civ.id}`}>Compare civs</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{tree.civ.name}</CardTitle>
              <CardDescription>{tree.civ.types.join(" and ")} civilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {tree.civ.bonuses
                .filter((bonus) => bonus.category !== "team")
                .slice(0, 4)
                .map((bonus) => (
                  <p key={bonus.id} className="text-sm text-muted-foreground">
                    • {bonus.description}
                  </p>
                ))}
              {tree.civ.teamBonus && (
                <p className="text-sm">
                  <span className="font-semibold">Team bonus:</span> {tree.civ.teamBonus}
                </p>
              )}
            </CardContent>
          </Card>

          {ages.map((age) => {
            const units = tree.units.filter((entry) => entry.age === age)
            const buildings = tree.buildings.filter((entry) => entry.age === age)
            const techs = tree.techs.filter((entry) => entry.age === age)
            if (units.length + buildings.length + techs.length === 0) return null

            return (
              <Card key={age}>
                <CardHeader>
                  <CardTitle>{age} Age</CardTitle>
                  <CardDescription>
                    {units.length} units • {buildings.length} buildings • {techs.length} technologies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <section className="space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Units</h3>
                    <EntryGrid entries={units} hrefBase="/units" />
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Buildings</h3>
                    <EntryGrid entries={buildings} hrefBase="/buildings" />
                  </section>
                  <section className="space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Technologies</h3>
                    <EntryGrid entries={techs} hrefBase="/technologies" />
                  </section>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
