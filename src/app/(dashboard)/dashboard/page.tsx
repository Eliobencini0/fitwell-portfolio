import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DaySelector } from '@/components/dashboard/DaySelector';
import { CalorieBalance } from '@/components/dashboard/CalorieBalance';
import { HydrationCompact } from '@/components/dashboard/HydrationCompact';
import { ActivitySection } from '@/components/dashboard/ActivitySection';

interface DashboardPageProps {
  searchParams?: Promise<{ date?: string }>;
}

function isValidDateParam(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDateToYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const today = new Date();
  const fallbackDate = formatDateToYmd(today);
  const selectedDate = isValidDateParam(params?.date) ? params.date : fallbackDate;
  const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
  const todayAtMidnight = new Date(`${fallbackDate}T00:00:00`);
  const dayDiff = Math.round(
    (selectedDateObj.getTime() - todayAtMidnight.getTime()) / 86400000
  );

  const dayNames = [
    'Domenica',
    'Lunedi',
    'Martedi',
    'Mercoledi',
    'Giovedi',
    'Venerdi',
    'Sabato',
  ];
  const dayPrefix =
    dayDiff === 0
      ? 'Oggi'
      : dayDiff === 1
      ? 'Domani'
      : dayNames[selectedDateObj.getDay()];
  const formattedDate = `${selectedDateObj.getDate()} ${selectedDateObj.toLocaleDateString('it-IT', {
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
      .single(),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
  ]);

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
      {/* Date Header with Calendar Icon */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {headingText}
        </h2>
        <button className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-primary hover:bg-card/80 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
          </svg>
        </button>
      </div>

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
