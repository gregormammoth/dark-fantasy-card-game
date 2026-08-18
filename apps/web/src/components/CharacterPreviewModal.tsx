'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { PortraitBackdrop } from '@/components/PortraitBackdrop';
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
  accent,
  onClose,
}: {
  src: string;
  accent: string;
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
        className="relative flex max-h-[90vh] w-[min(92vw,460px)] flex-col overflow-hidden rounded-lg shadow-[0_50px_120px_-30px_#000]"
        style={{
          border: `1px solid color-mix(in srgb, ${accent} 70%, #c9a24a)`,
          boxShadow: `0 50px 120px -30px #000, 0 0 48px color-mix(in srgb, ${accent} 35%, transparent)`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-[22px] leading-none text-[#3d342c] transition hover:text-[#1a1208]"
          aria-label={t('common.close')}
        >
          ×
        </button>
        <div className="relative h-[min(82vh,760px)] w-full">
          {isGlb(src) ? (
            <>
              <PortraitBackdrop accent={accent} />
              <div className="absolute inset-0 z-[1]">
                <CharacterModelCanvas src={src} controls accent={accent} />
              </div>
            </>
          ) : (
            <img src={src} alt="" className="h-full w-full object-contain" />
          )}
        </div>
      </div>
    </div>
  );
}
