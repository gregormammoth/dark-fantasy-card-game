'use client';

import type { ReactNode } from 'react';

type CoachPlacement = 'top' | 'bottom' | 'center';

interface CoachMarkProps {
  title: string;
  body: ReactNode;
  onDismiss: () => void;
  placement?: CoachPlacement;
  dismissLabel?: string;
}

const placementClass: Record<CoachPlacement, string> = {
  top: 'items-start pt-24',
  bottom: 'items-end pb-40',
  center: 'items-center',
};

export function CoachMark({
  title,
  body,
  onDismiss,
  placement = 'top',
  dismissLabel = 'GOT IT',
}: CoachMarkProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[90] flex justify-center px-5 ${placementClass[placement]}`}
    >
      <div className="pointer-events-auto w-full max-w-[380px] rounded-[10px] border border-[rgba(201,162,74,.55)] bg-[rgba(12,9,8,.97)] p-4 shadow-[0_24px_60px_-12px_#000] animate-[modalIn_.22s_ease-out]">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(201,162,74,.7)] text-[11px] text-[#e0b552]">
            ★
          </span>
          <span className="font-cinzel text-[12px] tracking-[.2em] text-[#e0b552]">{title}</span>
        </div>
        <p className="mt-2.5 text-[13px] leading-relaxed text-[#d8cbba]">{body}</p>
        <div className="mt-3.5 flex justify-end">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-[6px] border border-[rgba(201,162,74,.5)] bg-[rgba(224,181,82,.14)] px-3.5 py-1.5 font-cinzel text-[11px] tracking-[.16em] text-[#e0b552] transition hover:brightness-110"
          >
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
