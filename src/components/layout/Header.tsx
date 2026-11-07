'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/client';
import { layout } from '@/i18n/messages/layout';

interface HeaderProps {
  userEmail?: string | null;
}

export function Header({ userEmail }: HeaderProps) {
  const t = useT(layout);

  return (
    <header className="border-b border-border/50 bg-card sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">💪 {t('appName')}</h1>

        {userEmail ? (
          <Button asChild variant="ghost" size="sm" aria-label={t('goToProfile')}>
            <Link href="/profile">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c1.8-3.5 5-5 8-5s6.2 1.5 8 5" />
              </svg>
              <span>{t('profile')}</span>
            </Link>
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground">🔧 {t('demoMode')}</div>
        )}
      </div>
    </header>
  );
}
