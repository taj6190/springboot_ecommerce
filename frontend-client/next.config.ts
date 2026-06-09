import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Aggressive client-side router cache
  experimental: {
    staleTimes: {
      dynamic: 30,   // cache dynamic pages for 30s on client
      static: 300,   // cache static pages for 5min on client
    },
  },
  // Compress responses
  compress: true,
  // Reduce powered-by header overhead
  poweredByHeader: false,
};

export default nextConfig;
