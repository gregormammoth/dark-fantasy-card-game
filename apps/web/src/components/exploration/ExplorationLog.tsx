import type { ExplorationLogEntry } from '@/types/exploration';

interface ExplorationLogProps {
  entries: ExplorationLogEntry[];
}

const kindColor: Record<ExplorationLogEntry['kind'], string> = {
  system: 'text-[#8a7f72]',
  action: 'text-[#e8ddcf]',
  encounter: 'text-[#e0b552]',
  move: 'text-[#c9a24a]',
  loot: 'text-[#6fae5a]',
  danger: 'text-[#d6443a]',
};

export function ExplorationLog({ entries }: ExplorationLogProps) {
  const recent = entries.slice(-8).reverse();
  return (
    <div className="rounded-[12px] border border-[rgba(201,162,74,.16)] bg-[rgba(10,8,7,.72)] p-3">
      <div className="mb-2 text-[9px] tracking-[.22em] text-[#8a7f72]">RECENT EVENTS</div>
      <div className="flex max-h-[140px] flex-col gap-1.5 overflow-y-auto">
        {recent.map((entry) => (
          <div key={entry.id} className={`text-[12px] leading-snug ${kindColor[entry.kind]}`}>
            {entry.message}
          </div>
        ))}
        {recent.length === 0 && (
          <div className="text-[12px] text-[#8a7f72]">No events yet.</div>
        )}
      </div>
    </div>
  );
}
