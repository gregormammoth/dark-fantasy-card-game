import { useEffect, useRef } from 'react';
import type { BattleLogEntry } from '@/types/log';

const kindStyles: Record<BattleLogEntry['kind'], string> = {
  system: 'text-stone-400',
  draw: 'text-sky-400',
  combo: 'text-amber-400',
  play: 'text-violet-300',
  damage: 'text-red-400',
  shield: 'text-blue-400',
  barrier: 'text-violet-400',
  poison: 'text-green-400',
  heal: 'text-emerald-400',
  victory: 'text-yellow-300 font-semibold',
  defeat: 'text-red-300 font-semibold',
};

interface BattleLogProps {
  entries: BattleLogEntry[];
}

export function BattleLog({ entries }: BattleLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <aside className="flex w-72 shrink-0 flex-col rounded-xl border border-stone-800 bg-stone-950/80">
      <h3 className="border-b border-stone-800 px-4 py-3 text-xs font-semibold tracking-widest text-stone-500 uppercase">
        Battle Log
      </h3>
      <div className="flex max-h-[calc(100vh-8rem)] flex-col gap-2 overflow-y-auto p-4">
        {entries.length === 0 ? (
          <p className="text-sm text-stone-600">No events yet.</p>
        ) : (
          entries.map((entry) => (
            <p key={entry.id} className={`text-sm leading-snug ${kindStyles[entry.kind]}`}>
              {entry.message}
            </p>
          ))
        )}
        <div ref={endRef} />
      </div>
    </aside>
  );
}
