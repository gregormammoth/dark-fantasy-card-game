'use client';

import { useTranslation } from '@/i18n/useTranslation';

interface UnlockCardModalProps {
  name: string;
  className: string;
  color: string;
  borderColor: string;
  costLevels: number;
  availableLevels: number;
  afterLevels: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnlockCardModal({
  name,
  className,
  color,
  borderColor,
  costLevels,
  availableLevels,
  afterLevels,
  onConfirm,
  onCancel,
}: UnlockCardModalProps) {
  const { t } = useTranslation();
  const levelWord = costLevels === 1 ? t('unlockModal.levelWord') : t('unlockModal.levelsWord');

  return (
    <div className="fixed inset-0 z-50 flex animate-[fadeIn_.15s_ease-out] items-center justify-center bg-[rgba(6,5,4,.7)] backdrop-blur-[2px]">
      <div
        className="w-[360px] animate-[modalIn_.18s_ease-out] rounded-[14px] bg-[linear-gradient(180deg,#181211,#100c0b)] px-7 py-[26px] shadow-[0_40px_90px_-20px_#000]"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <div className="text-[10px] tracking-[.2em] text-[#8a7f72]">{t('unlockModal.unlockImproved')}</div>
        <div className="mt-1.5 font-cinzel text-[20px]" style={{ color }}>
          {name}?
        </div>
        <div className="mt-[18px] flex flex-col gap-2 text-[13px] text-[#b7ab9c]">
          <div className="flex justify-between">
            <span>{t('unlockModal.costLabel')}</span>
            <span className="text-[#e8ddcf]">
              {costLevels} {className} {levelWord}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('unlockModal.availableLabel')}</span>
            <span className="text-[#e8ddcf]">{availableLevels}</span>
          </div>
          <div className="flex justify-between border-t border-[rgba(201,162,74,.14)] pt-2">
            <span>{t('unlockModal.afterLabel')}</span>
            <span className="text-[#e0b552]">{afterLevels}</span>
          </div>
        </div>
        <div className="mt-[22px] flex gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-[10px] border border-[rgba(224,181,82,.5)] bg-[linear-gradient(180deg,rgba(224,181,82,.2),rgba(90,68,19,.3))] py-[11px] font-cinzel text-[13px] tracking-[.08em] text-[#f3e2d6] transition hover:brightness-110"
          >
            {t('unlockModal.confirm')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-[10px] border border-[rgba(201,162,74,.24)] bg-transparent py-[11px] font-cinzel text-[13px] tracking-[.08em] text-[#8a7f72] transition hover:text-[#e8ddcf]"
          >
            {t('unlockModal.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
