import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    reactRemoveProperties: true,
    styledComponents: true
  },
  experimental: {
    reactCompiler: true
  }
};

export default nextConfig;
