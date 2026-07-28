"use client"

import { Heart, Shield, Swords, Target, Zap } from "lucide-react"
import Image from "next/image"
import type { DataViewerConfig } from "@/components/data-viewer"
import { DataViewer } from "@/components/data-viewer"
import { costEfficiency, resourceCost } from "@/lib/game/combat"
import type { Unit } from "@/lib/types"
import { getEntityImagePath } from "@/lib/utils/images"

interface UnitsClientProps {
  allUnits: Unit[]
  filteredUnits: Unit[]
}

export function UnitsClient({ allUnits, filteredUnits }: UnitsClientProps) {
  const config: DataViewerConfig<Unit> = {
    itemName: "units",
    searchFields: ["name", "type", "age", "description"],
    searchPlaceholder: "Search units...",

    filters: [
      {
        key: "age",
        label: "Age",
        options: [
          { label: "All Ages", value: "all" },
          { label: "Dark", value: "Dark" },
          { label: "Feudal", value: "Feudal" },
          { label: "Castle", value: "Castle" },
          { label: "Imperial", value: "Imperial" },
        ],
        filterFn: (unit, value) => value === "all" || unit.age === value,
      },
    ],

    sortOptions: [
      { key: "name", label: "Name", sortFn: (a, b) => a.name.localeCompare(b.name) },
      { key: "hp", label: "HP", sortFn: (a, b) => b.stats.hp - a.stats.hp },
      { key: "attack", label: "Attack", sortFn: (a, b) => b.stats.attack - a.stats.attack },
      { key: "cost", label: "Cost", sortFn: (a, b) => resourceCost(a) - resourceCost(b) },
      {
        key: "efficiency",
        label: "Cost efficiency",
        sortFn: (a, b) => costEfficiency(b) - costEfficiency(a),
      },
    ],

    cardTitle: (unit) => unit.name,
    cardDescription: (unit) => (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 text-[9px] font-bold border rounded uppercase tracking-wider">{unit.type}</span>
        <span className="text-[9px]">•</span>
        <span className="text-[9px] font-bold uppercase tracking-wider">{unit.age} Age</span>
      </div>
    ),
    cardHeader: (unit) => (
      <div className="relative h-24 bg-muted flex items-center justify-center border-b">
        <Image
          src={getEntityImagePath(unit.image_path)}
          alt={unit.name}
          width={64}
          height={64}
          className="h-16 w-16 object-contain"
        />
        {unit.civSpecific && (
          <div className="absolute top-1 right-1">
            <span className="px-2 py-0.5 text-[9px] font-bold rounded border-2 bg-background uppercase tracking-wider">
              UNIQUE
            </span>
          </div>
        )}
      </div>
    ),
    cardContent: (unit) => (
      <>
        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <div className="flex flex-col items-center p-1.5 border">
            <Heart className="h-3 w-3 mb-0.5" />
            <span className="text-[8px] text-muted-foreground uppercase">HP</span>
            <span className="font-bold">{unit.stats.hp}</span>
          </div>
          <div className="flex flex-col items-center p-1.5 border">
            <Swords className="h-3 w-3 mb-0.5" />
            <span className="text-[8px] text-muted-foreground uppercase">ATK</span>
            <span className="font-bold">{unit.stats.attack}</span>
          </div>
          <div className="flex flex-col items-center p-1.5 border">
            <Shield className="h-3 w-3 mb-0.5" />
            <span className="text-[8px] text-muted-foreground uppercase">ARM</span>
            <span className="font-bold">
              {unit.stats.meleeArmor}/{unit.stats.pierceArmor}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{unit.description}</p>
        <div className="space-y-1 text-[10px] border-t pt-2">
          <div className="flex items-center justify-between p-1.5 border">
            <span className="text-muted-foreground font-bold uppercase text-[9px]">Cost:</span>
            <span className="font-mono text-[9px]">
              {unit.cost.food && `${unit.cost.food}F `}
              {unit.cost.wood && `${unit.cost.wood}W `}
              {unit.cost.gold && `${unit.cost.gold}G`}
            </span>
          </div>
        </div>
      </>
    ),

    tableColumns: [
      {
        key: "name",
        header: "UNIT",
        sortKey: "name",
        width: "2fr",
        render: (unit) => (
          <div className="flex items-center gap-2">
            <Image
              src={getEntityImagePath(unit.image_path)}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain shrink-0"
            />
            <div>
              <div className="font-bold uppercase">{unit.name}</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.5 border rounded uppercase">{unit.type}</span>
                <span className="uppercase">{unit.age} Age</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "stats",
        header: "COMBAT STATS",
        sortKey: "hp",
        render: (unit) => (
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {unit.stats.hp}
            </span>
            <span className="flex items-center gap-1">
              <Swords className="h-3 w-3" />
              {unit.stats.attack}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {unit.stats.meleeArmor}/{unit.stats.pierceArmor}
            </span>
          </div>
        ),
      },
      {
        key: "cost",
        header: "COST",
        sortKey: "cost",
        render: (unit) => (
          <span className="font-mono text-[10px]">
            {unit.cost.food && `${unit.cost.food}F `}
            {unit.cost.wood && `${unit.cost.wood}W `}
            {unit.cost.gold && `${unit.cost.gold}G `}
            {unit.cost.stone && `${unit.cost.stone}S`}
          </span>
        ),
      },
      {
        key: "mobility",
        header: "MOBILITY",
        render: (unit) => (
          <div className="flex flex-col gap-0.5 text-[10px] font-mono">
            {unit.stats.range && (
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Range: {unit.stats.range}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Speed: {unit.stats.movementSpeed}
            </span>
          </div>
        ),
      },
    ],

    itemLink: (unit) => `/units/${unit.id}`,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <h1 className="text-xl font-mono font-bold uppercase tracking-tight">Unit Database</h1>
              <p className="text-muted-foreground text-[10px] mt-0.5 uppercase tracking-wide">
                Showing {filteredUnits.length} of {allUnits.length} units
              </p>
            </div>
          </div>

          <DataViewer config={config} data={filteredUnits} defaultView="table" />
        </div>
      </div>
    </div>
  )
}
