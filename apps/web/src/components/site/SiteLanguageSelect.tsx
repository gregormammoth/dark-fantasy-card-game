'use client';

import { LOCALE_LABELS, type Locale } from '@/i18n/types';
import { useTranslation } from '@/i18n/useTranslation';

export function SiteLanguageSelect({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <label className={`flex items-center gap-2 ${compact ? '' : 'flex-col items-stretch'}`}>
      <span className="sr-only">{t('site.language')}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label={t('site.language')}
        className="cursor-pointer rounded-md border border-[rgba(201,162,74,.35)] bg-[rgba(10,8,7,.88)] px-2.5 py-1.5 font-cinzel text-[10px] tracking-[.12em] text-[#e0b552] outline-none transition hover:border-[rgba(201,162,74,.7)]"
      >
        {(Object.keys(LOCALE_LABELS) as Locale[]).map((option) => (
          <option key={option} value={option} className="bg-[#12100f] text-[#e8ddcf]">
            {LOCALE_LABELS[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
