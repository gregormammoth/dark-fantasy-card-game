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
    <div className="fixed inset-0 z-[95] flex animate-[modalIn_.22s_ease-out] items-center justify-center bg-[rgba(6,4,4,.78)] p-6 backdrop-blur-[6px]">
      <div className="flex max-h-[88vh] w-[640px] max-w-full flex-col overflow-hidden rounded-lg border border-[rgba(201,162,74,.28)] bg-[linear-gradient(180deg,#161110,#0d0a09)] shadow-[0_50px_120px_-30px_#000]">
        <div className="flex items-center justify-between border-b border-[rgba(201,162,74,.16)] px-[26px] py-5">
          <span className="text-[11px] tracking-[.3em] text-[#8a7f72]">
            {t('explorationTutorial.eyebrow')}
          </span>
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
          {step === 0 && (
            <>
              <div className="font-cinzel text-[22px] text-[#f0dfcb]">
                {t('explorationTutorial.step0Title')}
              </div>
              <p className="m-0 text-[14px] leading-[1.7] text-[#b7ab9c]">
                {t('explorationTutorial.step0Body')}
              </p>
              <div className="flex gap-3.5 rounded-lg border border-[rgba(201,162,74,.18)] bg-[rgba(201,162,74,.06)] px-4 py-3.5">
                <span className="shrink-0 font-cinzel text-xs tracking-[.14em] text-[#c9a24a]">
                  {t('explorationTutorial.tip')}
                </span>
                <span className="text-[13px] leading-relaxed text-[#a99c8d]">
                  {t('explorationTutorial.step0Tip')}
                </span>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="font-cinzel text-[22px] text-[#f0dfcb]">
                {t('explorationTutorial.step1Title')}
              </div>
              <p className="m-0 text-[14px] leading-[1.7] text-[#b7ab9c]">
                {t('explorationTutorial.step1Body')}
              </p>
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-2.5 text-[13px] text-[#a99c8d]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(224,181,82,.16)] font-cinzel text-[11px] text-[#e0b552]">
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
              <div className="font-cinzel text-[22px] text-[#f0dfcb]">
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
              <div className="font-cinzel text-[22px] text-[#f0dfcb]">
                {t('explorationTutorial.step3Title')}
              </div>
              <p className="m-0 text-[14px] leading-[1.7] text-[#b7ab9c]">
                {t('explorationTutorial.step3Body')}
              </p>
              <div className="flex flex-col gap-2.5">
                {(['A', 'B', 'C'] as const).map((key) => (
                  <p key={key} className="m-0 text-[13px] leading-relaxed text-[#a99c8d]">
                    <span className="font-semibold text-[#f0dfcb]">
                      {t(`explorationTutorial.step3Hint${key}Title` as MessageKey)}
                    </span>{' '}
                    {t(`explorationTutorial.step3Hint${key}Body` as MessageKey)}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[rgba(201,162,74,.16)] px-[26px] py-[18px]">
          <div className="flex gap-[7px]">
            {Array.from({ length: STEPS }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setStep(index)}
                className="h-[7px] w-[7px] rounded-full"
                style={{
                  background: index === step ? '#e0b552' : 'rgba(201,162,74,.25)',
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
                className="rounded-md border border-[rgba(201,162,74,.3)] bg-transparent px-[18px] py-2.5 font-cinzel text-xs tracking-[.1em] text-[#b7ab9c] transition hover:border-[rgba(201,162,74,.6)] hover:text-[#e8ddcf]"
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
              className="rounded-md border-0 bg-[linear-gradient(180deg,#f0cd7e,#c9a24a)] px-[22px] py-2.5 font-cinzel text-xs tracking-[.1em] text-[#1a1208] transition hover:brightness-[1.08]"
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
      bg: 'rgba(224,181,82,.08)',
      border: '#e0b552',
      title: '#f0e0b0',
      body: '#a89468',
    },
    npc: {
      bg: 'rgba(91,134,196,.08)',
      border: '#5b86c4',
      title: '#cfe0f5',
      body: '#7f92ac',
    },
    monster: {
      bg: 'rgba(224,82,74,.08)',
      border: '#e0524a',
      title: '#ffd9d2',
      body: '#a98',
    },
  }[tone];

  return (
    <div
      className="flex items-start gap-3 rounded-lg px-3 py-2.5"
      style={{ background: styles.bg, borderLeft: `3px solid ${styles.border}` }}
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
