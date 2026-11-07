export const locales = ['en', 'it', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  es: 'Español',
};

/** BCP 47 tags for Intl and date-fns formatting. */
export const dateLocaleTags: Record<Locale, string> = {
  en: 'en-GB',
  it: 'it-IT',
  es: 'es-ES',
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
