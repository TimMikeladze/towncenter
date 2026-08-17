import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,

  // External packages for native modules like DuckDB
  serverExternalPackages: ["@duckdb/node-api", "@duckdb/node-bindings"],

  // Two things tracing cannot infer: the parquet files (read at runtime by
  // path) and libduckdb.so (loaded by the native addon, not required by JS).
  // Without both, every server-rendered page 500s in production.
  outputFileTracingIncludes: {
    "/**": [
      "./export/parquet/**",
      "./node_modules/@duckdb/node-bindings-linux-x64/**",
      "./node_modules/@duckdb/node-bindings-linux-arm64/**",
    ],
  },

  // Empty turbopack config to allow build
  turbopack: {},
}

export default nextConfig
