import type { Locale } from './config';

type Params = Record<string, string | number>;

/**
 * Declare the messages of one area. English defines the keys;
 * Italian and Spanish must provide exactly the same keys (checked by TypeScript).
 * Use {name} placeholders for values.
 */
export function defineMessages<const T extends Record<string, string>>(messages: {
  en: T;
  it: Record<keyof T & string, string>;
  es: Record<keyof T & string, string>;
}) {
  return messages;
}

export type MessageSet<K extends string = string> = Record<Locale, Record<K, string>>;

export function translate<K extends string>(
  messages: MessageSet<K>,
  locale: Locale,
  key: K,
  params?: Params
): string {
  const template = messages[locale][key] ?? messages.en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}
