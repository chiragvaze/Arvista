/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'cdn.arvista.com'],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig
