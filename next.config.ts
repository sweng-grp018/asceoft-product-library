import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  redirects() {
    return [{ source: "/training", destination: "/repository?tab=products", permanent: false }];
  },
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
};

export default nextConfig;
