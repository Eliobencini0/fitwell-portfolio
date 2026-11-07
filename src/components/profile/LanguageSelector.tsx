'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { useLocale, useT } from '@/i18n/client';
import { setLocale } from '@/i18n/actions';
import { common } from '@/i18n/messages/common';
import { profile } from '@/i18n/messages/profile';

export function LanguageSelector() {
  const current = useLocale();
  const router = useRouter();
  const t = useT(profile);
  const tc = useT(common);
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === current) return;
    startTransition(async () => {
      try {
        await setLocale(next);
        router.refresh();
      } catch {
        toast.error(tc('genericError'));
      }
    });
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">{t('language')}</p>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={pending}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-foreground outline-none hover:bg-card/80 focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50"
        >
          {localeNames[current]}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales.map((code) => (
            <DropdownMenuItem key={code} onSelect={() => choose(code)}>
              <span className="flex-1">{localeNames[code]}</span>
              {code === current && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
