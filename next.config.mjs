/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client"],
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
