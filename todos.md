# todos

Audit of the app as of 2026-07-27, after the aoe2techtree data refresh (53 civs / 245 units / 194 techs / 40 buildings).

Status (2026-07-27, after the fix pass): everything below is implemented except the two items still
unchecked at the bottom. Original audit follows.

Verdict: the data layer is current and complete, but almost nothing downstream reads it properly. Most pages
are a v0-generated shell wired to a half-implemented query layer — entities show internal engine codes
instead of names, every unit claims to be a Castle Age unit, and every civ claims to be an Archer civ. The
fastest path to a genuinely useful app is fixing the four query modules in `src/lib/db/queries/`, not adding
pages.

Legend: **[bug]** verified broken · **[gap]** implemented as a stub · **[idea]** new work

---

## P0 — Broken, user-visible

- [x] **[bug] Entity names show internal engine codes.** `ARCHR`, `ULNGB`, `TREBU` instead of "Archer",
  "Elite Longbowman", "Trebuchet". `src/lib/db/queries/units.ts:61` maps `name: row.internal_name`; same in
  `buildings.ts:20` and `technologies.ts:19`. The export has `language_name_id` but no name table to resolve
  against — and upstream `data/locales/en/strings.json` does *not* carry unit/tech names (only 10 of 245 unit
  name ids resolve). The English names live in the per-civ tree node `name` fields, which the sync script
  already reads. Fix: emit a `names(entity_type, entity_id, name)` table from those nodes. Everything else
  here is cosmetic next to this — search, tech tree and counters are all unusable while names are codes.

- [x] **[bug] Descriptions are `"Unit ID: 4"`.** `units.ts:84`, `buildings.ts:35`, `technologies.ts:29`. The
  real help text *is* in `strings.json` and resolves for 238/245 units, 192/194 techs, 39/40 buildings via
  `language_help_id` — e.g. 26083 → *"All-purpose Foot Archer. Strong vs. units at long range. Weak vs.
  Skirmishers, Mangonel-line…"*. Emit a `strings(id, text)` table in the same pass as the names table. This
  also unbreaks `/search`, which searches `description`.

- [x] **[bug] `civ_helptexts` is never loaded into DuckDB.** The table list at `src/lib/db/connection.ts:32`
  has 16 of the 17 exported tables. `/api/db/inspect?action=stats` 500s with
  `Catalog Error: Table with name civ_helptexts does not exist!`. Fix: derive the list from the parquet
  directory instead of hardcoding it.

- [x] **[bug] Every unit is "Castle Age", every building "Dark Age", every tech "Castle Age".** Hardcoded at
  `units.ts:64`, `buildings.ts:23`, `technologies.ts:22`. Consequence: `/tech-tree` renders one "Castle Age"
  section and three empty ones, and the age filter on `/units` returns nothing for Dark/Feudal/Imperial. The
  data exists: `civ_units.age`, `civ_buildings.age`, `civ_techs.age`. Age is per-civ, so either take the min
  age across civs for the global list or make these pages civ-scoped.

- [x] **[bug] Every civilization is typed "Archer".** `civilizations.ts:29`. The `/civilizations` secondary
  nav offers Cavalry / Infantry / Defensive / Naval / Monk; all five return zero results. The civ help string
  literally opens with the answer — Armenians: *"Infantry and Naval civilization"* — so this is a one-line
  parse off `civ_helptexts` once the strings table exists.

- [x] **[bug] Counters and "strong/weak against" are always empty.** `units.ts:78-80` returns empty arrays,
  so `/counters` is a unit selector with two permanently empty panels, and the unit detail page shows two
  empty cards. `unit_attacks` (bonus damage per class) and `unit_armours` (armor classes) are joined in SQL
  at `units.ts:39-40` and then discarded at `units.ts:73-74`. See P2 for deriving these properly.

- [x] **[bug] `civSpecific` is never set on units.** So the "UNIQUE" badge never appears
  (`units-client.tsx:70`), the unit detail page never names the owning civ, and `/civilizations/[id]` lists
  all 245 units as available for every civ (`civilizations/[id]/page.tsx:24` filters on `civSpecific`). Fix:
  join `civ_uniques` for uniqueness, `civ_units` for real availability.

- [x] **[bug] `getUnitsByCiv()` returns `[]`.** `src/lib/data.ts:29`. Dead stub; `civ_units` has the answer.

- [x] **[bug] Maps page image is a dead v0 placeholder.** `src/app/maps/page.tsx:57` requests
  `/.jpg?height=96&width=200&query=...` → 404 on every card. Ship thumbnails or drop the header.

