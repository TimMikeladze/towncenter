import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // External packages for native modules like DuckDB
  serverExternalPackages: ['@duckdb/node-api'],

  // Serve export directory images
  async rewrites() {
    return [
      {
        source: '/img/:path*',
        destination: '/export/img/:path*',
      },
    ]
  },
};

export default nextConfig;
