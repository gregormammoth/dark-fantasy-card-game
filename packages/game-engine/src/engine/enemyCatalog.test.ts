/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import enemyCardsData from '@dark-fantasy/content/enemyCards.json';
import prisonMapData from '@dark-fantasy/content/prisonMap.json';
import type { CardDefinition } from '@dark-fantasy/shared/types/card';
import type { LocationSourceDefinition } from '@dark-fantasy/shared/types/exploration';
import {
  getEnemyDefinition,
  hydrateEnemyPlacement,
  listEnemyDefinitions,
  resolveEnemyBattleProfile,
} from './enemyBands';
import { createInitialExploration } from './exploration/setup';

const enemyCards = enemyCardsData as CardDefinition[];
const mapLocations = (prisonMapData as { locations: LocationSourceDefinition[] }).locations;
const placements = mapLocations.flatMap((location) => location.enemies);

describe('enemy catalog', () => {
  it('resolves every enemy placed on the map', () => {
    expect(placements.length).toBeGreaterThan(0);
    for (const placement of placements) {
      expect(getEnemyDefinition(placement.id), placement.id).toBeDefined();
    }
  });

  it('gives every enemy a band and a card group', () => {
    for (const enemy of listEnemyDefinitions()) {
      expect(enemy.band, enemy.id).toBeDefined();
      expect(enemy.group, enemy.id).toBeDefined();
    }
  });

  it('only names signature cards that exist and are marked signature', () => {
    const used = listEnemyDefinitions().flatMap((enemy) => enemy.signatureCardIds ?? []);
    expect(used.length).toBeGreaterThan(0);
    for (const id of used) {
      const card = enemyCards.find((entry) => entry.id === id);
      expect(card, id).toBeDefined();
      expect(card?.signature, id).toBe(true);
    }
  });

  it('assigns every signature card to an enemy', () => {
    const used = new Set(listEnemyDefinitions().flatMap((enemy) => enemy.signatureCardIds ?? []));
    for (const card of enemyCards.filter((entry) => entry.signature)) {
      expect(used.has(card.id), card.id).toBe(true);
    }
  });

  it('hydrates a placement into a live enemy with placement rules applied', () => {
    const enemy = hydrateEnemyPlacement({
      id: 'sorcerer_enemy',
      requiresFlag: 'ritual_demon_cleared',
      skipAutoEncounter: true,
    });
    expect(enemy.name).toBe('The Sorcerer');
    expect(enemy.band).toBe('elite');
    expect(enemy.group).toBe('ritualist');
    expect(enemy.defeated).toBe(false);
    expect(enemy.requiresFlag).toBe('ritual_demon_cleared');
    expect(enemy.skipAutoEncounter).toBe(true);
  });

  it('leaves placement rules off enemies that do not declare them', () => {
    const enemy = hydrateEnemyPlacement({ id: 'prisoner' });
    expect(enemy.requiresFlag).toBeUndefined();
    expect(enemy.skipAutoEncounter).toBeUndefined();
  });

  it('rejects an unknown enemy id', () => {
    expect(() => hydrateEnemyPlacement({ id: 'no_such_enemy' })).toThrow(/no_such_enemy/);
  });

  it('hydrates map enemies into the exploration context', () => {
    const context = createInitialExploration(1);
    const cellBlock = context.locations.cell_block;
    expect(cellBlock?.enemies).toHaveLength(1);
    expect(cellBlock?.enemies[0]?.name).toBe('Prisoner');
    expect(cellBlock?.enemies[0]?.image).toBe('/characters/prisoner.png');
    expect(cellBlock?.enemies[0]?.band).toBe('intro');
  });

  it('scales the difficulty curve from intro trash to elites', () => {
    const prisoner = resolveEnemyBattleProfile(hydrateEnemyPlacement({ id: 'prisoner' }));
    const knight = resolveEnemyBattleProfile(hydrateEnemyPlacement({ id: 'knight' }));
    const warden = resolveEnemyBattleProfile(hydrateEnemyPlacement({ id: 'prison_warden_boss' }));

    expect(prisoner.deckSize).toBeLessThan(knight.deckSize);
    expect(knight.deckSize).toBeLessThanOrEqual(warden.deckSize);
    expect(prisoner.maxShield).toBeLessThan(warden.maxShield);
    expect(warden.deckCardIds).toContain('signature_warden_decree');
  });

  it('keeps the sorcerer oversized with regenerating barriers', () => {
    const profile = resolveEnemyBattleProfile(hydrateEnemyPlacement({ id: 'sorcerer_enemy' }));
    expect(profile.deckSize).toBe(30);
    expect(profile.barrierPerTurn).toBe(2);
  });
});
