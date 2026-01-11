import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // External packages for native modules like DuckDB
  serverExternalPackages: ['@duckdb/node-api', '@duckdb/node-bindings'],

  // Empty turbopack config to allow build
  turbopack: {},
};

export default nextConfig;
