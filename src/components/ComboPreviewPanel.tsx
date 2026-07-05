import type { ReactNode } from 'react';
import type { ComboPreview } from '@/types/comboPreview';
import { isComboPreviewEmpty } from '@/types/comboPreview';

interface ComboPreviewPanelProps {
  preview: ComboPreview | null;
}

export function ComboPreviewPanel({ preview }: ComboPreviewPanelProps) {
  if (!preview || isComboPreviewEmpty(preview)) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-stone-500">Combo Preview</span>
      <div className="flex min-w-full flex-wrap items-center justify-center gap-2 rounded-lg border border-stone-800 bg-stone-950/60 px-4 py-3">
        {preview.damageToEnemy > 0 && (
          <PreviewBadge tone="damage">⚔ {preview.damageToEnemy} to enemy</PreviewBadge>
        )}
        {preview.ignoresShield && preview.damageToEnemy > 0 && (
          <PreviewBadge tone="special">ignores shield</PreviewBadge>
        )}
        {preview.shieldGain > 0 && (
          <PreviewBadge tone="shield">🛡 +{preview.shieldGain} shield</PreviewBadge>
        )}
        {preview.barrierGain > 0 && (
          <PreviewBadge tone="barrier">✦ +{preview.barrierGain} barrier</PreviewBadge>
        )}
        {preview.poison && (
          <PreviewBadge tone="poison">
            ☠ {preview.poison.damagePerTurn}/turn ({preview.poison.turns} turns)
          </PreviewBadge>
        )}
        {preview.damageReductionPercent !== undefined && preview.damageReductionPercent > 0 && (
          <PreviewBadge tone="reduced">↓ {preview.damageReductionPercent}% damage taken</PreviewBadge>
        )}
        {preview.cardsRecovered > 0 && (
          <PreviewBadge tone="heal">↩ +{preview.cardsRecovered} cards</PreviewBadge>
        )}
      </div>
    </div>
  );
}

function PreviewBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'damage' | 'shield' | 'barrier' | 'poison' | 'reduced' | 'heal' | 'special';
}) {
  const tones: Record<typeof tone, string> = {
    damage: 'border-red-800/60 bg-red-950/50 text-red-300',
    shield: 'border-blue-800/60 bg-blue-950/50 text-blue-300',
    barrier: 'border-violet-800/60 bg-violet-950/50 text-violet-300',
    poison: 'border-green-800/60 bg-green-950/50 text-green-300',
    reduced: 'border-emerald-800/60 bg-emerald-950/50 text-emerald-300',
    heal: 'border-amber-800/60 bg-amber-950/50 text-amber-300',
    special: 'border-stone-700/60 bg-stone-900/50 text-stone-400',
  };

  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
