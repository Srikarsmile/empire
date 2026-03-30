import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      // Serve uploads dynamically so new files are available immediately
      // without requiring a PM2 restart to refresh Next.js's static file cache.
      { source: '/uploads/:path*', destination: '/api/uploads/:path*' },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "empirerentcar.com",
      },
    ],
  },
};

export default nextConfig;
