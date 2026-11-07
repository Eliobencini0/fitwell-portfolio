import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DaySelector } from '@/components/dashboard/DaySelector';
import { CalorieBalance } from '@/components/dashboard/CalorieBalance';
import { HydrationCompact } from '@/components/dashboard/HydrationCompact';
import { ActivitySection } from '@/components/dashboard/ActivitySection';
import { isValidYmd, todayYmd } from '@/lib/date';
import { getLocale, getT } from '@/i18n/server';
import { dateLocaleTags } from '@/i18n/config';
import { dashboard as messages } from '@/i18n/messages/dashboard';

interface DashboardPageProps {
  searchParams?: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const fallbackDate = todayYmd();
  const selectedDate = isValidYmd(params?.date) ? params.date : fallbackDate;
  const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
  const todayAtMidnight = new Date(`${fallbackDate}T00:00:00`);
  const dayDiff = Math.round(
    (selectedDateObj.getTime() - todayAtMidnight.getTime()) / 86400000
  );

  const locale = await getLocale();
  const t = await getT(messages);
  const tag = dateLocaleTags[locale];
  const weekday = selectedDateObj.toLocaleDateString(tag, { weekday: 'long' });
  const dayPrefix =
    dayDiff === 0
      ? t('today')
      : dayDiff === 1
      ? t('tomorrow')
      : weekday.charAt(0).toLocaleUpperCase(tag) + weekday.slice(1);
  const formattedDate = `${selectedDateObj.getDate()} ${selectedDateObj.toLocaleDateString(tag, {
    month: 'short',
  })} ${selectedDateObj.getFullYear()}`;
  const headingText = `${dayPrefix} ${formattedDate}`;

  // Fetch today's data
  const [activitiesRes, hydrationRes, profileRes] = await Promise.all([
    supabase
      .from('daily_activities')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', selectedDate)
      .order('order_index'),
    supabase
      .from('hydration_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', selectedDate)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  if (activitiesRes.error) console.error('daily_activities query failed', activitiesRes.error);
  const activities = activitiesRes.data || [];
  const hydration = hydrationRes.data;
  const profile = profileRes.data;

  // Calculate calories from COMPLETED activities only
  const caloriesConsumed = activities
    .filter(a => a.calories > 0 && a.completed)
    .reduce((sum, a) => sum + a.calories, 0);

  const caloriesBurned = activities
    .filter(a => a.calories < 0 && a.completed)
    .reduce((sum, a) => sum + Math.abs(a.calories), 0);

  // Aggregate macros from COMPLETED meal activities
  const macrosConsumed = activities
    .filter(a => a.activity_type === 'meal' && a.completed)
    .reduce(
      (acc, activity) => ({
        carbs: acc.carbs + (Number(activity.carbs) || 0),
        protein: acc.protein + (Number(activity.protein) || 0),
        fats: acc.fats + (Number(activity.fats) || 0),
      }),
      { carbs: 0, protein: 0, fats: 0 }
    );

  // Calculate macro targets based on profile percentages
  const calorieTarget = profile?.daily_calorie_target || 2000;
  const carbsPercentage = profile?.macro_carbs_percentage || 50;
  const proteinPercentage = profile?.macro_protein_percentage || 30;
  const fatsPercentage = profile?.macro_fats_percentage || 20;

  // Convert percentages to grams
  // 1g carbs = 4 kcal, 1g protein = 4 kcal, 1g fats = 9 kcal
  const macrosTarget = {
    carbs: (calorieTarget * (carbsPercentage / 100)) / 4,
    protein: (calorieTarget * (proteinPercentage / 100)) / 4,
    fats: (calorieTarget * (fatsPercentage / 100)) / 9,
  };

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-xl font-bold text-foreground">
        {headingText}
      </h2>

      {/* Day Selector */}
      <DaySelector currentDate={selectedDate} />

      {/* Calorie Balance with Macros */}
      <CalorieBalance
        consumed={caloriesConsumed}
        burned={caloriesBurned}
        target={calorieTarget}
        macrosConsumed={macrosConsumed}
        macrosTarget={macrosTarget}
      />

      {/* Hydration Compact */}
      <HydrationCompact
        glasses={hydration?.glasses || 0}
        target={hydration?.target || profile?.daily_water_target || 10}
        date={selectedDate}
      />

      {/* Activity Section with Tabs and List */}
      <ActivitySection activities={activities} date={selectedDate} />
    </div>
  );
}
