import { getTranslate } from './translate';

const DEFAULT_LOCALE =
  (typeof window === 'undefined'
    ? process.env.UI_LANG
    : document.documentElement.lang) || 'en';

export function useTranslate(locale = DEFAULT_LOCALE) {
  return getTranslate(locale);
}
