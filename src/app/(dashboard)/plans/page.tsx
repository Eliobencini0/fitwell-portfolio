import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import { plans } from '@/i18n/messages/plans';
import type {
  UserGoal,
  MealPlan,
  WorkoutPlan,
  Supplement,
  BodyMeasurement,
  Profile
} from '@/types';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT(plans);
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function PlansPage() {
  const t = await getT(plans);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Parallel data fetching for optimal performance
  const [goalRes, mealPlanRes, workoutPlanRes, supplementsRes, measurementRes, profileRes] = await Promise.all([
    supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single(),
    supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single(),
    supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single(),
    supabase
      .from('supplements')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('priority', { ascending: true }),
    supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
  ]);

  // Error handling
  if (goalRes.error) console.error('Failed to fetch user_goals:', goalRes.error);
  if (mealPlanRes.error) console.error('Failed to fetch meal_plans:', mealPlanRes.error);
  if (workoutPlanRes.error) console.error('Failed to fetch workout_plans:', workoutPlanRes.error);
  if (supplementsRes.error) console.error('Failed to fetch supplements:', supplementsRes.error);
  if (measurementRes.error) console.error('Failed to fetch body_measurements:', measurementRes.error);
  if (profileRes.error) console.error('Failed to fetch profiles:', profileRes.error);

  const goal = goalRes.data as UserGoal | null;
  const mealPlan = mealPlanRes.data as MealPlan | null;
  const workoutPlan = workoutPlanRes.data as WorkoutPlan | null;
  const supplements = (supplementsRes.data as Supplement[]) || [];
  const latestMeasurement = measurementRes.data as BodyMeasurement | null;
  const profile = profileRes.data as Profile | null;

  // Helper function to get goal type label
  const getGoalTypeLabel = (goalType: string) => {
    const labels: Record<string, string> = {
      weight_loss: t('goalWeightLoss'),
      muscle_gain: t('goalMuscleGain'),
      maintenance: t('goalMaintenance'),
      recomp: t('goalRecomp'),
    };
    return labels[goalType] || goalType;
  };

  // Helper function to get priority badge
  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      essential: { label: t('priorityEssential'), className: 'bg-success/10 text-success' },
      recommended: { label: t('priorityRecommended'), className: 'bg-primary/10 text-primary' },
      optional: { label: t('priorityOptional'), className: 'bg-muted text-muted-foreground' },
    };
    return badges[priority] || badges.optional;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* User Goal Section */}
      {goal ? (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
              <span role="img" aria-label={t('goalAlt')}>🎯</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{t('currentGoal')}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {getGoalTypeLabel(goal.goal_type)}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {goal.target_weight && (
                  <div>
                    <span className="text-muted-foreground">{t('targetWeight')}</span>
                    <span className="ml-2 font-medium">{goal.target_weight} kg</span>
                  </div>
                )}
                {goal.weekly_weight_change && (
                  <div>
                    <span className="text-muted-foreground">{t('weeklyGoal')}</span>
                    <span className="ml-2 font-medium">
                      {goal.weekly_weight_change > 0 ? '+' : ''}
                      {goal.weekly_weight_change} kg
                    </span>
                  </div>
                )}
              </div>
              {goal.notes && (
                <p className="mt-3 text-xs text-muted-foreground italic">
                  {goal.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg p-6 border border-border text-center">
          <div className="text-4xl mb-4">
            <span role="img" aria-label={t('goalAlt')}>🎯</span>
          </div>
          <h3 className="font-semibold mb-2">{t('noGoalTitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('noGoalBody')}
          </p>
        </div>
      )}

      {/* Current Stats */}
      {latestMeasurement && (
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span role="img" aria-label={t('currentStatsAlt')} className="text-xl">📊</span>
            {t('currentStats')}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {latestMeasurement.weight && (
              <div>
                <div className="text-muted-foreground mb-1">{t('weight')}</div>
                <div className="text-lg font-semibold">{latestMeasurement.weight} kg</div>
              </div>
            )}
            {latestMeasurement.body_fat_percentage && (
              <div>
                <div className="text-muted-foreground mb-1">{t('bodyFat')}</div>
                <div className="text-lg font-semibold">{latestMeasurement.body_fat_percentage}%</div>
              </div>
            )}
            {latestMeasurement.muscle_mass && (
              <div>
                <div className="text-muted-foreground mb-1">{t('muscleMass')}</div>
                <div className="text-lg font-semibold">{latestMeasurement.muscle_mass} kg</div>
              </div>
            )}
            {latestMeasurement.visceral_fat && (
              <div>
                <div className="text-muted-foreground mb-1">{t('visceralFat')}</div>
                <div className="text-lg font-semibold">{latestMeasurement.visceral_fat}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meal Plan Section */}
      {mealPlan ? (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-2xl">
              <span role="img" aria-label={t('mealPlanAlt')}>🥗</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{mealPlan.plan_name}</h3>
              {mealPlan.fasting_protocol && (
                <p className="text-sm text-muted-foreground">
                  {t('protocol', { protocol: mealPlan.fasting_protocol })}
                </p>
              )}
            </div>
          </div>

          {mealPlan.meal_timing && mealPlan.meal_timing.length > 0 && (
            <div className="space-y-2">
              {mealPlan.meal_timing.map((meal, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{meal.name}</div>
                    <div className="text-xs text-muted-foreground">{meal.example}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">{meal.time}</div>
                    <div className="text-xs text-muted-foreground">{meal.kcal} kcal</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg p-6 border border-border text-center">
          <div className="text-4xl mb-4">
            <span role="img" aria-label={t('mealPlanAlt')}>🥗</span>
          </div>
          <h3 className="font-semibold mb-2">{t('noMealTitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('noMealBody')}
          </p>
        </div>
      )}

      {/* Workout Plan Section */}
      {workoutPlan ? (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center text-2xl">
              <span role="img" aria-label={t('workoutAlt')}>💪</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{workoutPlan.plan_name}</h3>
              <p className="text-sm text-muted-foreground">
                {t('workoutsPerWeek', { count: workoutPlan.weekly_schedule?.length || 0 })}
              </p>
            </div>
          </div>

          {workoutPlan.weekly_schedule && workoutPlan.weekly_schedule.length > 0 && (
            <div className="space-y-2">
              {workoutPlan.weekly_schedule.map((day, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{day.day}</div>
                    <div className="text-xs text-muted-foreground">{day.focus}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">{day.time}</div>
                    <div className="text-xs text-muted-foreground">
                      {t('minutes', { count: day.duration })} • {day.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg p-6 border border-border text-center">
          <div className="text-4xl mb-4">
            <span role="img" aria-label={t('workoutAlt')}>💪</span>
          </div>
          <h3 className="font-semibold mb-2">{t('noWorkoutTitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('noWorkoutBody')}
          </p>
        </div>
      )}

      {/* Supplements Section */}
      {supplements.length > 0 ? (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center text-2xl">
              <span role="img" aria-label={t('supplementsAlt')}>💊</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{t('supplementStack')}</h3>
              <p className="text-sm text-muted-foreground">
                {supplements.length === 1
                  ? t('activeSupplementsOne', { count: supplements.length })
                  : t('activeSupplementsMany', { count: supplements.length })}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {supplements.map((supplement) => {
              const badge = getPriorityBadge(supplement.priority);
              return (
                <div key={supplement.id} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{supplement.supplement_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {supplement.dosage} • {supplement.timing}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg p-6 border border-border text-center">
          <div className="text-4xl mb-4">
            <span role="img" aria-label={t('supplementsAlt')}>💊</span>
          </div>
          <h3 className="font-semibold mb-2">{t('noSupplementsTitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('noSupplementsBody')}
          </p>
        </div>
      )}

      {/* Calorie Target Summary */}
      {profile && (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span role="img" aria-label={t('calorieTargetAlt')} className="text-xl">🔥</span>
            {t('dailyTarget')}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">{t('calories')}</div>
              <div className="text-lg font-semibold text-primary">
                {profile.daily_calorie_target} kcal
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">{t('water')}</div>
              <div className="text-lg font-semibold text-primary">
                {t('glasses', { count: profile.daily_water_target })}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">{t('carbs')}</div>
              <div className="text-sm font-medium">
                {profile.macro_carbs_percentage}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">{t('protein')}</div>
              <div className="text-sm font-medium">
                {profile.macro_protein_percentage}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">{t('fats')}</div>
              <div className="text-sm font-medium">
                {profile.macro_fats_percentage}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
