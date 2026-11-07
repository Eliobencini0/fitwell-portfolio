'use client';

import { useT } from '@/i18n/client';
import { misc } from '@/i18n/messages/misc';

export default function PlansError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT(misc);

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('plansErrorTitle')}</h2>
        <p className="text-muted-foreground">
          {t('plansErrorSubtitle')}
        </p>
      </div>

      <div className="bg-card rounded-lg p-6 border border-destructive/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2 text-destructive">
              {t('errorDetails')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || t('unknownError')}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mb-4">
                ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border text-center">
        <h3 className="font-semibold mb-2">{t('tips')}</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>{t('tipConnection')}</li>
          <li>{t('tipReload')}</li>
          <li>{t('tipSupport')}</li>
        </ul>
      </div>
    </div>
  );
}
