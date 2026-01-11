"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Unit, Civilization } from "@/lib/types"

interface SearchClientProps {
  allUnits: Unit[]
  allCivs: Civilization[]
}

export function SearchClient({ allUnits, allCivs }: SearchClientProps) {
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    if (!query.trim()) return { units: [], civs: [] }

    const lowerQuery = query.toLowerCase()

    const matchingUnits = allUnits.filter(
      (unit) =>
        unit.name.toLowerCase().includes(lowerQuery) ||
        unit.type.toLowerCase().includes(lowerQuery) ||
        unit.description.toLowerCase().includes(lowerQuery),
    )

    const matchingCivs = allCivs.filter(
      (civ) =>
        civ.name.toLowerCase().includes(lowerQuery) ||
        civ.type.toLowerCase().includes(lowerQuery) ||
        civ.bonuses.some((b) => b.description.toLowerCase().includes(lowerQuery)),
    )

    return { units: matchingUnits, civs: matchingCivs }
  }, [query, allUnits, allCivs])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-mono font-bold">Search</h1>
              <p className="text-muted-foreground">Search across units and civilizations</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          <div>
            <Input
              placeholder="Search for units, civilizations, bonuses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-lg py-6"
              autoFocus
            />
          </div>

          {query.trim() && (
            <div className="space-y-6">
              {results.civs.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xl font-mono font-semibold">Civilizations ({results.civs.length})</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {results.civs.map((civ) => (
                      <Link key={civ.id} href={`/civilizations/${civ.id}`}>
                        <Card className="hover:bg-accent transition-colors cursor-pointer">
                          <CardHeader>
                            <CardTitle className="text-base">{civ.name}</CardTitle>
                            <CardDescription>{civ.type} Civilization</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-1">
                              {civ.strengths.slice(0, 3).map((strength) => (
                                <Badge key={strength} variant="secondary" className="text-xs">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.units.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xl font-mono font-semibold">Units ({results.units.length})</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {results.units.map((unit) => (
                      <Link key={unit.id} href={`/units/${unit.id}`}>
                        <Card className="hover:bg-accent transition-colors cursor-pointer">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{unit.name}</CardTitle>
                                <CardDescription>
                                  {unit.type} • {unit.age} Age
                                </CardDescription>
                              </div>
                              {unit.civSpecific && (
                                <Badge variant="default" className="text-xs">
                                  Unique
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">{unit.description}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.units.length === 0 && results.civs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No results found for "{query}"</p>
                </div>
              )}
            </div>
          )}

          {!query.trim() && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Start typing to search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
