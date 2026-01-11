"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllCivilizations, getAllUnits, getCivilizationById } from "@/lib/data"
import type { Age } from "@/lib/types"
import { SecondaryNav } from "@/components/secondary-nav"

const secondaryNavItems = [
  { label: "All Ages", value: "all" },
  { label: "Dark", value: "Dark" },
  { label: "Feudal", value: "Feudal" },
  { label: "Castle", value: "Castle" },
  { label: "Imperial", value: "Imperial" },
]

function TechTreeContent() {
  const searchParams = useSearchParams()
  const initialCiv = searchParams.get("civ") || "britons"
  const [selectedCiv, setSelectedCiv] = useState(initialCiv)
  const [selectedAge, setSelectedAge] = useState<Age | "all">("all")

  const allCivs = getAllCivilizations()
  const currentCiv = getCivilizationById(selectedCiv)
  const allUnits = getAllUnits()

  // Filter units based on civ and age
  const availableUnits = allUnits.filter((unit) => {
    // Check if unit is available to this civ
    if (unit.civSpecific && unit.civSpecific !== selectedCiv) return false

    // Check if unit is in the missing units list
    if (currentCiv && currentCiv.techTree.missingUnits.includes(unit.id)) return false

    // Filter by age if not "all"
    if (selectedAge !== "all" && unit.age !== selectedAge) return false

    return true
  })

  // Group units by age
  const unitsByAge = {
    Dark: availableUnits.filter((u) => u.age === "Dark"),
    Feudal: availableUnits.filter((u) => u.age === "Feudal"),
    Castle: availableUnits.filter((u) => u.age === "Castle"),
    Imperial: availableUnits.filter((u) => u.age === "Imperial"),
  }

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" onValueChange={(value) => setSelectedAge(value as Age | "all")} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-mono font-bold">Tech Tree</h1>
                <p className="text-muted-foreground">View available units and technologies per civilization</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                <div className="w-full md:w-64">
                  <Select value={selectedCiv} onValueChange={setSelectedCiv}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select civilization" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCivs.map((civ) => (
                        <SelectItem key={civ.id} value={civ.id}>
                          {civ.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {currentCiv && (
                <Button variant="outline" asChild>
                  <Link href={`/civilizations/${currentCiv.id}`}>View {currentCiv.name} Details</Link>
                </Button>
              )}
            </div>

            {currentCiv && (
              <Card>
                <CardHeader>
                  <CardTitle>{currentCiv.name} Overview</CardTitle>
                  <CardDescription>{currentCiv.type} Civilization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Key Bonuses</p>
                    <div className="space-y-1">
                      {currentCiv.bonuses.slice(0, 3).map((bonus) => (
                        <p key={bonus.id} className="text-sm text-muted-foreground">
                          • {bonus.description}
                        </p>
                      ))}
                    </div>
                  </div>

                  {currentCiv.techTree.missingUnits.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2 text-destructive">Missing Units</p>
                      <div className="flex flex-wrap gap-2">
                        {currentCiv.techTree.missingUnits.map((unitId) => (
                          <span key={unitId} className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                            {unitId.replace(/-/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedAge === "all" ? (
              // Show all ages in separate sections
              <div className="space-y-6">
                {(["Dark", "Feudal", "Castle", "Imperial"] as Age[]).map((age) => {
                  const ageUnits = unitsByAge[age]
                  if (ageUnits.length === 0) return null

                  return (
                    <Card key={age}>
                      <CardHeader>
                        <CardTitle>{age} Age</CardTitle>
                        <CardDescription>{ageUnits.length} units available</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {ageUnits.map((unit) => (
                            <Link key={unit.id} href={`/units/${unit.id}`}>
                              <div className="border rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-mono font-semibold text-sm">{unit.name}</h3>
                                    <p className="text-xs text-muted-foreground">{unit.type}</p>
                                  </div>
                                  {unit.civSpecific === selectedCiv && (
                                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                      Unique
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  <span>
                                    <span className="text-muted-foreground">HP:</span> {unit.stats.hp}
                                  </span>
                                  <span>
                                    <span className="text-muted-foreground">Atk:</span> {unit.stats.attack}
                                  </span>
                                  <span>
                                    <span className="text-muted-foreground">Armor:</span> {unit.stats.meleeArmor}/
                                    {unit.stats.pierceArmor}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              // Show only selected age
              <Card>
                <CardHeader>
                  <CardTitle>{selectedAge} Age Units</CardTitle>
                  <CardDescription>{availableUnits.length} units available</CardDescription>
                </CardHeader>
                <CardContent>
                  {availableUnits.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {availableUnits.map((unit) => (
                        <Link key={unit.id} href={`/units/${unit.id}`}>
                          <div className="border rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-mono font-semibold text-sm">{unit.name}</h3>
                                <p className="text-xs text-muted-foreground">{unit.type}</p>
                              </div>
                              {unit.civSpecific === selectedCiv && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                  Unique
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span>
                                <span className="text-muted-foreground">HP:</span> {unit.stats.hp}
                              </span>
                              <span>
                                <span className="text-muted-foreground">Atk:</span> {unit.stats.attack}
                              </span>
                              <span>
                                <span className="text-muted-foreground">Armor:</span> {unit.stats.meleeArmor}/
                                {unit.stats.pierceArmor}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No units available in this age</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function TechTreePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TechTreeContent />
    </Suspense>
  )
}
