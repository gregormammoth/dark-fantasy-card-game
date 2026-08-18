'use client';

import Link from 'next/link';
import { SiteLanguageSelect } from '@/components/site/SiteLanguageSelect';
import { useTranslation } from '@/i18n/useTranslation';
import type { MessageKey } from '@/i18n/types';
import { legalNav, primaryNav, secondaryNav, siteConfig } from '@/lib/site';

export function SiteHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(201,162,74,.16)] bg-[rgba(10,8,7,.72)] backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-[18px] lg:px-10">
        <Link
          href="/"
          className="font-cinzel text-[19px] tracking-[0.32em] text-ember-400 transition hover:text-[#f0c979]"
        >
          {siteConfig.name.toUpperCase()}
        </Link>
        <nav className="hidden items-center gap-7 text-[11px] tracking-[0.16em] text-[#c7bba9] xl:flex">
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#f0c979]">
              {t(`site.nav.${item.key}` as MessageKey).toUpperCase()}
            </Link>
          ))}
          {secondaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#5b5148] transition hover:text-[#c7bba9]"
            >
              {t(`site.nav.${item.key}` as MessageKey).toUpperCase()}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <SiteLanguageSelect compact />
          <Link
            href="/play"
            className="rounded-lg border border-[rgba(224,181,82,.55)] bg-[linear-gradient(180deg,rgba(224,181,82,.16),rgba(90,68,19,.22))] px-5 py-2.5 font-cinzel text-[11px] tracking-[0.2em] text-[#f3e2d6] transition hover:brightness-125"
          >
            {t('site.enter')}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-[rgba(201,162,74,.14)]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-6 py-9 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p className="font-cinzel text-sm tracking-[0.28em] text-ember-400">
          {siteConfig.name.toUpperCase()}
        </p>
        <div className="flex flex-wrap gap-x-[22px] gap-y-2 text-xs text-[#8a7f72]">
          {[...primaryNav.slice(0, 6), ...legalNav].map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#f0c979]">
              {t(`site.nav.${item.key}` as MessageKey)}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
