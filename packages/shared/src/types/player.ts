export type PlayerGender = 'man' | 'woman';

export interface PlayerProfile {
  playerId: string;
  name: string;
  gender: PlayerGender;
}
