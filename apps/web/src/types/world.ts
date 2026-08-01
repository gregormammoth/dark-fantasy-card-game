export type WorldLocationCategory =
  | 'capital'
  | 'kingdom'
  | 'fortress'
  | 'monastery'
  | 'village'
  | 'farmland'
  | 'dungeon'
  | 'danger'
  | 'poi';

export type AppScreen = 'world' | 'exploration' | 'battle';

export interface WorldThreat {
  name: string;
  tier: string;
}

export interface WorldLocationDefinition {
  id: string;
  name: string;
  category: WorldLocationCategory;
  x: number;
  y: number;
  enabled: boolean;
  flavor: string;
  threat?: WorldThreat;
  targetScreen?: AppScreen;
}

export interface WorldMapDefinition {
  id: string;
  name: string;
  image: string;
  mapWidth: number;
  mapHeight: number;
  startLocationId: string;
  locations: WorldLocationDefinition[];
}
