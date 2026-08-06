import type { Locale } from './types';
import { LOCALE_STORAGE_KEY, LOCALES } from './types';

function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return 'en';
  }
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const tag of languages) {
    const normalized = tag.toLowerCase();
    if (normalized.startsWith('ru')) {
      return 'ru';
    }
    if (normalized.startsWith('sr')) {
      return 'sr';
    }
  }
  return 'en';
}

export function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isLocale(stored)) {
      return stored;
    }
  } catch {
    return null;
  }
  return null;
}

export function resolveInitialLocale(): Locale {
  return readStoredLocale() ?? detectBrowserLocale();
}

export function persistLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    return;
  }
}
