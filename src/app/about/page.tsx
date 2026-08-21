import type { Metadata } from "next"
import { PageHeader, PageShell, Panel, Section } from "@/components/layout/page-shell"
import { REPO_URL } from "@/lib/navigation"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Who built Town Center, where its Age of Empires II: Definitive Edition data comes from, which numbers are computed rather than read from the game files, and how to report a wrong one.",
  path: "/about",
  eyebrow: "Colophon",
  imageSubtitle: "An open-source AoE2: DE reference, generated from the game files.",
})

const LINK = "font-medium text-foreground underline underline-offset-4 hover:text-primary"

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={LINK}>
      {children}
    </a>
  )
}

export default function AboutPage() {
  return (
    <PageShell width="narrow">
      <PageHeader
        eyebrow="Colophon"
        title="About Town Center"
        description="A reference companion for Age of Empires II: Definitive Edition."
      />

      <Section title="Who made it">
        <Panel className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Built by <External href="https://github.com/TimMikeladze">Tim Mikeladze</External> — more work at{" "}
            <External href="https://linesofcode.dev">linesofcode.dev</External>.
          </p>
          <p>
            The site is open source: read it, fork it or file a bug on <External href={REPO_URL}>GitHub</External>.
            Wrong numbers and feature requests belong in the{" "}
            <External href={`${REPO_URL}/issues`}>issue tracker</External>.
          </p>
        </Panel>
      </Section>

      <Section title="Where the numbers come from">
        <Panel className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Every stat, cost, bonus and icon is generated from{" "}
            <External href="https://github.com/SiegeEngineers/aoe2techtree">SiegeEngineers/aoe2techtree</External>,
            which tracks the current AoE2: DE patch. Nothing on this site is hand-written game data, so a wrong value
            here is a wrong value upstream.
          </p>
          <p>
            Counters and battle outcomes are the exception: they are computed here from attack, armor, cost and rate of
            fire rather than taken from a list, so treat them as a model of a fight and not a promise about one.
          </p>
        </Panel>
      </Section>

      <Section title="Not affiliated with Microsoft">
        <Panel className="text-sm leading-relaxed text-muted-foreground">
          <p>
            Age of Empires II: Definitive Edition is a trademark of Microsoft Corporation. This is an unofficial fan
            project with no affiliation with or endorsement by Microsoft, Xbox Game Studios, Forgotten Empires or
            World's Edge.
          </p>
        </Panel>
      </Section>
    </PageShell>
  )
}
