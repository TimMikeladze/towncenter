"use client"

import { useState } from "react"
import { SecondaryNav } from "@/components/secondary-nav"
import { getAllTechnologies } from "@/lib/data"
import { Card } from "@/components/ui/card"
import { Sparkles, Clock } from "lucide-react"
import Link from "next/link"

const secondaryNavItems = [
  { label: "All", value: "all" },
  { label: "Economy", value: "eco" },
  { label: "Military", value: "military" },
  { label: "Unique", value: "Unique" },
]

export default function TechnologiesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const technologies = getAllTechnologies()

  const filteredTechs =
    activeTab === "all"
      ? technologies
      : activeTab === "eco"
        ? technologies.filter((t) => ["Town Center", "Mill", "Lumber", "Mining", "Market"].includes(t.category))
        : activeTab === "military"
          ? technologies.filter((t) =>
              ["Blacksmith", "Barracks", "Archery", "Stable", "Monastery", "Dock", "University", "Castle"].includes(
                t.category,
              ),
            )
          : technologies.filter((t) => t.category === activeTab)

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" onValueChange={setActiveTab} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h1 className="text-xl font-mono font-bold uppercase tracking-tight">Technologies</h1>
                <p className="text-muted-foreground text-[10px] mt-0.5 uppercase tracking-wide">
                  Showing {filteredTechs.length} of {technologies.length} technologies
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTechs.map((tech) => (
                <Link key={tech.id} href={`/technologies/${tech.id}`}>
                  <Card className="p-3 hover:border-foreground transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-mono font-bold text-sm uppercase">{tech.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 text-[9px] border rounded uppercase">{tech.category}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">{tech.age}</span>
                        </div>
                      </div>
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2 my-2">
                      {tech.description}
                    </p>

                    <div className="border-t pt-2 space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-bold uppercase">Cost:</span>
                        <span className="font-mono">
                          {tech.cost.food && `${tech.cost.food}F `}
                          {tech.cost.wood && `${tech.cost.wood}W `}
                          {tech.cost.gold && `${tech.cost.gold}G`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-bold uppercase">Research:</span>
                        <span className="font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tech.researchTime}s
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
