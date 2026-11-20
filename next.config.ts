import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  redirects() {
    return [
      { source: "/", destination: "/sign-in", permanent: false },
      { source: "/training", destination: "/repository?tab=products", permanent: false },
      { source: "/history", destination: "/detection", permanent: false },
    ];
  },
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
};

export default nextConfig;
