import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/securegate',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/securegate/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
