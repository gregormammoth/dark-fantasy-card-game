import type { Locale, MessageKey, MessageParams, MessageTree } from './types';
import en from './messages/en.json';
import ru from './messages/ru.json';
import sr from './messages/sr.json';

const catalogs: Record<Locale, MessageTree> = {
  en: en as MessageTree,
  ru: ru as MessageTree,
  sr: sr as MessageTree,
};

function lookup(tree: MessageTree, key: string): string | undefined {
  const parts = key.split('.');
  let node: MessageTree | string | undefined = tree;
  for (const part of parts) {
    if (typeof node !== 'object' || node === null) {
      return undefined;
    }
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params?: MessageParams): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name];
    return value === undefined ? `{${name}}` : String(value);
  });
}

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: MessageParams,
): string {
  const primary = lookup(catalogs[locale], key);
  if (primary !== undefined) {
    return interpolate(primary, params);
  }
  const fallback = lookup(catalogs.en, key);
  if (fallback !== undefined) {
    return interpolate(fallback, params);
  }
  return key;
}
