/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import { createInitialExploration } from './setup';
import { buyShopService, canBuyShopService, grantMoney } from './money';
import { tryCompleteGatherIngredientsQuest, grantQuest } from './quests';
import { resolveLocationBattle } from './locationEncounters';

describe('exploration money', () => {
  it('starts at zero crowns', () => {
    const exploration = createInitialExploration(1);
    expect(exploration.money).toBe(0);
  });

  it('pays the sorcerer quest reward', () => {
    let exploration = createInitialExploration(2);
    exploration = grantQuest(exploration, 'gather_ritual_ingredients');
    exploration.flags.ingredient_lavender = true;
    exploration.flags.ingredient_mushroom = true;
    exploration = tryCompleteGatherIngredientsQuest(exploration, 'ritual_room');
    expect(exploration.money).toBe(20);
  });

  it('pays enemy reward money on victory', () => {
    let exploration = createInitialExploration(3);
    const barracks = exploration.locations.guard_barracks;
    expect(barracks?.enemies.some((enemy) => enemy.id === 'guard')).toBe(true);
    exploration.locationEncounterQueue = [
      { type: 'battle', locationId: 'guard_barracks', targetId: 'guard' },
    ];
    exploration = resolveLocationBattle(exploration, true, 'guard_barracks', 'guard');
    expect(exploration.money).toBe(8);
  });

  it('lets the smuggler restore shield for crowns', () => {
    let exploration = createInitialExploration(4);
    exploration = grantMoney(exploration, 12);
    exploration.shield = 0;
    const service = exploration.locations.central_corridor.npcs
      .find((npc) => npc.id === 'smuggler')
      ?.shopServices?.find((item) => item.id === 'restore_shield');
    expect(service).toBeTruthy();
    expect(canBuyShopService(exploration, service!)).toBe(true);
    exploration = buyShopService(
      exploration,
      'central_corridor',
      'smuggler',
      'restore_shield',
    );
    expect(exploration.money).toBe(6);
    expect(exploration.shield).toBe(exploration.maxShield);
  });

  it('refuses restore when already full or broke', () => {
    let exploration = createInitialExploration(5);
    const service = exploration.locations.central_corridor.npcs
      .find((npc) => npc.id === 'smuggler')
      ?.shopServices?.find((item) => item.id === 'restore_mana')!;
    expect(canBuyShopService(exploration, service)).toBe(false);
    exploration = grantMoney(exploration, 6);
    exploration.mana = exploration.maxMana;
    expect(canBuyShopService(exploration, service)).toBe(false);
    exploration.mana = 0;
    expect(canBuyShopService(exploration, service)).toBe(true);
  });
});
