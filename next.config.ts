import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // External packages for native modules like DuckDB
  serverExternalPackages: ['@duckdb/node-api'],
};

export default nextConfig;
