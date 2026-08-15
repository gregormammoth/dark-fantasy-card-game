'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';

interface TourModalHint {
  title: string;
  body: string;
}

interface TourModalProps {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  body: string;
  tipLabel?: string;
  tip?: string;
  hints?: TourModalHint[];
  confirmLabel: string;
}

export function TourModal({
  open,
  onClose,
  eyebrow,
  title,
  body,
  tipLabel,
  tip,
  hints,
  confirmLabel,
}: TourModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[95] flex animate-[modalIn_.22s_ease-out] items-center justify-center bg-[rgba(6,4,4,.78)] p-6 backdrop-blur-[6px]">
      <div className="flex max-h-[88vh] w-[620px] max-w-full flex-col overflow-hidden rounded-lg border border-[rgba(201,162,74,.28)] bg-[linear-gradient(180deg,#161110,#0d0a09)] shadow-[0_50px_120px_-30px_#000]">
        <div className="flex items-center justify-between border-b border-[rgba(201,162,74,.16)] px-[26px] py-5">
          <span className="text-[11px] tracking-[.3em] text-[#8a7f72]">{eyebrow}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[18px] leading-none text-[#8a7f72] transition hover:text-[#e8ddcf]"
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-[18px] overflow-y-auto px-[30px] py-7">
          <div className="font-cinzel text-[22px] text-[#f0dfcb]">{title}</div>
          <p className="m-0 text-[14px] leading-[1.7] text-[#b7ab9c]">{body}</p>
          {tip && tipLabel && (
            <div className="flex gap-3.5 rounded-lg border border-[rgba(201,162,74,.18)] bg-[rgba(201,162,74,.06)] px-4 py-3.5">
              <span className="shrink-0 font-cinzel text-xs tracking-[.14em] text-[#c9a24a]">
                {tipLabel}
              </span>
              <span className="text-[13px] leading-relaxed text-[#a99c8d]">{tip}</span>
            </div>
          )}
          {hints && hints.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {hints.map((hint) => (
                <p key={hint.title} className="m-0 text-[13px] leading-relaxed text-[#a99c8d]">
                  <span className="font-semibold text-[#f0dfcb]">{hint.title}</span> {hint.body}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-[rgba(201,162,74,.16)] px-[26px] py-[18px]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border-0 bg-[linear-gradient(180deg,#f0cd7e,#c9a24a)] px-[22px] py-2.5 font-cinzel text-xs tracking-[.1em] text-[#1a1208] transition hover:brightness-[1.08]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
