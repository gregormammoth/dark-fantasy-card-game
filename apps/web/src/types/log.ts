export type BattleLogKind =
  | 'system'
  | 'draw'
  | 'combo'
  | 'play'
  | 'damage'
  | 'shield'
  | 'barrier'
  | 'poison'
  | 'heal'
  | 'victory'
  | 'defeat';

export interface BattleLogEntry {
  id: string;
  message: string;
  kind: BattleLogKind;
}
