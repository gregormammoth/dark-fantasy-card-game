'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(6,4,4,.82)] p-6 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-[min(92vw,460px)] animate-[modalIn_.22s_ease-out] flex-col overflow-hidden rounded-lg"
        style={{
          border: `1px solid color-mix(in srgb, ${accent} 70%, #c9a24a)`,
          boxShadow: `0 50px 120px -30px #000, 0 0 48px color-mix(in srgb, ${accent} 35%, transparent)`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-[min(78vh,720px)] w-full">
          {isGlb(src) ? (
            <>
              <PortraitBackdrop accent={accent} />
              <div className="absolute inset-0">
                <CharacterModelCanvas src={src} controls accent={accent} />
              </div>
            </>
          ) : (
            <img src={src} alt="" className="h-full w-full object-contain" />
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-[40] flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(26,18,8,.25)] bg-[rgba(247,241,232,.92)] text-[22px] leading-none text-[#3d342c] shadow-[0_8px_20px_-8px_#000] transition hover:text-[#1a1208]"
          aria-label={t('common.close')}
        >
          ×
        </button>
      </div>
    </div>,
    document.body,
  );
}
