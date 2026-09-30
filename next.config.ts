import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/sorteos",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
