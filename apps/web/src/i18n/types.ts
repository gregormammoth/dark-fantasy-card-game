export type Locale = 'en' | 'ru' | 'sr';

export const LOCALES: Locale[] = ['en', 'ru', 'sr'];

export const LOCALE_STORAGE_KEY = 'dfcg-locale-v1';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  sr: 'Srpski',
};

export type MessageParams = Record<string, string | number>;

export type TranslateFn = (key: MessageKey, params?: MessageParams) => string;

type Join<K extends string, P extends string> = `${K}.${P}`;

type MessageLeaf = string;

export type MessageTree = {
  [key: string]: MessageLeaf | MessageTree;
};

type DotPaths<T, Prefix extends string = ''> = T extends MessageLeaf
  ? Prefix extends ''
    ? never
    : Prefix
  : {
      [K in keyof T & string]: Prefix extends ''
        ? DotPaths<T[K], K> | (T[K] extends MessageLeaf ? K : never)
        : DotPaths<T[K], Join<Prefix, K>> | (T[K] extends MessageLeaf ? Join<Prefix, K> : never);
    }[keyof T & string];

import type en from './messages/en.json';

export type MessageKey = DotPaths<typeof en>;
