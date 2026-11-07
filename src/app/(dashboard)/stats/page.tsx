import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  WeightChart,
  CaloriesChart,
  MacrosChart,
  HydrationChart,
  ProgressStats,
} from '@/components/stats';

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Calculate date ranges
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);

  const last14Days = new Date(today);
  last14Days.setDate(today.getDate() - 14);

  const last30Days = new Date(today);
  last30Days.setDate(today.getDate() - 30);

  const last90Days = new Date(today);
  last90Days.setDate(today.getDate() - 90);

  // Fetch all data in parallel
  const [
    weightData,
    activitiesLast7,
    activitiesLast30,
    hydrationData,
    profile,
    goal,
  ] = await Promise.all([
    // Weight measurements (last 90 days)
    supabase
      .from('body_measurements')
      .select('date, weight_kg')
      .eq('user_id', user.id)
      .gte('date', last90Days.toISOString().split('T')[0])
      .order('date', { ascending: true }),

    // Activities last 7 days for calories chart
    supabase
      .from('daily_activities')
      .select('date, calories, carbs, protein, fats, completed, activity_type')
      .eq('user_id', user.id)
      .gte('date', last7Days.toISOString().split('T')[0])
      .order('date', { ascending: true }),

    // Activities last 30 days for stats
    supabase
      .from('daily_activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', last30Days.toISOString().split('T')[0]),

    // Hydration last 14 days
    supabase
      .from('hydration_logs')
      .select('date, glasses, target')
      .eq('user_id', user.id)
      .gte('date', last14Days.toISOString().split('T')[0])
      .order('date', { ascending: true }),

    // Profile for targets
    supabase
      .from('profiles')
      .select('daily_calorie_target, daily_water_target')
      .eq('id', user.id)
      .single(),

    // Active goal
    supabase
      .from('user_goals')
      .select('target_weight_kg')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single(),
  ]);

  // Process weight data
  const weightChartData = weightData.data?.map((m) => ({
    date: m.date,
    weight: m.weight_kg,
  })) || [];

  // Process calories data (group by date)
  const caloriesByDate: Record<string, { consumed: number; burned: number }> = {};

  activitiesLast7.data?.forEach((activity) => {
    if (!activity.completed) return;

    if (!caloriesByDate[activity.date]) {
      caloriesByDate[activity.date] = { consumed: 0, burned: 0 };
    }

    if (activity.calories > 0) {
      caloriesByDate[activity.date].consumed += activity.calories;
    } else {
      caloriesByDate[activity.date].burned += Math.abs(activity.calories);
    }
  });

  const caloriesChartData = Object.entries(caloriesByDate).map(([date, data]) => ({
    date,
    consumed: data.consumed,
    burned: data.burned,
    target: profile.data?.daily_calorie_target || 2000,
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Process macros data (sum last 7 days)
  const macrosTotal = activitiesLast7.data
    ?.filter((a) => a.completed && a.activity_type === 'meal')
    .reduce(
      (acc, activity) => ({
        carbs: acc.carbs + (activity.carbs || 0),
        protein: acc.protein + (activity.protein || 0),
        fats: acc.fats + (activity.fats || 0),
      }),
      { carbs: 0, protein: 0, fats: 0 }
    ) || { carbs: 0, protein: 0, fats: 0 };

  // Process hydration data
  const hydrationChartData = hydrationData.data?.map((h) => ({
    date: h.date,
    glasses: h.glasses,
    target: h.target,
  })) || [];

  // Calculate stats
  const totalActivities = activitiesLast30.data?.length || 0;
  const completedActivities = activitiesLast30.data?.filter((a) => a.completed).length || 0;
  const completionRate = totalActivities > 0
    ? Math.round((completedActivities / totalActivities) * 100)
    : 0;

  const avgCalories = activitiesLast30.data
    ?.filter((a) => a.completed && a.calories > 0)
    .reduce((sum, a) => sum + a.calories, 0) || 0;
  const uniqueDates = new Set(activitiesLast30.data?.map((a) => a.date) || []);
  const avgCaloriesPerDay = uniqueDates.size > 0 ? avgCalories / uniqueDates.size : 0;

  const totalWorkouts = activitiesLast30.data
    ?.filter((a) => a.completed && a.activity_type === 'workout').length || 0;

  const avgHydration = hydrationChartData.length > 0
    ? hydrationChartData.reduce((sum, h) => sum + h.glasses, 0) / hydrationChartData.length
    : 0;

  const currentWeight = weightChartData.length > 0
    ? weightChartData[weightChartData.length - 1].weight
    : null;

  const weightChange = weightChartData.length >= 2
    ? weightChartData[weightChartData.length - 1].weight - weightChartData[0].weight
    : null;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">📊 Statistiche</h2>
        <p className="text-muted-foreground text-sm">
          Visualizza i tuoi progressi nel tempo
        </p>
      </div>

      {/* KPI Cards */}
      <ProgressStats
        avgCalories={avgCaloriesPerDay}
        totalWorkouts={totalWorkouts}
        avgHydration={avgHydration}
        currentWeight={currentWeight}
        weightChange={weightChange}
        completionRate={completionRate}
      />

      {/* Charts */}
      <div className="space-y-6">
        {/* Weight Chart */}
        <WeightChart
          data={weightChartData}
          targetWeight={goal.data?.target_weight_kg || undefined}
        />

        {/* Calories Chart */}
        <CaloriesChart data={caloriesChartData} />

        {/* Macros & Hydration (2 columns on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MacrosChart data={macrosTotal} />
          <HydrationChart data={hydrationChartData} />
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-muted/30 rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground">
          💡 I grafici si aggiornano automaticamente man mano che aggiungi dati.
          <br />
          Continua a tracciare le tue attività per vedere i progressi nel tempo!
        </p>
      </div>
    </div>
  );
}
