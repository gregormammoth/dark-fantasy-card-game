import path from 'node:path';
import type { NextConfig } from 'next';

const playerModelFallbacks = [
  'player_fighter',
  'player_rogue',
  'player_wizard',
  'player_survivor',
  'player_woman',
  'player_woman_fighter',
  'player_woman_rogue',
  'player_woman_wizard',
  'player_woman_survivor',
] as const;

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  reactStrictMode: true,
  transpilePackages: [
    '@dark-fantasy/shared',
    '@dark-fantasy/content',
    '@dark-fantasy/game-engine',
    'three',
  ],
  async rewrites() {
    return {
      fallback: playerModelFallbacks.map((name) => ({
        source: `/characters/${name}.glb`,
        destination: '/characters/player.glb',
      })),
    };
  },
};

export default nextConfig;
