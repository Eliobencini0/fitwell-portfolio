'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { useLocale } from '@/i18n/client';
import { setLocale } from '@/i18n/actions';
import { common } from '@/i18n/messages/common';
import { translate } from '@/i18n/define';

export function LanguageSelector() {
  const current = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === current) return;
    startTransition(async () => {
      try {
        await setLocale(next);
        router.refresh();
      } catch {
        toast.error(translate(common, current, 'genericError'));
      }
    });
  };

  return (
    <div className="flex gap-2" role="radiogroup">
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={code === current}
          disabled={pending}
          onClick={() => choose(code)}
          className={cn(
            'flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
            code === current
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border/50 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
          )}
        >
          {localeNames[code]}
        </button>
      ))}
    </div>
  );
}
