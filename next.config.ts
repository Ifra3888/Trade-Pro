// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force webpack instead of turbopack for build
  turbopack: {},
  
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Only apply webpack config in development or conditionally
  webpack: (config, { isServer, nextRuntime }) => {
    // Skip webpack config when using turbopack
    if (process.env.NEXT_RUNTIME === 'edge') {
      return config;
    }
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

export default nextConfig;