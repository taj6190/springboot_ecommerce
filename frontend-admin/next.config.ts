import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
