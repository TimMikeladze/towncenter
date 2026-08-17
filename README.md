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

## License

MIT. Not affiliated with or endorsed by Microsoft — Age of Empires II: Definitive Edition is a Microsoft trademark.
