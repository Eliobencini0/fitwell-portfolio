import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getT } from '@/i18n/server';
import { misc } from '@/i18n/messages/misc';
import { auth } from '@/i18n/messages/auth';

export default async function Home() {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const isSupabaseConfigured =
    supabaseUrl && !supabaseUrl.includes('placeholder');

  if (!isSupabaseConfigured) {
    // Show a setup page if Supabase is not configured
    const t = await getT(misc);
    const tAuth = await getT(auth);
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-4xl">
            💪
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {tAuth('appName')}
          </h1>
          <div className="bg-card rounded-lg p-8 border border-border space-y-4 text-left">
            <h2 className="text-xl font-semibold text-primary">
              🔧 {t('setupTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('setupIntro')}
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>{t('setupStep1')} <a href="https://supabase.com/dashboard" target="_blank" className="text-primary hover:underline">supabase.com/dashboard</a></li>
              <li>{t('setupStep2')}</li>
              <li>{t('setupStep3')}</li>
              <li>{t('setupStep4')}</li>
              <li>{t('setupStep5Before')} <code className="bg-background px-2 py-1 rounded">.env.local</code></li>
              <li>{t('setupStep6')}</li>
              <li>{t('setupStep7')}</li>
            </ol>
            <div className="mt-6 p-4 bg-background rounded border border-border">
              <p className="text-xs font-mono text-muted-foreground mb-2">
                .env.local:
              </p>
              <code className="text-xs">
                {t('setupEnvUrl')}<br />
                {t('setupEnvKey')}
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
