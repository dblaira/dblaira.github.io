import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Work around intermittent dev-server 500s in Next.js segment explorer overlay.
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
