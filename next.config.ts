import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist tries to import 'canvas' in Node.js which doesn't exist in Next.js
  // Migrated from webpack config to turbopack.resolveAlias (Next.js 16 default).
  turbopack: {
    resolveAlias: {
      canvas: { browser: 'next/dist/compiled/noop.js' },
    },
  },
  // Kept for --webpack fallback; mirrors the turbopack alias above.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
  // Keep pdfjs-dist, Playwright, and @sparticuz/chromium out of the server bundle
  // - pdfjs-dist: client-side only
  // - playwright-core + @sparticuz/chromium: conditional require('aws-sdk') in chromium breaks Turbopack bundling
  serverExternalPackages: ['pdfjs-dist', 'playwright-core', '@sparticuz/chromium'],
  // Include career-ops prompt markdown files in the Vercel Lambda trace.
  // promptLoader.ts reads them at runtime via fs.readFile; Turbopack does not
  // auto-trace dynamic fs.readFile, so the files would otherwise be absent
  // from the deployed bundle and the route would ENOENT on first call.
  outputFileTracingIncludes: {
    '/api/ai/evaluate': ['./src/prompts/**/*.md'],
  },
};

export default nextConfig;
