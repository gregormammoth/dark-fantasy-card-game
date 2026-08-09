/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import enemyCardsData from '@dark-fantasy/content/enemyCards.json';
import type { CardDefinition } from '@dark-fantasy/shared/types/card';
import {
  getEnemyBandProfile,
  listEnemyGroupCardIds,
  resolveEnemyBattleProfile,
} from './enemyBands';
import { createInitialBattle } from './battleSetup';

const enemyCards = enemyCardsData as CardDefinition[];

describe('enemy bands and card pools', () => {
  it('scales deck size and shields with band', () => {
    const intro = getEnemyBandProfile('intro');
    const boss = getEnemyBandProfile('boss');
    expect(boss.deckSize).toBeGreaterThan(intro.deckSize);
    expect(boss.maxShield).toBeGreaterThan(intro.maxShield);
  });

  it('keeps every group playable at intro band', () => {
    const groups = ['warrior', 'cutthroat', 'ritualist', 'beast', 'undead', 'brute'] as const;
    for (const group of groups) {
      expect(listEnemyGroupCardIds(group, 'intro').length).toBeGreaterThanOrEqual(2);
    }
  });

  it('gates stronger cards behind higher bands', () => {
    const introPool = listEnemyGroupCardIds('ritualist', 'intro');
    const bossPool = listEnemyGroupCardIds('ritualist', 'boss');
    expect(introPool).not.toContain('ritualist_unmaking');
    expect(bossPool).toContain('ritualist_unmaking');
    expect(bossPool.length).toBeGreaterThan(introPool.length);
  });

  it('never puts signature cards in a normal pool', () => {
    const signatureIds = enemyCards.filter((card) => card.signature).map((card) => card.id);
    expect(signatureIds.length).toBeGreaterThan(0);
    const bossPool = listEnemyGroupCardIds(undefined, 'boss');
    for (const id of signatureIds) {
      expect(bossPool).not.toContain(id);
    }
  });

  it('builds a band-sized deck that only draws from its group', () => {
    const profile = resolveEnemyBattleProfile({ band: 'elite', group: 'warrior' });
    expect(profile.deckCardIds).toHaveLength(profile.deckSize);
    const warriorIds = listEnemyGroupCardIds('warrior', 'elite');
    for (const id of profile.deckCardIds) {
      expect(warriorIds).toContain(id);
    }
  });

  it('includes signature cards only when the enemy names them', () => {
    const profile = resolveEnemyBattleProfile({
      band: 'boss',
      group: 'ritualist',
      signatureCardIds: ['signature_inquisitor_judgment'],
    });
    expect(profile.deckCardIds).toContain('signature_inquisitor_judgment');
    expect(profile.deckCardIds).toHaveLength(profile.deckSize);
  });

  it('lets explicit enemy values override band defaults', () => {
    const profile = resolveEnemyBattleProfile({
      band: 'intro',
      group: 'beast',
      deckSize: 20,
      maxShield: 5,
      startingShield: 4,
      barrierPerTurn: 2,
    });
    expect(profile.deckSize).toBe(20);
    expect(profile.maxShield).toBe(5);
    expect(profile.startingShield).toBe(4);
    expect(profile.barrierPerTurn).toBe(2);
  });

  it('clamps starting shield to max shield', () => {
    const profile = resolveEnemyBattleProfile({
      band: 'common',
      group: 'brute',
      startingShield: 9,
      maxShield: 3,
    });
    expect(profile.startingShield).toBe(3);
  });

  it('applies the resolved profile to the battle enemy', () => {
    const profile = resolveEnemyBattleProfile({ band: 'boss', group: 'brute' });
    const battle = createInitialBattle(undefined, {
      name: 'The Prison Warden',
      portrait: '/characters/prison_warden.png',
      ...profile,
    });
    expect(battle.enemy.deck).toHaveLength(profile.deckSize);
    expect(battle.enemy.maxShield).toBe(profile.maxShield);
    expect(battle.enemy.shield).toBe(profile.startingShield);
    expect(battle.enemyMaxHealth).toBe(profile.deckSize);
  });

  it('keeps world battles at their legacy enemy deck size', () => {
    const battle = createInitialBattle();
    expect(battle.enemy.deck).toHaveLength(12);
  });
});
