import type { LocationType } from '@/types/exploration';

export const locationTypeColors: Record<LocationType, string> = {
  start: '#e0b552',
  hub: '#c9a24a',
  loot: '#c9a24a',
  npc: '#5b86c4',
  danger: '#d6443a',
  secret: '#9a7ae0',
  boss: '#e0524a',
};

export const activityColors = {
  combat: '#d6443a',
  loot: '#c9a24a',
  npc: '#5b86c4',
  quest: '#e0b552',
  rest: '#6fae5a',
  secret: '#9a7ae0',
  move: '#e0524a',
};

export function roomSizeFor(type: LocationType): [number, number] {
  if (type === 'boss') {
    return [210, 148];
  }
  if (type === 'secret') {
    return [150, 100];
  }
  if (type === 'start' || type === 'hub') {
    return [190, 128];
  }
  return [170, 114];
}
