import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HistoryFilters } from '@/components/history/HistoryFilters';
import { ActivityCard } from '@/components/history/ActivityCard';
import { StatsCard } from '@/components/history/StatsCard';
import { Pagination } from '@/components/history/Pagination';
import { DailyActivity } from '@/types';

interface HistoryPageProps {
  searchParams?: Promise<{
    range?: 'week' | 'month' | 'all';
    type?: 'all' | 'meal' | 'workout' | 'other';
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const range = params?.range || 'week';
  const typeFilter = params?.type || 'all';
  const currentPage = parseInt(params?.page || '1', 10);

  // Calculate date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let startDate: Date;

  switch (range) {
    case 'week':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      break;
    case 'all':
    default:
      startDate = new Date('2020-01-01'); // Far past date
      break;
  }

  const startDateStr = startDate.toISOString().split('T')[0];

  // Build query
  let query = supabase
    .from('daily_activities')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .gte('date', startDateStr)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  // Apply activity type filter
  if (typeFilter !== 'all') {
    if (typeFilter === 'other') {
      query = query.in('activity_type', ['meditation', 'supplement', 'other']);
    } else {
      query = query.eq('activity_type', typeFilter);
    }
  }

  // Apply pagination
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data: activities, error, count } = await query;

  if (error) {
    console.error('Error fetching activities:', error);
  }

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Calculate stats (fetch all for stats without pagination)
  let statsQuery = supabase
    .from('daily_activities')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDateStr);

  if (typeFilter !== 'all') {
    if (typeFilter === 'other') {
      statsQuery = statsQuery.in('activity_type', ['meditation', 'supplement', 'other']);
    } else {
      statsQuery = statsQuery.eq('activity_type', typeFilter);
    }
  }

  const { data: allActivities } = await statsQuery;

  const totalActivities = allActivities?.length || 0;
  const completedActivities = allActivities?.filter((a) => a.completed).length || 0;

  const totalCaloriesConsumed = allActivities
    ?.filter((a) => a.completed && a.calories > 0)
    .reduce((sum, a) => sum + a.calories, 0) || 0;

  const totalCaloriesBurned = allActivities
    ?.filter((a) => a.completed && a.calories < 0)
    .reduce((sum, a) => sum + Math.abs(a.calories), 0) || 0;

  // Calculate average daily calories
  const uniqueDates = new Set(allActivities?.map((a) => a.date) || []);
  const dayCount = Math.max(uniqueDates.size, 1);
  const avgDailyCalories = totalCaloriesConsumed / dayCount;

  // Group activities by date for better visualization
  const activitiesByDate = (activities || []).reduce((acc, activity) => {
    const date = activity.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, DailyActivity[]>);

  const sortedDates = Object.keys(activitiesByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">📅 Storico Attività</h2>
        <p className="text-muted-foreground text-sm">
          Cronologia completa delle tue attività
        </p>
      </div>

      {/* Filters */}
      <HistoryFilters />

      {/* Stats Summary */}
      {totalActivities > 0 && (
        <StatsCard
          totalActivities={totalActivities}
          completedActivities={completedActivities}
          totalCaloriesConsumed={totalCaloriesConsumed}
          totalCaloriesBurned={totalCaloriesBurned}
          avgDailyCalories={avgDailyCalories}
        />
      )}

      {/* Activities List */}
      {activities && activities.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('it-IT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <h3 className="text-sm font-medium text-muted-foreground capitalize">
                    {formattedDate}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-2">
                  {activitiesByDate[date].map((activity: DailyActivity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
          />
        </div>
      ) : (
        <div className="bg-card rounded-lg p-8 border border-border text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-semibold mb-2">Nessuna Attività</h3>
          <p className="text-sm text-muted-foreground">
            Non ci sono attività da visualizzare per questo periodo.
            <br />
            Vai alla dashboard per aggiungere nuove attività!
          </p>
        </div>
      )}
    </div>
  );
}
