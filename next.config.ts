import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

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
  // Baseline security headers (Security plan S6; audit Medium finding).
  // CSP is deferred to middleware with nonce (Security plan S6.2) — not yet shipped.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security',value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ]
  },
};

// Sentry wrapping — only effective when SENTRY_AUTH_TOKEN is set at build
// time (source-map upload). Runtime capture is gated separately on DSN.
// Org/project default to env vars so a fork doesn't accidentally upload
// to the wrong Sentry org.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,           // quiet during dev/local builds
  widenClientFileUpload: true,        // upload more source maps for better stacks
  tunnelRoute: '/monitoring',         // bypass ad-blockers; CSP allows this same-origin
  disableLogger: true,                // strip Sentry's own logger from prod bundle
  automaticVercelMonitors: false,     // we already wire our own Vercel monitors
});
