import { cookies } from 'next/headers';
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from './config';
import { translate, type MessageSet } from './define';

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

/** Server components: `const t = await getT(messages); t('key', { n: 3 })`. */
export async function getT<K extends string>(messages: MessageSet<K>) {
  const locale = await getLocale();
  return (key: K, params?: Record<string, string | number>) =>
    translate(messages, locale, key, params);
}
