'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from '@/i18n/useTranslation';

export function TutorialTitle({ children }: { children: ReactNode }) {
  return (
    <div
      className="font-cinzel text-[22px]"
      style={{
        background: 'linear-gradient(180deg,#fff6e0,#e8c874)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {children}
    </div>
  );
}

export function TutorialBody({ children }: { children: ReactNode }) {
  return <p className="m-0 text-[14px] leading-[1.7] text-[#c2d0e0]">{children}</p>;
}

export function TutorialTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3.5 rounded-[8px] border border-[rgba(232,200,116,.25)] bg-[rgba(232,200,116,.06)] px-4 py-3.5">
      <span className="shrink-0 font-cinzel text-xs tracking-[.14em] text-[#e8c874]">{label}</span>
      <span className="text-[13px] leading-relaxed text-[#9db4cc]">{children}</span>
    </div>
  );
}

export function TutorialPoints({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={item} className="flex items-center gap-2.5 text-[13px] text-[#9db4cc]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(232,200,116,.16)] font-cinzel text-[11px] text-[#e8c874]">
            {index + 1}
          </span>
          {item}
        </div>
      ))}
    </div>
  );
}

export function TutorialHints({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <p key={item.title} className="m-0 text-[13px] leading-relaxed text-[#9db4cc]">
          <span className="font-semibold text-[#eef3f8]">{item.title}</span> {item.body}
        </p>
      ))}
    </div>
  );
}

export function TutorialTypeRow({
  icon,
  title,
  body,
  accent,
  titleColor,
  background,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  accent: string;
  titleColor: string;
  background: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-[8px] px-3 py-2.5"
      style={{
        background,
        borderLeft: `3px solid ${accent}`,
        boxShadow: '0 1px 0 rgba(255,255,255,.04) inset',
      }}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <div className="font-cinzel text-[14px]" style={{ color: titleColor }}>
          {title}
        </div>
        <div className="text-xs leading-snug text-[#9db4cc]">{body}</div>
      </div>
    </div>
  );
}

export function TutorialModal({
  open,
  onClose,
  eyebrow,
  steps,
  backLabel,
  nextLabel,
  doneLabel,
  stepLabel,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  steps: ReactNode[];
  backLabel: string;
  nextLabel: string;
  doneLabel: string;
  stepLabel: (step: number) => string;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(0);
    }
  }, [open]);

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

  if (!open || steps.length === 0) {
    return null;
  }

  const last = Math.max(0, steps.length - 1);
  const isLast = step >= last;

  return (
    <div
      className="fixed inset-0 z-[95] flex animate-[fadeIn_.15s_ease-out] items-center justify-center p-6 backdrop-blur-[3px]"
      style={{ background: 'rgba(4,6,10,.75)' }}
    >
      <div
        className="flex max-h-[88vh] w-[640px] max-w-full animate-[modalIn_.18s_ease-out] flex-col overflow-hidden rounded-[12px]"
        style={{
          border: '1px solid rgba(232,200,116,.4)',
          background: 'linear-gradient(160deg,#152540,#0a1120)',
          boxShadow: '0 1px 0 rgba(255,255,255,.08) inset,0 50px 100px -20px #000',
        }}
      >
        <div className="flex items-center justify-between border-b border-[rgba(232,200,116,.18)] px-[26px] py-5">
          <span className="text-[10px] tracking-[.2em] text-[#5c7086]">{eyebrow}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[18px] leading-none text-[#7d93ad] transition hover:text-[#eef3f8]"
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>
        <div className="flex flex-col gap-[18px] overflow-y-auto px-[30px] py-7">{steps[step]}</div>
        <div className="flex items-center justify-between border-t border-[rgba(232,200,116,.18)] px-[26px] py-[18px]">
          <div className="flex gap-[7px]">
            {steps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setStep(index)}
                className="h-[7px] w-[7px] rounded-full transition"
                style={{
                  background: index === step ? '#e8c874' : 'rgba(232,200,116,.22)',
                }}
                aria-label={stepLabel(index + 1)}
              />
            ))}
          </div>
          <div className="flex gap-2.5">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                className="rounded-[8px] border border-[rgba(232,200,116,.24)] bg-transparent px-[18px] py-2.5 font-cinzel text-xs tracking-[.1em] text-[#7d93ad] transition hover:border-[rgba(232,200,116,.5)] hover:text-[#eef3f8]"
              >
                {backLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  onClose();
                  return;
                }
                setStep((current) => Math.min(last, current + 1));
              }}
              className="rounded-[8px] px-[22px] py-2.5 font-cinzel text-xs tracking-[.1em] text-[#1a1208] transition hover:brightness-[1.08]"
              style={{ background: 'linear-gradient(180deg,#f5dfa0,#c9922e)' }}
            >
              {isLast ? doneLabel : nextLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
