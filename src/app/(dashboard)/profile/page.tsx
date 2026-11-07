import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getT } from '@/i18n/server';
import { profile as profileMessages } from '@/i18n/messages/profile';
import { LanguageSelector } from '@/components/profile/LanguageSelector';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { LogoutButton } from '@/components/profile/LogoutButton';

export default async function ProfilePage() {
  const t = await getT(profileMessages);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [profileRes, weightRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('body_measurements')
      .select('weight')
      .eq('user_id', user.id)
      .not('weight', 'is', null)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileRes.error) console.error('profiles query failed', profileRes.error);
  const profile = profileRes.data;

  const sex = profile?.sex;
  const toNumberOrNull = (value: unknown) =>
    value === null || value === undefined ? null : Number(value);

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>

      <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
        <ProfileForm
          email={user.email ?? ''}
          initial={{
            fullName: profile?.full_name ?? '',
            sex: sex === 'male' || sex === 'female' || sex === 'other' ? sex : null,
            heightCm: toNumberOrNull(profile?.height_cm),
            weightKg: toNumberOrNull(weightRes.data?.weight),
            dailyCalorieTarget: profile?.daily_calorie_target ?? 2000,
            dailyWaterTarget: profile?.daily_water_target ?? 10,
          }}
        />

        <div className="border-t border-border/50 pt-4">
          <LanguageSelector />
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
