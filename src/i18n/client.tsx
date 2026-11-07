'use client';

import { createContext, useContext } from 'react';
import { defaultLocale, type Locale } from './config';
import { translate, type MessageSet } from './define';

const LocaleContext = createContext<Locale>(defaultLocale);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Client components: `const t = useT(messages); t('key', { n: 3 })`. */
export function useT<K extends string>(messages: MessageSet<K>) {
  const locale = useLocale();
  return (key: K, params?: Record<string, string | number>) =>
    translate(messages, locale, key, params);
}
