'use client';

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

export function ExplorationTutorialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <TutorialModal
      open={open}
      onClose={onClose}
      eyebrow={t('explorationTutorial.eyebrow')}
      backLabel={t('explorationTutorial.back')}
      nextLabel={t('explorationTutorial.next')}
      doneLabel={t('explorationTutorial.letsGo')}
      stepLabel={(step) => t('explorationTutorial.stepLabel', { step })}
      steps={[
        <>
          <TutorialTitle>{t('explorationTutorial.step0Title')}</TutorialTitle>
          <TutorialBody>{t('explorationTutorial.step0Body')}</TutorialBody>
          <TutorialTip label={t('explorationTutorial.tip')}>{t('explorationTutorial.step0Tip')}</TutorialTip>
        </>,
        <>
          <TutorialTitle>{t('explorationTutorial.step1Title')}</TutorialTitle>
          <TutorialBody>{t('explorationTutorial.step1Body')}</TutorialBody>
          <TutorialPoints
            items={[1, 2, 3].map((n) => t(`explorationTutorial.step1Point${n}` as MessageKey))}
          />
        </>,
        <>
          <TutorialTitle>{t('explorationTutorial.step2Title')}</TutorialTitle>
          <div className="flex flex-col gap-3">
            <TutorialTypeRow
              accent="#e8c874"
              titleColor="#fff6e0"
              background="linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.15))"
              icon={<span className="mt-0.5 inline-block h-[13px] w-[13px] shrink-0 rounded-full bg-[#e0b552]" />}
              title={t('explorationTutorial.typeQuest')}
              body={t('explorationTutorial.typeQuestBody')}
            />
            <TutorialTypeRow
              accent="#5b86c4"
              titleColor="#d7e2f2"
              background="linear-gradient(180deg,rgba(74,192,255,.06),rgba(0,0,0,.15))"
              icon={<span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-full bg-[#5b86c4]" />}
              title={t('explorationTutorial.typeNpc')}
              body={t('explorationTutorial.typeNpcBody')}
            />
            <TutorialTypeRow
              accent="#d6443a"
              titleColor="#ffd9d2"
              background="linear-gradient(180deg,rgba(214,68,58,.08),rgba(0,0,0,.15))"
              icon={<span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-full bg-[#e0524a]" />}
              title={t('explorationTutorial.typeMonster')}
              body={t('explorationTutorial.typeMonsterBody')}
            />
          </div>
        </>,
        <>
          <TutorialTitle>{t('explorationTutorial.step3Title')}</TutorialTitle>
          <TutorialBody>{t('explorationTutorial.step3Body')}</TutorialBody>
          <TutorialHints
            items={(['A', 'B', 'C'] as const).map((key) => ({
              title: t(`explorationTutorial.step3Hint${key}Title` as MessageKey),
              body: t(`explorationTutorial.step3Hint${key}Body` as MessageKey),
            }))}
          />
        </>,
      ]}
    />
  );
}
