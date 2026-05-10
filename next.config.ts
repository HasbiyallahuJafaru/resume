import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent canvas from being bundled client-side (pdfjs dependency)
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }
    return config;
  },
  // Exclude heavy server packages from client bundle
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

export default nextConfig;
