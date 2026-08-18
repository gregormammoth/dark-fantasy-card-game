'use client';

import Link from 'next/link';
import { PageShell } from '@/components/site/PageBits';
import { SiteIndexHero } from '@/components/site/SitePageHero';
import { useTranslation } from '@/i18n/useTranslation';
import type { MessageKey } from '@/i18n/types';
import { homeClassShowcase } from '@/lib/site';

export function ClassesPageContent() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <SiteIndexHero page="classes" />
      <div className="grid gap-6 sm:grid-cols-2">
        {homeClassShowcase.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#161110,#100c0b)]"
            style={{ border: `1px solid ${item.borderColor}` }}
          >
            <div className="relative h-[200px]">
              <img src={item.image} alt="" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(12,9,8,.94))]" />
              <div
                className="absolute bottom-3.5 left-5 font-cinzel text-xl tracking-[0.06em]"
                style={{ color: item.color }}
              >
                {t(`classes.${item.id}` as MessageKey)}
              </div>
            </div>
            <div className="px-5 pt-4 pb-5">
              <p className="text-[13px] leading-relaxed text-[#a99c8d]">
                {t(`site.class.${item.id}.blurb` as MessageKey)}
              </p>
              <p className="mt-3 text-[11px] tracking-[0.12em] text-[#8a7f72]">
                {t(`site.class.${item.id}.tag` as MessageKey)}
              </p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-10">
        <Link
          href="/play"
          className="inline-block rounded-[10px] bg-[linear-gradient(180deg,#f0cd7e,#c9a24a)] px-7 py-3.5 font-cinzel text-[13px] tracking-[0.14em] text-[#1a1208] transition hover:brightness-110"
        >
          {t('site.playNow')}
        </Link>
      </div>
    </PageShell>
  );
}
