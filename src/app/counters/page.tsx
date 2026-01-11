import { CountersClient } from "./counters-client"
import { getAllUnits } from "@/lib/data"

export default async function CountersPage() {
  const allUnits = await getAllUnits()

  return <CountersClient allUnits={allUnits} />
}
