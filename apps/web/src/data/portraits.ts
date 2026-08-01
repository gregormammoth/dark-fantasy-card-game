export const PLAYER_PORTRAIT = '/portraits/player.png';

export const ENEMY_PORTRAITS = [
  '/portraits/enemy_01.png',
  '/portraits/enemy_02.png',
  '/portraits/enemy_03.png',
  '/portraits/enemy_04.png',
  '/portraits/enemy_05.png',
  '/portraits/enemy_06.png',
  '/portraits/enemy_07.png',
  '/portraits/enemy_08.png',
  '/portraits/enemy_09.png',
] as const;

export function pickRandomEnemyPortrait(): string {
  const index = Math.floor(Math.random() * ENEMY_PORTRAITS.length);
  return ENEMY_PORTRAITS[index];
}
