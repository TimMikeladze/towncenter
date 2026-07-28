import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,

  // External packages for native modules like DuckDB
  serverExternalPackages: ["@duckdb/node-api", "@duckdb/node-bindings"],

  // The parquet files are read at runtime by path, so tracing cannot infer
  // them — include them explicitly or dynamic routes 404 in production.
  outputFileTracingIncludes: {
    "/**": ["./export/parquet/**"],
  },

  // Empty turbopack config to allow build
  turbopack: {},
}

export default nextConfig
