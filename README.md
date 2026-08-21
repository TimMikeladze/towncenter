# Town Center

An Age of Empires II: Definitive Edition companion — units, civilizations, buildings, technologies, the tech tree, computed counters, a battle simulator, unit comparison and patch-to-patch stat changes.

Next.js App Router · DuckDB over parquet · Tailwind · Radix · installable as a PWA.

## Develop

```bash
bun install
bun run dev        # http://localhost:3000
bun run test       # bun test
bun run typecheck
bun run lint:fix
```

## Data

Every game value is generated from [SiegeEngineers/aoe2techtree](https://github.com/SiegeEngineers/aoe2techtree). Nothing under `export/` is hand-written — regenerate it instead:

```bash
bun run sync-data                    # export/json, export/parquet, public/img
python3 scripts/diff-export.py       # data/patch-changes.json, powers /changes
```

Run them in that order: the diff compares the fresh export against the last committed one. `sync-data` needs the `duckdb` CLI and `cwebp` on PATH; pass `--skip-images` to skip the webp pass.

## SEO

Every route sets its own title, description, canonical URL and social card, and the four entity routes prerender one static page per unit, civilization, building and technology. `sitemap.xml` and `robots.txt` are generated from the same data.

Canonicals and the sitemap need one absolute origin. It comes from `NEXT_PUBLIC_SITE_URL`, falling back to Vercel's production hostname and then to the deployed default — so preview deployments point their canonicals at production rather than advertising themselves.

```bash
vercel env add NEXT_PUBLIC_SITE_URL production   # once a custom domain is attached
```

Detail URLs carry a slug after the game's numeric id (`/units/38-knight`). The bare id is a permanent redirect to it, generated from the export in `next.config.ts`; `src/lib/hrefs.ts` is the only place that builds these paths. Social cards are drawn on demand by `/api/og` and cached at the edge.

## Analytics

[Umami](https://umami.is) is optional and off by default — set `NEXT_PUBLIC_UMAMI_WEBSITE_ID` and the tracker loads, leave it unset and no third-party script is ever fetched. See `.env.example` for the full list.

```bash
cp .env.example .env.local           # then fill in the website id
vercel env add NEXT_PUBLIC_UMAMI_WEBSITE_ID production
```

These are inlined at build time, so a change needs a redeploy. Set `NEXT_PUBLIC_UMAMI_DOMAINS` to your production hostname to keep preview deployments out of the numbers. Custom events go through `track()` from `src/lib/analytics.ts`, which is a no-op whenever the tracker is absent.

## License

MIT. Not affiliated with or endorsed by Microsoft — Age of Empires II: Definitive Edition is a Microsoft trademark.
