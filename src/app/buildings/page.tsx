import { Building2, Clock, Eye, Shield } from "lucide-react"
import Link from "next/link"
import { SecondaryNav } from "@/components/secondary-nav"
import { Card } from "@/components/ui/card"
import { getAllBuildings } from "@/lib/data"

const secondaryNavItems = [
  { label: "All", value: "all" },
  { label: "Military", value: "Military" },
  { label: "Economic", value: "Eco" },
  { label: "Science", value: "Science" },
  { label: "Defense", value: "Tower" },
]

export default async function BuildingsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams
  const activeTab = params.type || "all"
  const buildings = await getAllBuildings()

  const filteredBuildings = activeTab === "all" ? buildings : buildings.filter((b) => b.type === activeTab)

  return (
    <>
      <SecondaryNav items={secondaryNavItems} defaultValue="all" currentValue={activeTab} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h1 className="text-xl font-mono font-bold uppercase tracking-tight">Buildings</h1>
                <p className="text-muted-foreground text-[10px] mt-0.5 uppercase tracking-wide">
                  Showing {filteredBuildings.length} of {buildings.length} structures
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBuildings.map((building) => (
                <Link key={building.id} href={`/buildings/${building.id}`}>
                  <Card className="p-3 hover:border-foreground transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-mono font-bold text-sm uppercase">{building.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 text-[9px] border rounded uppercase">{building.type}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">{building.age}</span>
                        </div>
                      </div>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3 text-[10px] font-mono">
                      <div className="flex items-center gap-1 border p-1.5">
                        <Shield className="h-3 w-3" />
                        <span className="text-muted-foreground">HP:</span>
                        <span className="font-bold">{building.hitPoints}</span>
                      </div>
                      <div className="flex items-center gap-1 border p-1.5">
                        <Eye className="h-3 w-3" />
                        <span className="text-muted-foreground">LOS:</span>
                        <span className="font-bold">{building.lineOfSight}</span>
                      </div>
                    </div>

                    <div className="border-t pt-2 space-y-1 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-bold uppercase">Cost:</span>
                        <span className="font-mono">
                          {building.cost.food && `${building.cost.food}F `}
                          {building.cost.wood && `${building.cost.wood}W `}
                          {building.cost.stone && `${building.cost.stone}S `}
                          {building.cost.gold && `${building.cost.gold}G`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-bold uppercase">Build Time:</span>
                        <span className="font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {building.buildTime}s
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
