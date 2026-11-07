import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getT } from '@/i18n/server';
import { profile as profileMessages } from '@/i18n/messages/profile';
import { LanguageSelector } from '@/components/profile/LanguageSelector';

export default async function ProfilePage() {
  const t = await getT(profileMessages);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, daily_calorie_target, daily_water_target')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>

      <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">{t('language')}</h3>
        <LanguageSelector />
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">{t('email')}</p>
          <p className="text-sm font-medium text-foreground">{user.email}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">{t('name')}</p>
          <p className="text-sm font-medium text-foreground">
            {profile?.full_name || t('notSet')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t('calorieTarget')}</p>
            <p className="text-sm font-medium text-foreground">
              {t('kcal', { value: profile?.daily_calorie_target ?? 2000 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('waterTarget')}</p>
            <p className="text-sm font-medium text-foreground">
              {t('glasses', { value: profile?.daily_water_target ?? 10 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
