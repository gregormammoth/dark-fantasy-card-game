import type { BattleLogEntry } from '@/types/log';

interface TopBarProps {
  turnLabel: string;
  logEntries: BattleLogEntry[];
}

export function TopBar({ turnLabel, logEntries }: TopBarProps) {
  const logSnippet =
    logEntries.length > 0
      ? logEntries
          .slice(-3)
          .map((entry) => entry.message)
          .join(' · ')
      : 'Battle begins';

  return (
    <div className="flex items-center justify-between gap-5">
      <span className="shrink-0 text-[11px] tracking-[.24em] whitespace-nowrap text-[#c9a24a]">
        ◆ {turnLabel}
      </span>
      <span className="font-cinzel text-[15px] tracking-[.36em] text-[#b8917f]">
        DARK&nbsp;FANTASY&nbsp;DUEL
      </span>
      <span
        className="max-w-[360px] truncate text-[11px] tracking-[.02em] text-[#5a5147]"
        title={logSnippet}
      >
        {logSnippet}
      </span>
    </div>
  );
}
