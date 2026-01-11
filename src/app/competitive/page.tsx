import { Suspense } from "react"
import { CompetitiveClient } from "./competitive-client"
import { getAllCivilizations } from "@/lib/data"

async function CompetitiveContent({
  searchParams,
}: {
  searchParams: Promise<{ civ?: string }>
}) {
  const params = await searchParams
  const initialCiv = params.civ || "britons"

  const allCivs = await getAllCivilizations()

  return <CompetitiveClient allCivs={allCivs} initialCivId={initialCiv} />
}

export default async function CompetitivePage({
  searchParams,
}: {
  searchParams: Promise<{ civ?: string }>
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CompetitiveContent searchParams={searchParams} />
    </Suspense>
  )
}
