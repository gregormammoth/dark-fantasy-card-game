'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import type { MessageKey } from '@/i18n/types';

const STEPS = 4;

interface ExplorationTutorialModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExplorationTutorialModal({ open, onClose }: ExplorationTutorialModalProps) {
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

  if (!open) {
    return null;
  }

  const isLast = step >= STEPS - 1;

  return (
    <div className="fixed inset-0 z-[95] flex animate-[fadeIn_.15s_ease-out] items-center justify-center p-6 backdrop-blur-[3px]" style={{ background: 'rgba(4,6,10,.75)' }}>
      <div
        className="flex max-h-[88vh] w-[640px] max-w-full flex-col overflow-hidden rounded-[12px] animate-[modalIn_.18s_ease-out]"
        style={{ border: '1px solid rgba(232,200,116,.4)', background: 'linear-gradient(160deg,#152540,#0a1120)', boxShadow: '0 1px 0 rgba(255,255,255,.08) inset,0 50px 100px -20px #000' }}
      >
        <div className="flex items-center justify-between border-b border-[rgba(232,200,116,.18)] px-[26px] py-5">
          <span className="text-[10px] tracking-[.2em] text-[#5c7086]">
            {t('explorationTutorial.eyebrow')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[18px] leading-none text-[#7d93ad] transition hover:text-[#eef3f8]"
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-[18px] overflow-y-auto px-[30px] py-7">
          {step === 0 && (
            <>
              <div
                className="font-cinzel text-[22px]"
                style={{ background: 'linear-gradient(180deg,#fff6e0,#e8c874)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
              >
                {t('explorationTutorial.step0Title')}
              </div>
              <p className="m-0 text-[14px] leading-[1.7] text-[#c2d0e0]">
                {t('explorationTutorial.step0Body')}
              </p>
              <div className="flex gap-3.5 rounded-[8px] border border-[rgba(232,200,116,.25)] bg-[rgba(232,200,116,.06)] px-4 py-3.5">
                <span className="shrink-0 font-cinzel text-xs tracking-[.14em] text-[#e8c874]">
                  {t('explorationTutorial.tip')}
                </span>
                <span className="text-[13px] leading-relaxed text-[#9db4cc]">
                  {t('explorationTutorial.step0Tip')}
                </span>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div
                className="font-cinzel text-[22px]"
                style={{ background: 'linear-gradient(180deg,#fff6e0,#e8c874)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
              >
                {t('explorationTutorial.step1Title')}
              </div>
              <p className="m-0 text-[14px] leading-[1.7] text-[#c2d0e0]">
                {t('explorationTutorial.step1Body')}
              </p>
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-2.5 text-[13px] text-[#9db4cc]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(232,200,116,.16)] font-cinzel text-[11px] text-[#e8c874]">
                      {n}
                    </span>
                    {t(`explorationTutorial.step1Point${n}` as MessageKey)}
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div
                className="font-cinzel text-[22px]"
                style={{ background: 'linear-gradient(180deg,#fff6e0,#e8c874)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
              >
                {t('explorationTutorial.step2Title')}
              </div>
              <div className="flex flex-col gap-3">
                <TypeRow
                  tone="quest"
                  icon={<span className="mt-0.5 inline-block h-[13px] w-[13px] shrink-0 rounded-full bg-[#e0b552]" />}
                  title={t('explorationTutorial.typeQuest')}
                  body={t('explorationTutorial.typeQuestBody')}
                />
                <TypeRow
                  tone="npc"
                  icon={<span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-full bg-[#5b86c4]" />}
                  title={t('explorationTutorial.typeNpc')}
                  body={t('explorationTutorial.typeNpcBody')}
                />
                <TypeRow
                  tone="monster"
                  icon={<span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-full bg-[#e0524a]" />}
                  title={t('explorationTutorial.typeMonster')}
                  body={t('explorationTutorial.typeMonsterBody')}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div
                className="font-cinzel text-[22px]"
                style={{ background: 'linear-gradient(180deg,#fff6e0,#e8c874)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
              >
                {t('explorationTutorial.step3Title')}
              </div>
              <p className="m-0 text-[14px] leading-[1.7] text-[#c2d0e0]">
                {t('explorationTutorial.step3Body')}
              </p>
              <div className="flex flex-col gap-2.5">
                {(['A', 'B', 'C'] as const).map((key) => (
                  <p key={key} className="m-0 text-[13px] leading-relaxed text-[#9db4cc]">
                    <span className="font-semibold text-[#eef3f8]">
                      {t(`explorationTutorial.step3Hint${key}Title` as MessageKey)}
                    </span>{' '}
                    {t(`explorationTutorial.step3Hint${key}Body` as MessageKey)}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[rgba(232,200,116,.18)] px-[26px] py-[18px]">
          <div className="flex gap-[7px]">
            {Array.from({ length: STEPS }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setStep(index)}
                className="h-[7px] w-[7px] rounded-full transition"
                style={{
                  background: index === step ? '#e8c874' : 'rgba(232,200,116,.22)',
                }}
                aria-label={t('explorationTutorial.stepLabel', { step: index + 1 })}
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
                {t('explorationTutorial.back')}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  onClose();
                  return;
                }
                setStep((current) => Math.min(STEPS - 1, current + 1));
              }}
              className="rounded-[8px] px-[22px] py-2.5 font-cinzel text-xs tracking-[.1em] text-[#1a1208] transition hover:brightness-[1.08]"
              style={{ background: 'linear-gradient(180deg,#f5dfa0,#c9922e)' }}
            >
              {isLast ? t('explorationTutorial.letsGo') : t('explorationTutorial.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeRow({
  tone,
  icon,
  title,
  body,
}: {
  tone: 'quest' | 'npc' | 'monster';
  icon: ReactNode;
  title: string;
  body: string;
}) {
  const styles = {
    quest: {
      bg: 'linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.15))',
      border: '#e8c874',
      title: '#fff6e0',
      body: '#9db4cc',
    },
    npc: {
      bg: 'linear-gradient(180deg,rgba(74,192,255,.06),rgba(0,0,0,.15))',
      border: '#5b86c4',
      title: '#d7e2f2',
      body: '#9db4cc',
    },
    monster: {
      bg: 'linear-gradient(180deg,rgba(214,68,58,.08),rgba(0,0,0,.15))',
      border: '#d6443a',
      title: '#ffd9d2',
      body: '#9db4cc',
    },
  }[tone];

  return (
    <div
      className="flex items-start gap-3 rounded-[8px] px-3 py-2.5"
      style={{ background: styles.bg, borderLeft: `3px solid ${styles.border}`, boxShadow: '0 1px 0 rgba(255,255,255,.04) inset' }}
    >
      <span className="shrink-0">{icon}</span>
      <div>
        <div className="font-cinzel text-[14px]" style={{ color: styles.title }}>
          {title}
        </div>
        <div className="text-xs leading-snug" style={{ color: styles.body }}>
          {body}
        </div>
      </div>
    </div>
  );
}
