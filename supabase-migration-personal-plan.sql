-- =====================================================
-- Migration: Personal Plan Data Structure
-- =====================================================
-- Date: 2026-03-07
-- Description: Extends the database to support
--              full personalized plans
-- =====================================================

-- =====================================================
-- 1. EXTEND PROFILES with metabolic data
-- =====================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS bmr INTEGER,  -- Basal Metabolic Rate
ADD COLUMN IF NOT EXISTS tdee_min INTEGER,  -- Total Daily Energy Expenditure
ADD COLUMN IF NOT EXISTS tdee_max INTEGER,
ADD COLUMN IF NOT EXISTS calorie_deficit INTEGER DEFAULT 300,
ADD COLUMN IF NOT EXISTS protein_per_kg NUMERIC(3,1) DEFAULT 2.0,
ADD COLUMN IF NOT EXISTS workout_time TIME DEFAULT '08:00:00';

COMMENT ON COLUMN public.profiles.bmr IS 'Basal metabolic rate (kcal/day)';
COMMENT ON COLUMN public.profiles.tdee_min IS 'Estimated minimum TDEE';
COMMENT ON COLUMN public.profiles.tdee_max IS 'Estimated maximum TDEE';
COMMENT ON COLUMN public.profiles.workout_time IS 'Preferred workout time';

-- =====================================================
-- 2. EXTEND BODY_MEASUREMENTS with missing data
-- =====================================================

ALTER TABLE public.body_measurements
ADD COLUMN IF NOT EXISTS bmi NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS visceral_fat NUMERIC(3,1),
ADD COLUMN IF NOT EXISTS bone_mineral_percentage NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS body_water_percentage NUMERIC(4,2);

COMMENT ON COLUMN public.body_measurements.bmi IS 'Body Mass Index';
COMMENT ON COLUMN public.body_measurements.visceral_fat IS 'Visceral fat (target < 7)';
COMMENT ON COLUMN public.body_measurements.bone_mineral_percentage IS 'Bone mineral percentage';
COMMENT ON COLUMN public.body_measurements.body_water_percentage IS 'Body water percentage';

-- =====================================================
-- 3. USER_GOALS TABLE (personalized goals)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('weight_loss', 'muscle_gain', 'maintenance', 'recomp')),
  target_weight_kg NUMERIC(5,2),
  target_body_fat_percentage NUMERIC(4,2),
  target_muscle_mass_kg NUMERIC(5,2),
  target_visceral_fat NUMERIC(3,1),
  deadline DATE,
  priority_1 TEXT,
  priority_2 TEXT,
  priority_3 TEXT,
  priority_4 TEXT,
  priority_5 TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, is_active)  -- only one active goal at a time
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_active
  ON public.user_goals(user_id, is_active);

-- =====================================================
-- 4. MEAL_PLANS TABLE (meal plan templates)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,  -- e.g. "Option A - Light pre-workout"
  is_active BOOLEAN DEFAULT false,
  meal_timing JSONB DEFAULT '[]'::jsonb,  -- array of {name, time, example, kcal}
  fasting_protocol TEXT,  -- e.g. "16:8", "none"
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user
  ON public.meal_plans(user_id);

COMMENT ON COLUMN public.meal_plans.meal_timing IS 'Array of meals: [{name, time, example, kcal}]';

-- Example meal_timing JSONB:
-- [
--   {"name": "Pre-workout", "time": "07:00", "example": "1 banana + coffee", "kcal": 100},
--   {"name": "Breakfast", "time": "09:30", "example": "3 eggs + 80g oats", "kcal": 520}
-- ]

-- =====================================================
-- 5. WORKOUT_PLANS TABLE (workout plans)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,  -- e.g. "4-day split"
  is_active BOOLEAN DEFAULT false,
  weekly_schedule JSONB DEFAULT '[]'::jsonb,  -- array of {day, type, time, focus}
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_plans_user
  ON public.workout_plans(user_id);

COMMENT ON COLUMN public.workout_plans.weekly_schedule IS 'Week array: [{day, type, time, focus}]';

-- Example weekly_schedule JSONB:
-- [
--   {"day": "Monday", "type": "strength", "time": "08:00", "focus": "Upper Body"},
--   {"day": "Tuesday", "type": "strength", "time": "08:00", "focus": "Lower Body"}
-- ]

-- =====================================================
-- 6. SUPPLEMENTS TABLE (supplement stack)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.supplements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  supplement_name TEXT NOT NULL,
  dosage TEXT NOT NULL,  -- e.g. "5g/day"
  timing TEXT,  -- e.g. "morning", "pre-workout", "evening"
  priority TEXT CHECK (priority IN ('essential', 'recommended', 'optional')),
  monthly_cost_eur NUMERIC(6,2),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplements_user
  ON public.supplements(user_id, is_active);

-- =====================================================
-- 7. RLS POLICIES for new tables
-- =====================================================

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

-- USER_GOALS policies
CREATE POLICY "Users can view own goals"
  ON public.user_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.user_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.user_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.user_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- MEAL_PLANS policies
CREATE POLICY "Users can view own meal plans"
  ON public.meal_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON public.meal_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON public.meal_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON public.meal_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- WORKOUT_PLANS policies
CREATE POLICY "Users can view own workout plans"
  ON public.workout_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans"
  ON public.workout_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans"
  ON public.workout_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans"
  ON public.workout_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- SUPPLEMENTS policies
CREATE POLICY "Users can view own supplements"
  ON public.supplements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplements"
  ON public.supplements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplements"
  ON public.supplements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplements"
  ON public.supplements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. TRIGGERS for updated_at
-- =====================================================

DROP TRIGGER IF EXISTS update_user_goals_updated_at ON public.user_goals;
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON public.meal_plans;
CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_workout_plans_updated_at ON public.workout_plans;
CREATE TRIGGER update_workout_plans_updated_at
  BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_supplements_updated_at ON public.supplements;
CREATE TRIGGER update_supplements_updated_at
  BEFORE UPDATE ON public.supplements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ✅ MIGRATION COMPLETE!
-- =====================================================
-- New tables:
-- 1. user_goals - personalized goals
-- 2. meal_plans - meal plan templates
-- 3. workout_plans - weekly workout plans
-- 4. supplements - supplement stack
--
-- Extensions:
-- - profiles: age, height, city, bmr, tdee, workout_time
-- - body_measurements: bmi, visceral_fat, bone_mineral%, water%
--
-- Next steps:
-- 1. Apply this migration on Supabase
-- 2. Add sample data for a test account
-- 3. Build UI to view and manage the plan
-- =====================================================
