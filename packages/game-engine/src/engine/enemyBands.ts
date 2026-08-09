import enemyCardsData from '@dark-fantasy/content/enemyCards.json';
import type { CardDefinition } from '@dark-fantasy/shared/types/card';
import type {
  EnemyBand,
  EnemyBandProfile,
  EnemyBattleProfile,
  EnemyGroup,
} from '@dark-fantasy/shared/types/enemy';
import type { LocationEnemy } from '@dark-fantasy/shared/types/exploration';

const enemyCards = enemyCardsData as CardDefinition[];

const BAND_ORDER: EnemyBand[] = ['intro', 'common', 'elite', 'boss'];

const BAND_PROFILES: Record<EnemyBand, EnemyBandProfile> = {
  intro: { deckSize: 8, startingShield: 0, maxShield: 1, barrierPerTurn: 0 },
  common: { deckSize: 12, startingShield: 2, maxShield: 2, barrierPerTurn: 0 },
  elite: { deckSize: 16, startingShield: 2, maxShield: 3, barrierPerTurn: 0 },
  boss: { deckSize: 22, startingShield: 3, maxShield: 4, barrierPerTurn: 1 },
};

export const DEFAULT_ENEMY_BAND: EnemyBand = 'common';

function bandRank(band: EnemyBand): number {
  const index = BAND_ORDER.indexOf(band);
  return index < 0 ? 0 : index;
}

export function getEnemyBandProfile(band: EnemyBand = DEFAULT_ENEMY_BAND): EnemyBandProfile {
  return { ...(BAND_PROFILES[band] ?? BAND_PROFILES[DEFAULT_ENEMY_BAND]) };
}

export function listEnemyGroupCardIds(
  group?: EnemyGroup,
  band: EnemyBand = DEFAULT_ENEMY_BAND,
): string[] {
  const limit = bandRank(band);
  const pool = enemyCards.filter((card) => {
    if (card.signature) {
      return false;
    }
    if (group && card.enemyGroup !== group) {
      return false;
    }
    return bandRank(card.minBand ?? 'intro') <= limit;
  });
  if (pool.length === 0) {
    return enemyCards.filter((card) => !card.signature).map((card) => card.id);
  }
  return pool.map((card) => card.id);
}

function fillFromPool(pool: string[], count: number): string[] {
  if (pool.length === 0 || count <= 0) {
    return [];
  }
  const ids: string[] = [];
  while (ids.length < count) {
    ids.push(...pool);
  }
  return ids.slice(0, count);
}

export function resolveEnemyBattleProfile(
  enemy: Pick<
    LocationEnemy,
    | 'band'
    | 'group'
    | 'signatureCardIds'
    | 'deckSize'
    | 'startingShield'
    | 'maxShield'
    | 'barrierPerTurn'
  >,
): EnemyBattleProfile {
  const band = enemy.band ?? DEFAULT_ENEMY_BAND;
  const bandProfile = getEnemyBandProfile(band);
  const deckSize = Math.max(1, enemy.deckSize ?? bandProfile.deckSize);
  const maxShield = Math.max(0, enemy.maxShield ?? bandProfile.maxShield);
  const startingShield = Math.min(
    Math.max(0, enemy.startingShield ?? bandProfile.startingShield),
    maxShield,
  );
  const signatureCardIds = (enemy.signatureCardIds ?? []).filter((id) =>
    enemyCards.some((card) => card.id === id),
  );
  const pool = listEnemyGroupCardIds(enemy.group, band);
  const signatures = signatureCardIds.slice(0, deckSize);

  return {
    deckCardIds: [...signatures, ...fillFromPool(pool, deckSize - signatures.length)],
    deckSize,
    startingShield,
    maxShield,
    barrierPerTurn: Math.max(0, enemy.barrierPerTurn ?? bandProfile.barrierPerTurn),
  };
}
