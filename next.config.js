/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'cdn.arvista.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Performance optimizations for smooth scrolling
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable SWC minification
  swcMinify: true,
  // Allow build to continue despite prerender errors (admin pages need runtime session)
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
