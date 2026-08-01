import type { CardClass } from '@dark-fantasy/shared/types/card';
import { classThemes } from '@/lib/cardTheme';

export interface ClassProgressSummary {
  id: CardClass;
  name: string;
  xp: number;
  xpPct: number;
  nextUnlock: string;
  unlockedCount: number;
  selected: boolean;
}

interface ClassProgressCardProps {
  summary: ClassProgressSummary;
  onSelect: () => void;
}

export function ClassProgressCard({ summary, onSelect }: ClassProgressCardProps) {
  const theme = classThemes[summary.id];
  const color = theme.accent;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex-1 rounded-[14px] bg-[linear-gradient(180deg,#161110,#100c0b)] px-5 py-[18px] text-left transition-transform duration-150 hover:-translate-y-[3px]"
      style={{
        border: `1px solid ${summary.selected ? color : 'rgba(201,162,74,.16)'}`,
        boxShadow: summary.selected
          ? `0 0 0 1px ${color}55, 0 18px 40px -18px ${color}88`
          : 'none',
      }}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-cinzel text-[17px] tracking-[.06em]" style={{ color }}>
          {summary.name}
        </span>
        <span className="text-[11px] tracking-[.12em] text-[#8a7f72]">{summary.xp} XP</span>
      </div>
      <div className="mt-2 text-[12px] text-[#a99c8d]">Class experience</div>
      <div className="mt-1.5 h-2 overflow-hidden rounded border border-[rgba(255,255,255,.05)] bg-[rgba(0,0,0,.4)]">
        <div
          className="h-full rounded"
          style={{
            width: `${summary.xpPct}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
          }}
        />
      </div>
      <div className="mt-3 text-[11px] text-[#8a7f72]">Next unlock</div>
      <div className="mt-0.5 text-[13px] text-[#e8ddcf]">{summary.nextUnlock}</div>
      <div className="mt-3 text-[11px] text-[#8a7f72]">
        {summary.unlockedCount} cards unlocked
      </div>
    </button>
  );
}
