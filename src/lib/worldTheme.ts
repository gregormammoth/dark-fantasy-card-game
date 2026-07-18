import type { WorldLocationCategory } from '@/types/world';

export interface CategoryMeta {
  label: string;
  color: string;
}

export const worldCategoryMeta: Record<WorldLocationCategory, CategoryMeta> = {
  capital: { label: 'CAPITAL CITY', color: '#e0b552' },
  kingdom: { label: 'ANCIENT KINGDOM', color: '#4fae8a' },
  fortress: { label: 'FORTRESS', color: '#5b86c4' },
  monastery: { label: 'MONASTERY', color: '#9a7ae0' },
  village: { label: 'VILLAGE', color: '#c9a24a' },
  farmland: { label: 'FARMLAND', color: '#7fae5a' },
  dungeon: { label: 'PRISON', color: '#c9a24a' },
  danger: { label: 'CEMETERY', color: '#8a4a9e' },
  poi: { label: 'POINT OF INTEREST', color: '#7ab8c4' },
};

export function iconSizeForCategory(category: WorldLocationCategory): number {
  if (category === 'capital' || category === 'fortress' || category === 'kingdom') {
    return 28;
  }
  return 20;
}
