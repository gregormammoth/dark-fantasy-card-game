import type { Metadata } from 'next';
import '@/styles/game.css';
import { GameApp } from '@/GameApp';

export const metadata: Metadata = {
  title: 'Play',
  description: 'Enter the realm — explore Hollowfort Prison and duel with cards.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function PlayPage() {
  return (
    <div id="game-root" className="min-h-screen">
      <GameApp />
    </div>
  );
}
