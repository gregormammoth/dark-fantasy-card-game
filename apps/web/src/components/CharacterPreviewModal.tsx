'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';

const CharacterModelCanvas = dynamic(
  () => import('./CharacterModelCanvas').then((mod) => mod.CharacterModelCanvas),
  { ssr: false },
);

function isGlb(src: string) {
  return src.endsWith('.glb') || src.endsWith('.gltf');
}

export function CharacterPreviewModal({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[108] flex animate-[modalIn_.22s_ease-out] items-center justify-center bg-[rgba(6,4,4,.82)] p-6 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-[min(92vw,420px)] flex-col overflow-hidden rounded-lg border border-[rgba(201,162,74,.28)] bg-[linear-gradient(180deg,#161110,#0d0a09)] shadow-[0_50px_120px_-30px_#000]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-[22px] leading-none text-[#8a7f72] transition hover:text-[#e8ddcf]"
          aria-label={t('common.close')}
        >
          ×
        </button>
        <div className="h-[min(82vh,720px)] w-full bg-[#120908]">
          {isGlb(src) ? (
            <CharacterModelCanvas src={src} controls />
          ) : (
            <img src={src} alt="" className="h-full w-full object-contain" />
          )}
        </div>
      </div>
    </div>
  );
}
