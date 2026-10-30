import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
};

export default nextConfig;
