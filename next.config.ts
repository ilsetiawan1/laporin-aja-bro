import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Tetap 5MB untuk handle upload via Server Actions jika diperlukan
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qfuimxvkgprtsumarxsy.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
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