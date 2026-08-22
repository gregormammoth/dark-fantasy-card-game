'use client';

import dynamic from 'next/dynamic';
import { useState, type CSSProperties } from 'react';
import type { CardClass } from '@dark-fantasy/shared/types/card';
import { CharacterPreviewModal } from '@/components/CharacterPreviewModal';
import { PortraitBackdrop } from '@/components/PortraitBackdrop';
import { useTranslation } from '@/i18n/useTranslation';
import { getPortraitAccent } from '@/lib/cardTheme';
import { resolveCharacterModelSrc, resolveCharacterStillSrc } from '@dark-fantasy/content/portraits';

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
  media,
}: {
  src: string;
  alt: string;
  controls?: boolean;
  accent: string;
  media: 'still' | 'model';
}) {
  const stillSrc = resolveCharacterStillSrc(src);
  if (media === 'still' && stillSrc) {
    return <img src={stillSrc} alt={alt} className="h-full w-full object-contain" />;
  }
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
  media = 'model',
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  expandable?: boolean;
  classId?: CardClass;
  onPreview?: () => void;
  media?: 'still' | 'model';
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const modelSrc = resolveCharacterModelSrc(src);
  const accent = getPortraitAccent(modelSrc, classId);
  const showBackdrop = media === 'model' && isGlb(modelSrc);

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
          <PortraitMedia src={modelSrc} alt={alt} accent={accent} media={media} />
        </button>
      ) : (
        <div className="absolute inset-0 z-[1]">
          <PortraitMedia src={modelSrc} alt={alt} accent={accent} media={media} />
        </div>
      )}
    </div>
  );

  return (
    <>
      {frame}
      {open ? (
        <CharacterPreviewModal src={modelSrc} accent={accent} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
