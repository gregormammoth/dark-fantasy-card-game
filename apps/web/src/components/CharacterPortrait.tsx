'use client';

import dynamic from 'next/dynamic';
import { useState, type CSSProperties } from 'react';
import type { CardClass } from '@dark-fantasy/shared/types/card';
import { CharacterPreviewModal } from '@/components/CharacterPreviewModal';
import { PortraitBackdrop } from '@/components/PortraitBackdrop';
import { useTranslation } from '@/i18n/useTranslation';
import { getPortraitAccent } from '@/lib/cardTheme';

const CharacterModelCanvas = dynamic(
  () => import('./CharacterModelCanvas').then((mod) => mod.CharacterModelCanvas),
  { ssr: false },
);

function isGlb(src: string) {
  return src.endsWith('.glb') || src.endsWith('.gltf');
}

function PortraitMedia({
  src,
  alt,
  controls,
  accent,
}: {
  src: string;
  alt: string;
  controls?: boolean;
  accent: string;
}) {
  if (isGlb(src)) {
    return <CharacterModelCanvas src={src} controls={controls} accent={accent} />;
  }
  return <img src={src} alt={alt} className="h-full w-full object-contain" />;
}

export function CharacterPortrait({
  src,
  alt = '',
  className,
  style,
  expandable = true,
  classId,
  onPreview,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  expandable?: boolean;
  classId?: CardClass;
  onPreview?: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const accent = getPortraitAccent(src, classId);
  const showBackdrop = isGlb(src);

  const frame = (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={style}>
      {showBackdrop ? <PortraitBackdrop accent={accent} /> : null}
      {expandable ? (
        <button
          type="button"
          onClick={() => {
            onPreview?.();
            setOpen(true);
          }}
          className="absolute inset-0 z-[1] cursor-zoom-in"
          aria-label={t('character.viewFigure')}
        >
          <PortraitMedia src={src} alt={alt} accent={accent} />
        </button>
      ) : (
        <div className="absolute inset-0 z-[1]">
          <PortraitMedia src={src} alt={alt} accent={accent} />
        </div>
      )}
    </div>
  );

  return (
    <>
      {frame}
      {open ? (
        <CharacterPreviewModal src={src} accent={accent} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
