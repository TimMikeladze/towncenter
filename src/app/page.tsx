import { ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import { PageShell, Section } from "@/components/layout/page-shell"
import { SearchTrigger } from "@/components/search-trigger"
import { Button } from "@/components/ui/button"
import { getAllBuildings, getAllCivilizations, getAllTechnologies, getAllUnits } from "@/lib/data"
import { NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"

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
        <div className="space-y-4 border-b px-4 py-6 sm:space-y-5 sm:px-8 sm:py-12">
          <p className="label-caps">Age of Empires II: Definitive Edition</p>
          <h1 className="max-w-3xl text-[28px] leading-[1.15] sm:text-4xl lg:text-5xl">
            Every stat in the game, read straight from the game files
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Units, civilizations, buildings, technologies and tech trees — searchable, comparable, and consistent on
            phone, tablet and desktop.
          </p>
          {/*
            Full-width stacked buttons on a phone: three CTAs of three different
            widths on three lines is what "flex-wrap" gives you at 390px, and it
            reads as a mistake rather than a hierarchy.
          */}
          <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Button asChild size="lg" className="press h-12 w-full sm:h-10 sm:w-auto">
              <Link href="/units">
                Browse units
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <div className="grid grid-cols-2 gap-2 sm:contents">
              <Button asChild size="lg" variant="outline" className="press h-12 w-full sm:h-10 sm:w-auto">
                <Link href="/battle">Simulate a battle</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="press h-12 w-full sm:h-10 sm:w-auto">
                <Link href="/civilizations">Civilizations</Link>
              </Button>
            </div>
            <SearchTrigger className="hidden sm:block">
              <span className="inline-flex h-10 items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted">
                <Search className="h-4 w-4" />
                Search everything
                <kbd className="kbd-shortcut">⌘K</kbd>
              </span>
            </SearchTrigger>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4">
          {counts.map((count, index) => (
            <Link
              key={count.label}
              href={count.href}
              className={cn(
                "press border-border px-4 py-3.5 transition-colors sm:px-5 sm:py-4 md:hover:bg-muted/50",
                // Interior rules only: a divide-x/divide-y pair draws an edge on
                // the wrap that reads as a stray line at two columns.
                index % 2 === 1 && "border-l sm:border-l",
                index < 2 && "border-b sm:border-b-0",
                index === 2 && "sm:border-l",
              )}
            >
              <p className="tabular font-mono text-2xl font-semibold">{count.value}</p>
              <p className="label-caps mt-0.5">{count.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <Section title="Explore" description="Every section shares the same search, filters and layout.">
        <div className="stagger-grid grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="press block rounded-lg">
              <article className="panel panel-interactive group flex h-full items-center gap-3 p-3 sm:items-start sm:p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary sm:h-9 sm:w-9">
                  <item.icon className="h-[18px] w-[18px] sm:h-4 sm:w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-display text-[15px] font-semibold leading-none">{item.label}</h3>
                  <p className="text-[13px] leading-snug text-muted-foreground sm:text-sm">{item.description}</p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform md:group-hover:translate-x-0.5"
                  aria-hidden
                />
              </article>
            </Link>
          ))}
        </div>
      </Section>
    </PageShell>
  )
}
