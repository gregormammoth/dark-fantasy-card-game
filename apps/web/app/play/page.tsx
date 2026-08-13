import type { Metadata } from 'next';
import '@/styles/game.css';
import { GameApp } from '@/GameApp';

export const metadata: Metadata = {
  title: 'Play',
  description:
    'Play Hollowfort in the browser. Explore sixteen prison rooms, fight with your deck as health, and escape through a faction gate.',
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
