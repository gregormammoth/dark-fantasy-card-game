import type { LocationNpc } from '@dark-fantasy/shared/types/exploration';

interface NpcDialogModalProps {
  npc: LocationNpc;
  line: string;
  progress: string;
  nextLabel: string;
  onNext: () => void;
}

export function NpcDialogModal({
  npc,
  line,
  progress,
  nextLabel,
  onNext,
}: NpcDialogModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex animate-[fadeIn_.15s_ease-out] items-center justify-center bg-[rgba(6,5,4,.75)] p-6 backdrop-blur-[3px]">
      <div className="flex w-full max-w-[640px] animate-[modalIn_.18s_ease-out] overflow-hidden rounded-2xl border border-[rgba(91,134,196,.4)] bg-[linear-gradient(180deg,#131720,#0e1015)] shadow-[0_40px_90px_-20px_#000]">
        <div className="relative w-[230px] shrink-0 bg-[#0a0d13]">
          {npc.image ? (
            <img
              src={npc.image}
              alt=""
              className="h-full w-full object-cover object-top"
              draggable={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center font-cinzel text-[48px] text-[#cfe0fa]">
              {npc.name.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_65%,rgba(19,23,32,.9)_100%)]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-[rgba(91,134,196,.2)] bg-[linear-gradient(180deg,rgba(91,134,196,.14),transparent)] px-6 py-5">
            <div className="text-[9px] tracking-[.2em] text-[#8fa8d6]">
              {(npc.tag ?? 'NPC').toUpperCase()}
            </div>
            <div className="mt-1 font-cinzel text-[19px] text-[#e6edfa]">{npc.name}</div>
          </div>
          <div className="min-h-[70px] flex-1 px-6 py-[22px]">
            <p className="m-0 text-[14px] italic leading-relaxed text-[#d7ddec]">
              &ldquo;{line}&rdquo;
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 px-6 pb-5">
            <span className="text-[10px] tracking-[.14em] text-[#5c667c]">{progress}</span>
            <button
              type="button"
              onClick={onNext}
              className="rounded-[10px] border border-[rgba(91,134,196,.5)] bg-[linear-gradient(180deg,rgba(91,134,196,.24),rgba(30,46,74,.3))] px-[26px] py-[11px] font-cinzel text-[12px] tracking-[.1em] text-[#e6edfa] transition hover:brightness-110"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
