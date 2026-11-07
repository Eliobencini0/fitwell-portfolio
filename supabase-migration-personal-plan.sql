-- =====================================================
-- Migration: Personal Plan Data Structure
-- =====================================================
-- Data: 2026-03-07
-- Descrizione: Estende il database per supportare
--              piani personalizzati completi
-- =====================================================

-- =====================================================
-- 1. ESTENDI PROFILES con dati metabolici
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

COMMENT ON COLUMN public.profiles.bmr IS 'Metabolismo basale (kcal/giorno)';
COMMENT ON COLUMN public.profiles.tdee_min IS 'TDEE minimo stimato';
COMMENT ON COLUMN public.profiles.tdee_max IS 'TDEE massimo stimato';
COMMENT ON COLUMN public.profiles.workout_time IS 'Orario allenamento preferito';

-- =====================================================
-- 2. ESTENDI BODY_MEASUREMENTS con dati mancanti
-- =====================================================

ALTER TABLE public.body_measurements
ADD COLUMN IF NOT EXISTS bmi NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS visceral_fat NUMERIC(3,1),
ADD COLUMN IF NOT EXISTS bone_mineral_percentage NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS body_water_percentage NUMERIC(4,2);

COMMENT ON COLUMN public.body_measurements.bmi IS 'Body Mass Index';
COMMENT ON COLUMN public.body_measurements.visceral_fat IS 'Grasso viscerale (target < 7)';
COMMENT ON COLUMN public.body_measurements.bone_mineral_percentage IS 'Percentuale minerale osseo';
COMMENT ON COLUMN public.body_measurements.body_water_percentage IS 'Percentuale acqua corporea';

-- =====================================================
-- 3. TABELLA USER_GOALS (obiettivi personalizzati)
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
  UNIQUE(user_id, is_active)  -- solo un goal attivo alla volta
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_active
  ON public.user_goals(user_id, is_active);

-- =====================================================
-- 4. TABELLA MEAL_PLANS (piani pasto template)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,  -- es. "Opzione A - Pre-workout leggero"
  is_active BOOLEAN DEFAULT false,
  meal_timing JSONB DEFAULT '[]'::jsonb,  -- array di {name, time, example, kcal}
  fasting_protocol TEXT,  -- es. "16:8", "none"
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user
  ON public.meal_plans(user_id);

COMMENT ON COLUMN public.meal_plans.meal_timing IS 'Array di pasti: [{name, time, example, kcal}]';

-- Esempio meal_timing JSONB:
-- [
--   {"name": "Pre-workout", "time": "07:00", "example": "1 banana + caffè", "kcal": 100},
--   {"name": "Colazione", "time": "09:30", "example": "3 uova + 80g avena", "kcal": 520}
-- ]

-- =====================================================
-- 5. TABELLA WORKOUT_PLANS (piani allenamento)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,  -- es. "Split 4 giorni"
  is_active BOOLEAN DEFAULT false,
  weekly_schedule JSONB DEFAULT '[]'::jsonb,  -- array di {day, type, time, focus}
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_plans_user
  ON public.workout_plans(user_id);

COMMENT ON COLUMN public.workout_plans.weekly_schedule IS 'Array settimana: [{day, type, time, focus}]';

-- Esempio weekly_schedule JSONB:
-- [
--   {"day": "Monday", "type": "strength", "time": "08:00", "focus": "Upper Body"},
--   {"day": "Tuesday", "type": "strength", "time": "08:00", "focus": "Lower Body"}
-- ]

-- =====================================================
-- 6. TABELLA SUPPLEMENTS (stack integratori)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.supplements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  supplement_name TEXT NOT NULL,
  dosage TEXT NOT NULL,  -- es. "5g/giorno"
  timing TEXT,  -- es. "mattina", "pre-workout", "sera"
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
-- 7. RLS POLICIES per nuove tabelle
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
-- 8. TRIGGERS per updated_at
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
-- ✅ MIGRATION COMPLETATA!
-- =====================================================
-- Nuove tabelle:
-- 1. user_goals - obiettivi personalizzati
-- 2. meal_plans - template piani pasto
-- 3. workout_plans - piani allenamento settimanali
-- 4. supplements - stack integratori
--
-- Estensioni:
-- - profiles: age, height, city, bmr, tdee, workout_time
-- - body_measurements: bmi, visceral_fat, bone_mineral%, water%
--
-- Prossimo step:
-- 1. Applicare questa migration su Supabase
-- 2. Aggiungere dati di esempio per un account di test
-- 3. Creare UI per visualizzare e gestire il piano
-- =====================================================
