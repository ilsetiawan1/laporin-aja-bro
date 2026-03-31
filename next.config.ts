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
        hostname: 'qfuimxvkgprtsumarxsy.supabase.co',
        port: '',
        pathname: '/**',
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
