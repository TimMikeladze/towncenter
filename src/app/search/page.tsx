import { SearchClient } from "./search-client"
import { getAllUnits, getAllCivilizations } from "@/lib/data"

export default async function SearchPage() {
  const [allUnits, allCivs] = await Promise.all([
    getAllUnits(),
    getAllCivilizations()
  ])

  return <SearchClient allUnits={allUnits} allCivs={allCivs} />
}
