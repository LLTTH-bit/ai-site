import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/uploads/:path*",
      },
      {
        source: "/photos/:path*",
        destination: "/photos/:path*",
      },
    ];
  },
};

export default nextConfig;
