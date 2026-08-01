import type { LocationEnemy } from '@dark-fantasy/shared/types/exploration';

interface LocationBattleModalProps {
  enemy: LocationEnemy;
  onFight: () => void;
  onFlee: () => void;
}

export function LocationBattleModal({ enemy, onFight, onFlee }: LocationBattleModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex animate-[fadeIn_.15s_ease-out] items-center justify-center bg-[rgba(6,5,4,.8)] p-6 backdrop-blur-[3px]">
      <div className="w-full max-w-[420px] animate-[modalIn_.18s_ease-out] overflow-hidden rounded-2xl border border-[rgba(224,82,74,.45)] bg-[linear-gradient(180deg,#1c1211,#100c0b)] shadow-[0_40px_90px_-20px_#000]">
        <div className="relative h-[180px] overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(214,68,58,.28),transparent_65%),linear-gradient(180deg,#2a1614,#100c0b)]">
          {enemy.image ? (
            <img
              src={enemy.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
              draggable={false}
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,18,17,.1),rgba(16,12,11,.95))]" />
          <div className="absolute bottom-3.5 left-[22px]">
            <span className="text-[10px] tracking-[.22em] text-[#ff8f85]">{enemy.tier}</span>
            <div className="mt-1 font-cinzel text-[22px] text-[#f3e2d6] [text-shadow:0_2px_8px_#000]">
              {enemy.name}
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="m-0 text-[13px] leading-relaxed text-[#c7bba9]">
            {enemy.description ?? `${enemy.name} blocks your path.`}
          </p>
        </div>
        <div className="flex gap-2.5 px-6 pb-6">
          <button
            type="button"
            onClick={onFight}
            className="flex-1 rounded-[10px] border border-[rgba(224,82,74,.6)] bg-[linear-gradient(180deg,rgba(224,82,74,.24),rgba(90,23,19,.3))] py-[13px] font-cinzel text-[13px] tracking-[.1em] text-[#f3e2d6] transition hover:brightness-110"
          >
            FIGHT
          </button>
          <button
            type="button"
            onClick={onFlee}
            className="flex-1 rounded-[10px] border border-[rgba(201,162,74,.3)] bg-transparent py-[13px] font-cinzel text-[13px] tracking-[.1em] text-[#c9a24a] transition hover:border-[rgba(201,162,74,.7)]"
          >
            FLEE
          </button>
        </div>
      </div>
    </div>
  );
}
