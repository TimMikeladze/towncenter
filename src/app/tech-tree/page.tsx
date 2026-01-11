import { Suspense } from "react"
import { TechTreeClient } from "./tech-tree-client"
import { getAllCivilizations, getAllUnits } from "@/lib/data"

async function TechTreeContent({
  searchParams,
}: {
  searchParams: Promise<{ civ?: string }>
}) {
  const params = await searchParams
  const initialCiv = params.civ || "britons"

  const [allCivs, allUnits] = await Promise.all([
    getAllCivilizations(),
    getAllUnits()
  ])

  return <TechTreeClient allCivs={allCivs} allUnits={allUnits} initialCivId={initialCiv} />
}

export default async function TechTreePage({
  searchParams,
}: {
  searchParams: Promise<{ civ?: string }>
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TechTreeContent searchParams={searchParams} />
    </Suspense>
  )
}
