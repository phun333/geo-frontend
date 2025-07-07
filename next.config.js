/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Allow external images from CDN
  images: {
    domains: ['cdnjs.cloudflare.com'],
  },
  // Webpack configuration for Leaflet
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };
    return config;
  },
  // Ignore build errors for external libraries
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Enable source maps in development
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig 