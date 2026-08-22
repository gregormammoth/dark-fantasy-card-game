'use client';

import { AttackIcon, BarrierIcon, PoisonIcon, ShieldIcon } from '@/components/EffectIcons';
import {
  TutorialBody,
  TutorialHints,
  TutorialModal,
  TutorialPoints,
  TutorialTip,
  TutorialTitle,
  TutorialTypeRow,
} from '@/components/tour/TutorialModal';
import { useTranslation } from '@/i18n/useTranslation';
import type { MessageKey } from '@/i18n/types';

export function BattleTutorialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <TutorialModal
      open={open}
      onClose={onClose}
      eyebrow={t('battleTutorial.eyebrow')}
      backLabel={t('battleTutorial.back')}
      nextLabel={t('battleTutorial.next')}
      doneLabel={t('battleTutorial.letsFight')}
      stepLabel={(step) => t('battleTutorial.stepLabel', { step })}
      steps={[
        <>
          <TutorialTitle>{t('battleTutorial.step0Title')}</TutorialTitle>
          <TutorialBody>{t('battleTutorial.step0Body')}</TutorialBody>
          <TutorialTip label={t('battleTutorial.tip')}>{t('battleTutorial.step0Tip')}</TutorialTip>
        </>,
        <>
          <TutorialTitle>{t('battleTutorial.step1Title')}</TutorialTitle>
          <TutorialBody>{t('battleTutorial.step1Body')}</TutorialBody>
          <TutorialPoints
            items={[1, 2, 3].map((n) => t(`battleTutorial.step1Point${n}` as MessageKey))}
          />
        </>,
        <>
          <TutorialTitle>{t('battleTutorial.step2Title')}</TutorialTitle>
          <div className="flex flex-col gap-3">
            <TutorialTypeRow
              accent="#e0524a"
              titleColor="#ffd9d2"
              background="linear-gradient(180deg,rgba(224,82,74,.08),rgba(0,0,0,.15))"
              icon={<AttackIcon className="inline-block h-[18px] w-4" />}
              title={t('battleTutorial.typeAttack')}
              body={t('battleTutorial.typeAttackBody')}
            />
            <TutorialTypeRow
              accent="#5b86c4"
              titleColor="#cfe0f5"
              background="linear-gradient(180deg,rgba(91,134,196,.08),rgba(0,0,0,.15))"
              icon={<ShieldIcon className="inline-block h-[17px] w-[15px]" />}
              title={t('battleTutorial.typeShield')}
              body={t('battleTutorial.typeShieldBody')}
            />
            <TutorialTypeRow
              accent="#9a7ae0"
              titleColor="#e6d9f5"
              background="linear-gradient(180deg,rgba(154,122,224,.08),rgba(0,0,0,.15))"
              icon={<BarrierIcon className="inline-block h-3.5 w-[15px]" />}
              title={t('battleTutorial.typeBarrier')}
              body={t('battleTutorial.typeBarrierBody')}
            />
            <TutorialTypeRow
              accent="#6fae5a"
              titleColor="#c8ecb8"
              background="linear-gradient(180deg,rgba(111,174,90,.08),rgba(0,0,0,.15))"
              icon={<PoisonIcon className="inline-block h-[17px] w-[15px]" />}
              title={t('battleTutorial.typePoison')}
              body={t('battleTutorial.typePoisonBody')}
            />
            <TutorialTypeRow
              accent="#e0b552"
              titleColor="#f0e0b0"
              background="linear-gradient(180deg,rgba(224,181,82,.08),rgba(0,0,0,.15))"
              icon={
                <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rotate-45 border-2 border-[#e0b552]" />
              }
              title={t('battleTutorial.typeMomentum')}
              body={t('battleTutorial.typeMomentumBody')}
            />
          </div>
        </>,
        <>
          <TutorialTitle>{t('battleTutorial.step3Title')}</TutorialTitle>
          <TutorialBody>{t('battleTutorial.step3Body')}</TutorialBody>
          <TutorialHints
            items={(['A', 'B', 'C', 'D'] as const).map((key) => ({
              title: t(`battleTutorial.step3Hint${key}Title` as MessageKey),
              body: t(`battleTutorial.step3Hint${key}Body` as MessageKey),
            }))}
          />
        </>,
      ]}
    />
  );
}
