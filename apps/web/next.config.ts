import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@dark-fantasy/shared',
    '@dark-fantasy/content',
    '@dark-fantasy/game-engine',
  ],
};

export default nextConfig;