- [x] **[bug] Favicon / app icons 404.** `src/app/layout.tsx:22-36` points at `/icon-light-32x32.png`,
  `/icon-dark-32x32.png`, `/icon.svg`, `/apple-icon.png`; none exist in `public/`. `export/img/favicon.webp`
  could be converted.

- [x] **[bug] Six units link to icons that do not exist** (404): `TREBU`, `KONNIK_INF`, `EKONNIK_INF`,
  `RATHA`, `ERATHA`, `WARCHAR`. No tech-tree node upstream, so the sync script has no picture index for them.
  Fix: fall back to `img/missing.webp` in the script, or hand-map them to their companion unit's icon
  (packed trebuchet → trebuchet, dismounted Konnik → Konnik, …).

- [x] **[bug] `bun run lint` fails** — `package.json:9` runs `eslint .`, but the repo is configured for Biome
  (`biome.json`) and eslint is not a dependency. Should be `biome check .`.

- [x] **[bug] Sortable column with no sort function silently does nothing.** `units-client.tsx:135` marks the
  COST column `sortable: true`, but `sortOptions` only defines `name` / `hp` / `attack`
  (`units-client.tsx:35-51`). `toggleSort` sets `sortBy` to a key it cannot resolve, so the arrow moves and
  the order does not. Make `TableColumn.sortable` require a matching sort option, or let it carry a `sortFn`.

## P1 — Data plumbed but not surfaced

- [x] **[gap] Civ bonuses, team bonus, strengths, weaknesses are all empty arrays** (`civilizations.ts:30-42`),
  so every civ page renders three empty cards. The `civ_helptexts` string is a structured blob — civ type,
  bulleted bonuses, unique unit(s), unique techs with full effect text, team bonus — parseable into
  `CivBonus[]` with modest effort. This is what makes a civ page worth visiting.

- [x] **[gap] Unit type derivation is string-matching on internal codes** (`units.ts:88-96`). `deriveUnitType`
  looks for `'arch'` / `'knight'` / `'militia'` in names like `HCANN`, `CVLRY`, `TKNIG`, so most units fall
  through to `'Unique'`. Same hack in `deriveBuildingType` (`buildings.ts:43`); tech category is hardcoded
  `"Blacksmith"` (`technologies.ts:21`). Real signal exists: `node_types` (Unit / UnitUpgrade / UniqueUnit /
  RegionalUnit), the training building, and armor classes.

- [x] **[gap] Upgrade paths unused.** `unit_upgrades` (115 rows) is loaded and never queried. The unit detail
  page has an "Upgrade Path" card that never renders (`units/[id]/page.tsx:196`).

- [x] **[gap] No per-civ tech tree.** `/tech-tree` filters a global unit list by `civSpecific` and a
  `techTree.missingUnits` array that is always empty (`tech-tree-client.tsx:26-33`), so all 53 civs show an
  identical list. `civ_units` / `civ_buildings` / `civ_techs` (2657 / 1451 / 3753 rows) already encode exactly
  what each civ gets and in which age.

- [x] **[gap] Hardcoded `"britons"` defaults** — `tech-tree/page.tsx:11`, `competitive/page.tsx:11`,
  `competitive-client.tsx:22-23`, plus `allUnits[6]` as the counters default (`counters-client.tsx:17`). Fine
  as defaults; they should resolve against real data and degrade gracefully.

- [x] **[gap] Mock data still backs two features.** `data/matchups.ts` (12 rows, 6 civs) and
  `data/build-orders.ts` (2 build orders) drive all of `/competitive`; `data/maps.ts` drives `/maps`.
  Meanwhile `data/civilizations.ts`, `data/units.ts`, `data/buildings.ts`, `data/technologies.ts` are dead —
  nothing has imported them since the DuckDB migration. Delete the dead four; decide whether matchups and
  build orders become real content or go away.

- [ ] **[gap] Win-rate matchups have no source.** The numbers in `data/matchups.ts` are invented. Wire up a
  real source (aoestats.io publishes civ win rates by ELO bracket and patch) or label them as illustrative.
  Shipping made-up win rates as fact is worse than shipping nothing.

## P2 — Ideas worth building

- [x] **[idea] Counter engine derived from combat data.** For each unit, compute effective DPS against every
  other unit from `attack`, `unit_attacks` (bonus vs armor class), the target's `unit_armours` +
  melee/pierce armor, and `reload_time`; rank by damage per resource spent. Turns two dead tables into the
  app's differentiating feature and replaces hand-written counters no one will maintain.

- [x] **[idea] Unit comparison view.** Pick 2-4 units, stats side by side with deltas, including
  fully-upgraded variants (blacksmith techs + civ bonuses applied). The most-wanted feature on every
  existing AoE2 reference site.

