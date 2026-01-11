This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

- **Next.js 16** with React Server Components
- **DuckDB** for querying parquet data files
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for component primitives

## Data Layer

This project uses DuckDB to query Age of Empires II game data from parquet files:

- **Data Source**: Parquet files in `export/parquet/` directory
- **Images**: Game assets in `export/img/` directory (served via symlink at `public/img`)
- **Database**: In-memory DuckDB instance with 17 tables loaded from parquet files
- **Queries**: React-cached query functions in `src/lib/db/queries/`

### Database Schema

Key tables:
- `civilizations`, `units`, `buildings`, `techs` - Core game entities
- `civ_units`, `civ_buildings`, `civ_techs` - Civilization-specific availability
- `unit_attacks`, `unit_armours` - Combat statistics
- `civ_uniques`, `unit_upgrades` - Special units and upgrades

### Development Database Inspection

In development, inspect the database via API endpoints:

```bash
# List all tables and their schemas
curl http://localhost:3000/api/db/inspect?action=tables

# Get table statistics
curl http://localhost:3000/api/db/inspect?action=stats

# Sample data from a table
curl http://localhost:3000/api/db/inspect?action=sample&table=civilizations

# Execute custom query
curl http://localhost:3000/api/db/inspect?action=query&query=SELECT%20*%20FROM%20units%20LIMIT%205
```

## Getting Started

First, run the development server:

```bash
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── civilizations/     # Civilization browser & detail pages
│   ├── units/             # Unit browser & detail pages
│   ├── buildings/         # Building browser & detail pages
│   ├── technologies/      # Technology browser & detail pages
│   └── api/db/inspect/    # Development database inspection API
├── components/            # React components
│   ├── data-viewer.tsx   # Universal grid/table view component
│   └── secondary-nav.tsx # Tab navigation component
└── lib/
    ├── db/
    │   ├── connection.ts  # DuckDB singleton connection
    │   └── queries/       # Entity-specific query functions
    ├── data.ts           # Main data layer API
    └── types.ts          # TypeScript type definitions

export/
├── parquet/              # Game data in parquet format (gitignored)
└── img/                  # Game assets (gitignored)
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
