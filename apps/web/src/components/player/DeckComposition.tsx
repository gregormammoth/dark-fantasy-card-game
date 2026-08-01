import type { CardClass } from '@dark-fantasy/shared/types/card';
import { classThemes } from '@/lib/cardTheme';
import { PLAYER_CLASSES } from '@/data/playerProgress';

interface DeckCompositionProps {
  deckIds: string[];
  cardClassById: Record<string, CardClass>;
  cardNameById: Record<string, string>;
  deckCap: number;
}

export function DeckComposition({
  deckIds,
  cardClassById,
  cardNameById,
  deckCap,
}: DeckCompositionProps) {
  const counts = Object.fromEntries(PLAYER_CLASSES.map((id) => [id, 0])) as Record<
    CardClass,
    number
  >;

  for (const id of deckIds) {
    const classId = cardClassById[id];
    if (classId) {
      counts[classId] += 1;
    }
  }

  return (
    <div className="rounded-2xl border border-[rgba(201,162,74,.2)] bg-[linear-gradient(180deg,#161110,#100c0b)] px-[26px] py-[22px]">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="font-cinzel text-[16px] tracking-[.1em] text-[#e8ddcf]">Current Deck</span>
        <span className="text-[12px] text-[#8a7f72]">
          {deckIds.length} / {deckCap} cards
        </span>
      </div>

      <div className="mb-5 flex flex-col gap-2.5">
        {PLAYER_CLASSES.map((classId) => {
          const theme = classThemes[classId];
          const count = counts[classId];
          const pct = deckCap > 0 ? Math.round((count / deckCap) * 100) : 0;
          return (
            <div key={classId} className="flex items-center gap-3">
              <span
                className="w-[70px] font-cinzel text-[12px]"
                style={{ color: theme.accent }}
              >
                {theme.label[0] + theme.label.slice(1).toLowerCase()}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-[5px] bg-[rgba(0,0,0,.4)]">
                <div
                  className="h-full rounded-[5px]"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${theme.accent}aa, ${theme.accent})`,
                  }}
                />
              </div>
              <span className="w-11 text-right text-[12px] text-[#b7ab9c]">{count}</span>
            </div>
          );
        })}
      </div>

      {deckIds.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {deckIds.map((id) => {
            const classId = cardClassById[id];
            const theme = classId ? classThemes[classId] : null;
            return (
              <div
                key={id}
                className="flex h-[70px] w-14 items-center justify-center rounded-md border bg-[#181211] px-1 text-center text-[9px] leading-tight"
                style={{
                  borderColor: theme?.accent ?? 'rgba(201,162,74,.2)',
                  color: theme?.accent ?? '#e8ddcf',
                }}
              >
                {cardNameById[id] ?? id}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-[12px] text-[#8a7f72]">No cards in deck yet.</div>
      )}
    </div>
  );
}
