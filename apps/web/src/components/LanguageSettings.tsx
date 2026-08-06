'use client';

import { LOCALE_LABELS, type Locale } from '@/i18n/types';
import { useTranslation } from '@/i18n/useTranslation';

export function LanguageSettings() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 rounded-[10px] border border-[rgba(201,162,74,.28)] bg-[rgba(10,8,7,.88)] px-3 py-2.5 text-[#e8ddcf]">
      <span className="font-cinzel text-[10px] tracking-[.18em] text-[#c9a24a]">
        {t('settings.language')}
      </span>
      <div className="grid grid-cols-1 gap-1.5">
        {(Object.keys(LOCALE_LABELS) as Locale[]).map((option) => {
          const selected = locale === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setLocale(option)}
              className="rounded-md border px-2.5 py-1.5 text-left text-[11px] tracking-wide transition"
              style={{
                borderColor: selected ? 'rgba(201,162,74,.7)' : 'rgba(201,162,74,.25)',
                background: selected ? 'rgba(224,181,82,.14)' : 'transparent',
                color: selected ? '#e0b552' : '#8a7f72',
              }}
            >
              {LOCALE_LABELS[option]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
