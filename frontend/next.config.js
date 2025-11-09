/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Reduce aggressive prefetching to minimize browser preload warnings
  // while still maintaining good navigation performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'tone'],
  },
};

module.exports = nextConfig;
