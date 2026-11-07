import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
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
      <h2 className="text-2xl font-bold text-foreground">Profilo</h2>

      <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="text-sm font-medium text-foreground">{user.email}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Nome</p>
          <p className="text-sm font-medium text-foreground">
            {profile?.full_name || 'Non impostato'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Target calorie</p>
            <p className="text-sm font-medium text-foreground">
              {profile?.daily_calorie_target ?? 2000} kcal
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target acqua</p>
            <p className="text-sm font-medium text-foreground">
              {profile?.daily_water_target ?? 10} bicchieri
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
