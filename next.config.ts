import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Everything the gallery loads is same-origin: scripts, styles, self-hosted fonts, material textures and painting
 * images (three.js loads them as <img> elements). Scripts need 'unsafe-inline' because the statically prerendered
 * page carries Next.js's inline bootstrap scripts (nonces would make every request render dynamically), and React's
 * development build needs 'unsafe-eval'. WebGL itself is not governed by CSP.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Strict-Transport-Security is added by Vercel; set it here too if the site is ever hosted elsewhere.
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // Only the display copies go through the image optimizer, never the original photographs.
    localPatterns: [{ pathname: "/artworks/display/**", search: "" }],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        // Display images have content-hashed names (npm run artworks), so a cached copy is never outdated.
        source: "/artworks/display/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
