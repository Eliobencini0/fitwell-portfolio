export type ActivityType = 'meal' | 'workout' | 'meditation' | 'supplement' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';
export type WorkoutType = 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'other';

export interface MacroData {
  carbs: number;      // grammi
  protein: number;    // grammi
  fats: number;       // grammi
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  daily_calorie_target: number;
  daily_water_target: number;
  macro_carbs_percentage: number;     // default 50%
  macro_protein_percentage: number;   // default 30%
  macro_fats_percentage: number;      // default 20%
  created_at: string;
  updated_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  date: string;
  title: string;
  description: string | null;
  activity_type: ActivityType;
  calories: number;
  carbs: number;          // grammi (per meal activities)
  protein: number;        // grammi (per meal activities)
  fats: number;           // grammi (per meal activities)
  completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface HydrationLog {
  id: string;
  user_id: string;
  date: string;
  glasses: number;
  target: number;
  updated_at: string;
}

export interface Food {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quantity?: number;
  unit?: string;
}

export interface Meal {
  id: string;
  user_id: string;
  date: string;
  meal_type: MealType;
  name: string;
  foods: Food[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  notes: string | null;
  created_at: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  user_id: string;
  date: string;
  workout_type: WorkoutType;
  name: string;
  duration_minutes: number;
  calories_burned: number;
  exercises: Exercise[];
  notes: string | null;
  created_at: string;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  body_fat_percentage: number | null;
  muscle_mass: number | null;
  visceral_fat: number | null;
  water_percentage: number | null;
  notes: string | null;
  created_at: string;
}

export interface DailySummary {
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  calorieBalance: number;
  calorieTarget: number;
  macrosConsumed: MacroData;
  macrosTarget: MacroData;
  waterGlasses: number;
  waterTarget: number;
  activitiesCompleted: number;
  activitiesTotal: number;
}

// Personal Plan Feature Types
export type GoalType = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'recomp';
export type SupplementPriority = 'essential' | 'recommended' | 'optional';

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  current_weight: number | null;
  target_weight: number | null;
  weekly_weight_change: number | null;
  target_date: string | null;
  priority_1: string | null;
  priority_2: string | null;
  priority_3: string | null;
  priority_4: string | null;
  priority_5: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealTiming {
  name: string;
  time: string;
  example: string;
  kcal: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface MealPlan {
  id: string;
  user_id: string;
  plan_name: string;
  is_active: boolean;
  fasting_protocol: string | null;
  meal_timing: MealTiming[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutScheduleDay {
  day: string;
  type: string;
  time: string;
  focus: string;
  duration: number;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  plan_name: string;
  is_active: boolean;
  weekly_schedule: WorkoutScheduleDay[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplement {
  id: string;
  user_id: string;
  supplement_name: string;
  dosage: string;
  timing: string;
  priority: SupplementPriority;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
