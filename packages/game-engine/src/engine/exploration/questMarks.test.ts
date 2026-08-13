/// <reference types="vitest/globals" />

import { describe, expect, it } from 'vitest';
import { createInitialExploration } from './setup';
import { grantQuest, listQuestMarksForLocation, locationHasQuestMark } from './quests';
import { resolveLocationBattle } from './locationEncounters';

describe('quest location marks', () => {
  it('marks ingredient rooms while the sorcerer quest is active', () => {
    let exploration = createInitialExploration(1);
    exploration = grantQuest(exploration, 'gather_ritual_ingredients');

    expect(locationHasQuestMark(exploration, 'infirmary')).toBe(true);
    expect(locationHasQuestMark(exploration, 'underground_tunnels')).toBe(true);
    expect(locationHasQuestMark(exploration, 'ritual_room')).toBe(true);
    expect(locationHasQuestMark(exploration, 'kitchen')).toBe(false);

    const infirmary = listQuestMarksForLocation(exploration, 'infirmary');
    expect(infirmary[0]?.hint).toMatch(/lavender/i);
  });

  it('drops an ingredient mark after that item is found', () => {
    let exploration = createInitialExploration(2);
    exploration = grantQuest(exploration, 'gather_ritual_ingredients');
    exploration.flags.ingredient_lavender = true;

    expect(listQuestMarksForLocation(exploration, 'infirmary')).toHaveLength(0);
    expect(listQuestMarksForLocation(exploration, 'underground_tunnels').length).toBeGreaterThan(0);
    expect(listQuestMarksForLocation(exploration, 'ritual_room')[0]?.hint).toMatch(/waits/i);
  });

  it('marks dining-path rooms and kill-quest targets', () => {
    let exploration = createInitialExploration(3);
    exploration = grantQuest(exploration, 'find_dining_way');
    exploration = grantQuest(exploration, 'kill_warden');

    expect(locationHasQuestMark(exploration, 'torture_chamber')).toBe(true);
    expect(locationHasQuestMark(exploration, 'kitchen')).toBe(true);
    expect(locationHasQuestMark(exploration, 'warden_tower')).toBe(true);
  });
});

describe('ingredient grants', () => {
  it('does not grant lavender on arrival while the infirmary enemy is still up', () => {
    let exploration = createInitialExploration(8);
    exploration = grantQuest(exploration, 'gather_ritual_ingredients');
    expect(exploration.locations.infirmary.enemies.length).toBeGreaterThan(0);
    expect(exploration.flags.ingredient_lavender).toBeFalsy();
  });

  it('grants lavender after winning the infirmary fight', () => {
    let exploration = createInitialExploration(8);
    exploration = grantQuest(exploration, 'gather_ritual_ingredients');
    exploration.locationEncounterQueue = [
      { type: 'battle', locationId: 'infirmary', targetId: 'crazy_prisoner' },
    ];
    exploration = resolveLocationBattle(exploration, true, 'infirmary', 'crazy_prisoner');
    expect(exploration.flags.ingredient_lavender).toBe(true);
    expect(
      exploration.locations.infirmary.loot.find((item) => item.id === 'dried_lavender')?.claimed,
    ).toBe(true);
  });

  it('does not grant mushroom if the tunnel fight is lost', () => {
    let exploration = createInitialExploration(9);
    exploration = grantQuest(exploration, 'gather_ritual_ingredients');
    exploration.locationEncounterQueue = [
      { type: 'battle', locationId: 'underground_tunnels', targetId: 'giant_rat' },
    ];
    exploration = resolveLocationBattle(exploration, false, 'underground_tunnels', 'giant_rat');
    expect(exploration.flags.ingredient_mushroom).toBeFalsy();
  });
});
