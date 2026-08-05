export const PLAYER_GENDER_PORTRAITS = {
  man: {
    fighter: '/characters/player_fighter.png',
    rogue: '/characters/player_rogue.png',
    wizard: '/characters/player_wizard.png',
    survivor: '/characters/player_survivor.png',
  },
  woman: {
    fighter: '/characters/player_woman_fighter.png',
    rogue: '/characters/player_woman_rogue.png',
    wizard: '/characters/player_woman_wizard.png',
    survivor: '/characters/player_woman_survivor.png',
  },
} as const;

export const PLAYER_CLASS_PORTRAITS = PLAYER_GENDER_PORTRAITS.man;

export const PLAYER_PORTRAIT = PLAYER_GENDER_PORTRAITS.man.fighter;

export const DEFAULT_ENEMY_PORTRAIT = '/characters/prisoner.png';
