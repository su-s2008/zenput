import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile zenput so Next.js resolves its package exports correctly.
  transpilePackages: ['zenput'],
  // This is a smoke-test fixture, not a production app. Skip ESLint during
  // build to avoid noise from missing Next.js ESLint plugin configuration.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
