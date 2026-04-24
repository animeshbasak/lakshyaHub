import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist tries to import 'canvas' in Node.js which doesn't exist in Next.js
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
  // Keep pdfjs-dist out of the server bundle entirely — it only runs client-side
  serverExternalPackages: ['pdfjs-dist'],
  // Next.js 16 default: Turbopack. Empty object silences webpack/turbopack coexistence warning.
  turbopack: {},
};

export default nextConfig;
