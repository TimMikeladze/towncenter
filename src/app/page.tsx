import { ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import { PageShell, Section } from "@/components/layout/page-shell"
import { SearchTrigger } from "@/components/search-trigger"
import { Button } from "@/components/ui/button"
import { getAllBuildings, getAllCivilizations, getAllTechnologies, getAllUnits } from "@/lib/data"
import { NAV_ITEMS } from "@/lib/navigation"

export default async function HomePage() {
  const [units, civs, buildings, techs] = await Promise.all([
    getAllUnits(),
    getAllCivilizations(),
    getAllBuildings(),
    getAllTechnologies(),
  ])

  const counts = [
    { label: "Units", value: units.length, href: "/units" },
    { label: "Civilizations", value: civs.length, href: "/civilizations" },
    { label: "Buildings", value: buildings.length, href: "/buildings" },
    { label: "Technologies", value: techs.length, href: "/technologies" },
  ]

  return (
    <PageShell>
      <section className="panel overflow-hidden">
        <div className="space-y-5 border-b px-5 py-8 sm:px-8 sm:py-12">
          <p className="label-caps">Age of Empires II: Definitive Edition</p>
          <h1 className="max-w-3xl text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Every stat in the game, read straight from the game files
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Units, civilizations, buildings, technologies and tech trees — searchable, comparable, and consistent on
            phone, tablet and desktop.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="lg">
              <Link href="/units">
                Browse units
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/battle">Simulate a battle</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/civilizations">View civilizations</Link>
            </Button>
            <SearchTrigger className="hidden sm:block">
              <span className="inline-flex h-10 items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted">
                <Search className="h-4 w-4" />
                Search everything
                <kbd className="kbd-shortcut">⌘K</kbd>
              </span>
            </SearchTrigger>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
          {counts.map((count) => (
            <Link key={count.label} href={count.href} className="px-5 py-4 transition-colors hover:bg-muted/50">
              <p className="tabular font-mono text-2xl font-semibold">{count.value}</p>
              <p className="label-caps mt-0.5">{count.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <Section title="Explore" description="Every section shares the same search, filters and layout.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <article className="panel panel-interactive group flex h-full items-start gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 space-y-1">
                  <h3 className="flex items-center gap-1 font-display text-[15px] font-semibold leading-none">
                    {item.label}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </Section>
    </PageShell>
  )
}
