import type { PendingEncounter } from '@/types/exploration';

interface EncounterModalProps {
  encounter: PendingEncounter;
  onDismiss: () => void;
}

export function EncounterModal({ encounter, onDismiss }: EncounterModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(6,4,3,.72)] p-6 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[14px] border border-[rgba(201,162,74,.35)] bg-[linear-gradient(180deg,#1a1410,#100c0a)] p-6 shadow-[0_30px_80px_-20px_#000]">
        <div className="text-[10px] tracking-[.28em] text-[#c9a24a]">ENCOUNTER</div>
        <h2 className="mt-2 font-cinzel text-[26px] text-[#f3ead8]">{encounter.title}</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#c7bba9]">{encounter.description}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full rounded-[10px] border border-[rgba(201,162,74,.5)] bg-[rgba(224,181,82,.14)] py-3 font-cinzel text-[13px] tracking-[.14em] text-[#e0b552] transition hover:brightness-110"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
