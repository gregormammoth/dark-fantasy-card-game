export interface ComboPreview {
  damageToEnemy: number;
  shieldGain: number;
  barrierGain: number;
  poison?: { damagePerTurn: number; turns: number };
  damageReductionPercent?: number;
  cardsRecovered: number;
  ignoresShield: boolean;
}

export function isComboPreviewEmpty(preview: ComboPreview): boolean {
  return (
    preview.damageToEnemy === 0 &&
    preview.shieldGain === 0 &&
    preview.barrierGain === 0 &&
    preview.cardsRecovered === 0 &&
    !preview.poison &&
    !preview.damageReductionPercent &&
    !preview.ignoresShield
  );
}
