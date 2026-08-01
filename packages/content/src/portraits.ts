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

export const PRISON_ENEMY_IMAGES = {
  rebellious_prisoner: '/enemies/rebellious_prisoner.png',
  undead_prisoner: '/enemies/undead_prisoner.png',
  resurrected_anarchist: '/enemies/resurrected_anarchist.png',
  bound_corpse: '/enemies/bound_corpse.png',
  hanging_corpse: '/enemies/hanging_corpse.png',
  undead_guard: '/enemies/undead_guard.png',
  guard_captain: '/enemies/guard_captain.png',
  ritual_cultist: '/enemies/ritual_cultist.png',
  inquisitor: '/enemies/inquisitor.png',
  prison_warden: '/enemies/prison_warden.png',
} as const;

export const PRISON_NPC_IMAGES = {
  dead_anarchist: '/portraits/npcs/dead_anarchist.png',
  sorcerer: '/portraits/npcs/sorcerer.png',
  executioner: '/portraits/npcs/executioner.png',
  wounded_prisoner: '/portraits/npcs/wounded_prisoner.png',
  prison_guard: '/portraits/npcs/prison_guard.png',
  prison_cook: '/portraits/npcs/prison_cook.png',
  prison_priest: '/portraits/npcs/prison_priest.png',
  prison_doctor: '/portraits/npcs/prison_doctor.png',
  old_prisoner: '/portraits/npcs/old_prisoner.png',
  smuggler: '/portraits/npcs/smuggler.png',
} as const;

export function pickRandomEnemyPortrait(): string {
  const index = Math.floor(Math.random() * ENEMY_PORTRAITS.length);
  return ENEMY_PORTRAITS[index];
}