- [x] **[idea] Civ-vs-civ tech tree diff.** "What does Wu have that Wei doesn't" — a set difference over
  `civ_units` / `civ_techs`, cheap once the per-civ tech tree exists.

- [x] **[idea] "What changed this patch" view.** The sync script makes patch-over-patch diffing trivial:
  snapshot the previous export, diff stat fields, render a changelog. The last refresh alone moved 45 units
  (naval rework, ram rework, Elite Longbowman 160→130 HP) and added 3 civs. Nobody presents this well.

- [x] **[idea] Deep-linkable filters.** `/units` reads `?type=`, but search, sort and view mode live in React
  state only (`data-viewer.tsx:30-35`) — nothing is shareable and the back button does nothing. Move
  `DataViewer` state into search params.

- [x] **[idea] Global command palette.** `⌘K` is already bound inside `DataViewer` to focus its local search
  box; promote it to an app-wide palette over units + civs + techs + buildings and retire `/search`, which
  duplicates the filtering logic (`search-client.tsx:22-38`).

- [x] **[idea] Cost-efficiency sort.** Rank units by HP+DPS per resource, weighting gold. Pure derivation
  from existing columns.

- [x] **[idea] Unique unit spotlight on the civ page** — unique unit + elite upgrade stats, unique techs with
  costs, and how the tech changes the unit. `civ_uniques` + `unit_upgrades` cover this today.

## P3 — Infrastructure & quality

- [x] **[gap] No tests at all.** No runner, no test files. The transform in `scripts/sync-aoe2-data.py` and
  the query layer both deserve fixture-based tests — a sync bug silently corrupts every page.

- [x] **[gap] No CI.** No `.github/workflows`. Minimum: `biome check`, `tsc --noEmit`, `next build`.

- [x] **[bug] `getConnection()` busy-waits recursively.** `connection.ts:18-22` sleeps 100ms and re-calls
  itself while another init is in flight — unbounded recursion under load, no timeout. Replace with a single
  memoized init promise.

- [x] **[gap] Query layer loads whole tables and filters in JS.** `getUnitById` calls `getAllUnits()` then
  `.find()` (`units.ts:100`); same in every `*ById` / `*ByType`. Fine at 245 rows, wrong shape as soon as
  anything grows — push filters into SQL.
  *Done for buildings and techs (`getBuildingById` / `getTechnologyById` now filter in SQL). Unit
  lookups still go through the cached `getAllUnits()` array on purpose: the counter engine needs the
  whole set loaded anyway, so a per-id query would be strictly more work.*

- [x] **[gap] `row: any` everywhere** in the query layer — DuckDB rows are untyped, so a schema change is a
  runtime failure rather than a compile error. Define row interfaces, or validate with the already-installed
  `zod`.

- [x] **[gap] Raw `<img>` for every icon** (`units-client.tsx:64`, `civilizations-client.tsx:42`, …) with no
  dimensions and `object-cover` stretching 48×48 icons into 96px-tall boxes — blurry art plus layout shift.
  Use `next/image` with explicit sizes, or render icons at native size.

- [x] **[gap] `/api/db/inspect` executes arbitrary SQL** (`route.ts:64`) and interpolates `table` directly
  (`route.ts:47`). Dev-only gated at `route.ts:6`, so not currently exposed — worth a hard allowlist of table
  names so it cannot become a production hole by accident.

- [x] **[gap] Nested `<table>` per row in `DataTable`** (`data-table.tsx:48-60`) to make rows clickable: each
  row renders its own inner table, so column widths never align with the header. Use CSS grid rows, or put
  the link on the cells.

- [x] **[gap] `getImagePath()` at `connection.ts:63` is unused** and duplicates
  `getEntityImagePath` in `src/lib/utils/images.ts`. Delete one.

- [x] **[gap] No error or empty states.** No `error.tsx`, no `loading.tsx` anywhere in `src/app`; if DuckDB
  fails to initialize, pages throw. Empty result sets render as blank space with no message.

- [ ] **[gap] `public/img` duplicates `export/img`** (~550 files) because `export/img/` is gitignored while
  the build needs the assets tracked. Works, but worth revisiting — either track `export/img` and symlink, or
  fetch assets at build time.

---

## Left open, deliberately

- **Win-rate matchups** — no free, stable public source was wired up. The invented numbers in
  `data/matchups.ts` are still there but are now flagged in the file and labelled as illustrative in
  the `/competitive` UI, so nothing presents them as measured fact.
- **`public/img` duplicating `export/img`** — kept as is: the build needs the assets tracked, and a
  symlink or build-time fetch trades a working setup for a fragile one. Documented in the README.
