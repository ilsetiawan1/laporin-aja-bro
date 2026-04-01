import type { NextConfig } from "next";

// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Kita naikin jadi 5MB biar aman buat upload foto
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/status',
        destination: '/reports',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
