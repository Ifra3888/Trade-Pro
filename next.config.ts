// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress specific console errors
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  turbopack: {},
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Add this to ignore specific warnings
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

  


module.exports = nextConfig;

export default nextConfig;
