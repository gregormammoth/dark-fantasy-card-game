import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  reactStrictMode: true,
  transpilePackages: [
    '@dark-fantasy/shared',
    '@dark-fantasy/content',
    '@dark-fantasy/game-engine',
  ],
};

export default nextConfig;
