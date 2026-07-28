import { Castle, Home, Map as MapIcon, Network, Scroll, Search, Shield, Swords, TrendingUp } from "lucide-react"
import Link from "next/link"
import { SearchTrigger } from "@/components/search-trigger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b">
        <div className="container relative mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-6 text-center">
            <div className="inline-block px-3 py-1 border rounded-sm">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Definitive Edition</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-mono font-bold tracking-tighter uppercase">
              AoE2:DE
              <br />
              Companion
            </h1>
            <p className="text-xs md:text-sm font-mono text-muted-foreground max-w-2xl mx-auto leading-relaxed tracking-wide uppercase">
              Complete reference guide for Age of Empires II: Definitive Edition. Master unit stats, civilization
              bonuses, tech trees, and competitive strategies.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button size="lg" asChild className="font-mono text-xs border-2">
                <Link href="/units">
                  <Swords className="mr-2 h-3 w-3" />
                  Explore Units
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="font-mono text-xs border-2 bg-transparent">
                <Link href="/civilizations">View Civilizations</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/units" className="group">
              <Card className="border-2 card-minimal cursor-pointer h-full overflow-hidden bg-card">
                <CardHeader className="space-y-2 py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 border">
                      <Swords className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-mono font-bold tracking-tight uppercase">
                      Unit Database
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-mono text-muted-foreground leading-tight uppercase">
                    Browse and compare all units with detailed stats
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] font-mono text-muted-foreground leading-tight tracking-wide">
                    Filter by type, compare units side-by-side, view counters and upgrade paths
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/civilizations" className="group">
              <Card className="border-2 card-minimal cursor-pointer h-full overflow-hidden bg-card">
                <CardHeader className="space-y-2 py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 border">
                      <Castle className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-mono font-bold tracking-tight uppercase">
                      Civilizations
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-mono text-muted-foreground leading-tight uppercase">
                    Explore bonuses, unique units, and tech trees
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] font-mono text-muted-foreground leading-tight tracking-wide">
                    Detailed civ guides with strengths, weaknesses, and team bonuses
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/buildings" className="group">
              <Card className="border-2 card-minimal cursor-pointer h-full overflow-hidden bg-card">
                <CardHeader className="space-y-2 py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 border">
                      <Home className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-mono font-bold tracking-tight uppercase">Buildings</CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-mono text-muted-foreground leading-tight uppercase">
                    All structures and defenses
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] font-mono text-muted-foreground leading-tight tracking-wide">
                    Military, economic, defensive structures with complete stats
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/technologies" className="group">
              <Card className="border-2 card-minimal cursor-pointer h-full overflow-hidden bg-card">
                <CardHeader className="space-y-2 py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 border">
                      <Scroll className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-mono font-bold tracking-tight uppercase">Technologies</CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-mono text-muted-foreground leading-tight uppercase">
                    Research upgrades and improvements
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] font-mono text-muted-foreground leading-tight tracking-wide">
                    All technologies with costs, effects, and affected units
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/maps" className="group">
              <Card className="border-2 card-minimal cursor-pointer h-full overflow-hidden bg-card">
                <CardHeader className="space-y-2 py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 border">
                      <MapIcon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-mono font-bold tracking-tight uppercase">Maps</CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-mono text-muted-foreground leading-tight uppercase">
                    All competitive and casual maps
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] font-mono text-muted-foreground leading-tight tracking-wide">
                    Map types, characteristics, and recommended civilizations
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tech-tree" className="group">
              <Card className="border-2 card-minimal cursor-pointer h-full overflow-hidden bg-card">
                <CardHeader className="space-y-2 py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 border">
                      <Network className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-mono font-bold tracking-tight uppercase">Tech Tree</CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-mono text-muted-foreground leading-tight uppercase">
                    Interactive tech tree viewer
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] font-mono text-muted-foreground leading-tight tracking-wide">
                    View available units and technologies per civilization
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/counters" className="group">
              <Card className="border-2 card-minimal cursor-pointer h-full overflow-hidden bg-card">
                <CardHeader className="space-y-2 py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 border">
                      <Shield className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-mono font-bold tracking-tight uppercase">
                      Unit Counters
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-mono text-muted-foreground leading-tight uppercase">
                    Counter relationships and matchups
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] font-mono text-muted-foreground leading-tight tracking-wide">
                    Learn what beats what and optimize your army composition
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/competitive" className="group">
              <Card className="border-2 card-minimal cursor-pointer h-full overflow-hidden bg-card">
                <CardHeader className="space-y-2 py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 border">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-mono font-bold tracking-tight uppercase">Competitive</CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-mono text-muted-foreground leading-tight uppercase">
                    Matchups, build orders, and calculators
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] font-mono text-muted-foreground leading-tight tracking-wide">
                    Win rates, strategy guides, and resource calculators
                  </p>
                </CardContent>
              </Card>
            </Link>

            <SearchTrigger className="group w-full text-left">
              <Card className="border-2 card-minimal cursor-pointer h-full overflow-hidden bg-card">
                <CardHeader className="space-y-2 py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 border">
                      <Search className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-mono font-bold tracking-tight uppercase">Search</CardTitle>
                  </div>
                  <CardDescription className="text-[10px] font-mono text-muted-foreground leading-tight uppercase">
                    Find units and civilizations quickly
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-3 px-4">
                  <p className="text-[10px] font-mono text-muted-foreground leading-tight tracking-wide">
                    Search across all content for units, civs, and bonuses
                  </p>
                </CardContent>
              </Card>
            </SearchTrigger>
          </div>

          <div className="pt-8 border-t">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-muted/30 rounded-sm border-2">
              <div className="font-mono">
                <p className="text-[10px] font-bold uppercase tracking-widest">[v1.0.0]</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">Data from AoE2:DE patch 113494</p>
              </div>
              <Button size="lg" asChild className="font-mono text-xs border-2">
                <Link href="/units">
                  Get Started
                  <Swords className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
