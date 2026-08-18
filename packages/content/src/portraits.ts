export const PLAYER_GENDER_PORTRAITS = {
  man: {
    warrior: '/characters/player_fighter.glb',
    rogue: '/characters/player_rogue.glb',
    wizard: '/characters/player_wizard.glb',
    survivor: '/characters/player_survivor.glb',
    seeker: '/characters/player.glb',
  },
  woman: {
    warrior: '/characters/player_woman_fighter.glb',
    rogue: '/characters/player_woman_rogue.glb',
    wizard: '/characters/player_woman_wizard.glb',
    survivor: '/characters/player_woman_survivor.glb',
    seeker: '/characters/player_woman.glb',
  },
} as const;

export const PLAYER_CLASS_PORTRAITS = PLAYER_GENDER_PORTRAITS.man;

export const PLAYER_PORTRAIT = PLAYER_GENDER_PORTRAITS.man.warrior;

export const DEFAULT_ENEMY_PORTRAIT = '/characters/prisoner.png';

export const PLAYER_MODEL_FALLBACKS = [
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
