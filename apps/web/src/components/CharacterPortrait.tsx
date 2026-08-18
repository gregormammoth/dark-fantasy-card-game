'use client';

import dynamic from 'next/dynamic';
import { useState, type CSSProperties } from 'react';
import { CharacterPreviewModal } from '@/components/CharacterPreviewModal';
import { useTranslation } from '@/i18n/useTranslation';

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
}: {
  src: string;
  alt: string;
  controls?: boolean;
}) {
  if (isGlb(src)) {
    return <CharacterModelCanvas src={src} controls={controls} />;
  }
  return <img src={src} alt={alt} className="h-full w-full object-contain" />;
}

export function CharacterPortrait({
  src,
  alt = '',
  className,
  style,
  expandable = true,
  onPreview,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  expandable?: boolean;
  onPreview?: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const frame = (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={style}>
      {expandable ? (
        <button
          type="button"
          onClick={() => {
            onPreview?.();
            setOpen(true);
          }}
          className="absolute inset-0 cursor-zoom-in"
          aria-label={t('character.viewFigure')}
        >
          <PortraitMedia src={src} alt={alt} />
        </button>
      ) : (
        <div className="absolute inset-0">
          <PortraitMedia src={src} alt={alt} />
        </div>
      )}
    </div>
  );

  return (
    <>
      {frame}
      {open ? <CharacterPreviewModal src={src} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
