import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type {
  UserGoal,
  MealPlan,
  WorkoutPlan,
  Supplement,
  BodyMeasurement,
  Profile
} from '@/types';

export const metadata: Metadata = {
  title: 'Piano Personalizzato | Fitwell',
  description: 'Il tuo programma completo per raggiungere i tuoi obiettivi di fitness'
};

export default async function PlansPage() {
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
      weight_loss: 'Perdita Peso',
      muscle_gain: 'Aumento Massa',
      maintenance: 'Mantenimento',
      recomp: 'Ricomposizione',
    };
    return labels[goalType] || goalType;
  };

  // Helper function to get priority badge
  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      essential: { label: 'Essenziale', className: 'bg-success/10 text-success' },
      recommended: { label: 'Consigliato', className: 'bg-primary/10 text-primary' },
      optional: { label: 'Opzionale', className: 'bg-muted text-muted-foreground' },
    };
    return badges[priority] || badges.optional;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Piano Personalizzato</h2>
        <p className="text-muted-foreground">
          Il tuo programma completo per raggiungere i tuoi obiettivi
        </p>
      </div>

      {/* User Goal Section */}
      {goal ? (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
              <span role="img" aria-label="Obiettivo">🎯</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Obiettivo Attuale</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {getGoalTypeLabel(goal.goal_type)}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {goal.target_weight && (
                  <div>
                    <span className="text-muted-foreground">Peso target:</span>
                    <span className="ml-2 font-medium">{goal.target_weight} kg</span>
                  </div>
                )}
                {goal.weekly_weight_change && (
                  <div>
                    <span className="text-muted-foreground">Obiettivo settimanale:</span>
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
            <span role="img" aria-label="Obiettivo">🎯</span>
          </div>
          <h3 className="font-semibold mb-2">Nessun Obiettivo Attivo</h3>
          <p className="text-sm text-muted-foreground">
            Configura il tuo obiettivo per iniziare
          </p>
        </div>
      )}

      {/* Current Stats */}
      {latestMeasurement && (
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span role="img" aria-label="Statistiche" className="text-xl">📊</span>
            Statistiche Attuali
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {latestMeasurement.weight && (
              <div>
                <div className="text-muted-foreground mb-1">Peso</div>
                <div className="text-lg font-semibold">{latestMeasurement.weight} kg</div>
              </div>
            )}
            {latestMeasurement.body_fat_percentage && (
              <div>
                <div className="text-muted-foreground mb-1">Grasso Corporeo</div>
                <div className="text-lg font-semibold">{latestMeasurement.body_fat_percentage}%</div>
              </div>
            )}
            {latestMeasurement.muscle_mass && (
              <div>
                <div className="text-muted-foreground mb-1">Massa Muscolare</div>
                <div className="text-lg font-semibold">{latestMeasurement.muscle_mass} kg</div>
              </div>
            )}
            {latestMeasurement.visceral_fat && (
              <div>
                <div className="text-muted-foreground mb-1">Grasso Viscerale</div>
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
              <span role="img" aria-label="Piano pasti">🥗</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{mealPlan.plan_name}</h3>
              {mealPlan.fasting_protocol && (
                <p className="text-sm text-muted-foreground">
                  Protocollo: {mealPlan.fasting_protocol}
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
            <span role="img" aria-label="Piano pasti">🥗</span>
          </div>
          <h3 className="font-semibold mb-2">Nessun Piano Alimentare</h3>
          <p className="text-sm text-muted-foreground">
            Crea il tuo piano alimentare personalizzato
          </p>
        </div>
      )}

      {/* Workout Plan Section */}
      {workoutPlan ? (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center text-2xl">
              <span role="img" aria-label="Allenamento">💪</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{workoutPlan.plan_name}</h3>
              <p className="text-sm text-muted-foreground">
                {workoutPlan.weekly_schedule?.length || 0} allenamenti settimanali
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
                      {day.duration} min • {day.type}
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
            <span role="img" aria-label="Allenamento">💪</span>
          </div>
          <h3 className="font-semibold mb-2">Nessun Piano di Allenamento</h3>
          <p className="text-sm text-muted-foreground">
            Crea il tuo programma di allenamento
          </p>
        </div>
      )}

      {/* Supplements Section */}
      {supplements.length > 0 ? (
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center text-2xl">
              <span role="img" aria-label="Integratori">💊</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Stack Integratori</h3>
              <p className="text-sm text-muted-foreground">
                {supplements.length} {supplements.length === 1 ? 'integratore' : 'integratori'} attivi
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
            <span role="img" aria-label="Integratori">💊</span>
          </div>
          <h3 className="font-semibold mb-2">Nessun Integratore</h3>
          <p className="text-sm text-muted-foreground">
            Aggiungi integratori al tuo stack
          </p>
        </div>
      )}

      {/* Calorie Target Summary */}
      {profile && (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span role="img" aria-label="Target calorie" className="text-xl">🔥</span>
            Target Giornaliero
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Calorie</div>
              <div className="text-lg font-semibold text-primary">
                {profile.daily_calorie_target} kcal
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Acqua</div>
              <div className="text-lg font-semibold text-primary">
                {profile.daily_water_target} bicchieri
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Carboidrati</div>
              <div className="text-sm font-medium">
                {profile.macro_carbs_percentage}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Proteine</div>
              <div className="text-sm font-medium">
                {profile.macro_protein_percentage}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Grassi</div>
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
