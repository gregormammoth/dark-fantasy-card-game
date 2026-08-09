export const PLAYER_GENDER_PORTRAITS = {
  man: {
    warrior: '/characters/player_fighter.png',
    rogue: '/characters/player_rogue.png',
    wizard: '/characters/player_wizard.png',
    survivor: '/characters/player_survivor.png',
    seeker: '/characters/player.png',
  },
  woman: {
    warrior: '/characters/player_woman_fighter.png',
    rogue: '/characters/player_woman_rogue.png',
    wizard: '/characters/player_woman_wizard.png',
    survivor: '/characters/player_woman_survivor.png',
    seeker: '/characters/player.png',
  },
} as const;

export const PLAYER_CLASS_PORTRAITS = PLAYER_GENDER_PORTRAITS.man;

export const PLAYER_PORTRAIT = PLAYER_GENDER_PORTRAITS.man.warrior;

export const DEFAULT_ENEMY_PORTRAIT = '/characters/prisoner.png';
