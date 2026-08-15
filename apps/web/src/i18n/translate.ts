import type { Locale, MessageKey, MessageParams, MessageTree } from './types';
import enUi from './messages/en.json';
import ruUi from './messages/ru.json';
import srUi from './messages/sr.json';
import enContent from './messages/content-en.json';
import ruContent from './messages/content-ru.json';
import srContent from './messages/content-sr.json';

const catalogs: Record<Locale, MessageTree> = {
  en: { ...(enUi as MessageTree), content: enContent as MessageTree },
  ru: { ...(ruUi as MessageTree), content: ruContent as MessageTree },
  sr: { ...(srUi as MessageTree), content: srContent as MessageTree },
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
