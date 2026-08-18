'use client';

import { PageHero } from '@/components/site/PageBits';
import { useTranslation } from '@/i18n/useTranslation';
import type { MessageKey } from '@/i18n/types';

type IndexPage =
  | 'lore'
  | 'regions'
  | 'cards'
  | 'classes'
  | 'enemies'
  | 'blog'
  | 'patchNotes';

type DocPage = 'about' | 'roadmap' | 'privacy' | 'terms';

type DetailKind = 'lore' | 'region' | 'blog' | 'patch';

export function SiteIndexHero({ page }: { page: IndexPage }) {
  const { t } = useTranslation();
  return (
    <PageHero
      eyebrow={t(`site.pages.${page}.eyebrow` as MessageKey)}
      title={t(`site.pages.${page}.title` as MessageKey)}
      description={t(`site.pages.${page}.description` as MessageKey)}
    />
  );
}

export function SiteDocHero({
  page,
  title,
  description,
}: {
  page: DocPage;
  title?: string;
  description?: string;
}) {
  const { t } = useTranslation();
  const eyebrowKey = `site.pages.${page}.eyebrow` as MessageKey;
  const fallbackKey = `site.pages.${page}.fallbackTitle` as MessageKey;
  const hasEyebrow = page === 'about' || page === 'roadmap';

  return (
    <PageHero
      eyebrow={hasEyebrow ? t(eyebrowKey) : undefined}
      title={title ?? t(fallbackKey)}
      description={description}
    />
  );
}

export function SiteDetailHero({
  kind,
  title,
  description,
}: {
  kind: DetailKind;
  title: string;
  description?: string;
}) {
  const { t } = useTranslation();
  return (
    <PageHero
      eyebrow={t(`site.pages.detail.${kind}` as MessageKey)}
      title={title}
      description={description}
    />
  );
}
