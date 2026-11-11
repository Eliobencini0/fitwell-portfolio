-- =====================================================
-- Fitness Tracker - Supabase Database Schema
-- =====================================================
-- Optimized version - run everything at once
-- =====================================================

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABLES
-- =====================================================

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  daily_calorie_target INTEGER DEFAULT 2000,
  daily_water_target INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily activities (to-do list)
CREATE TABLE IF NOT EXISTS public.daily_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('meal', 'workout', 'meditation', 'supplement', 'other')),
  calories INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hydration tracking
CREATE TABLE IF NOT EXISTS public.hydration_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  glasses INTEGER DEFAULT 0,
  target INTEGER DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Detailed meals
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  name TEXT NOT NULL,
  foods JSONB DEFAULT '[]'::jsonb,
  total_calories INTEGER DEFAULT 0,
  total_protein NUMERIC(6,2) DEFAULT 0,
  total_carbs NUMERIC(6,2) DEFAULT 0,
  total_fat NUMERIC(6,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detailed workouts
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('strength', 'cardio', 'hiit', 'flexibility', 'other')),
  name TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  exercises JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weight and measurement history
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5,2),
  body_fat_percentage NUMERIC(4,2),
  muscle_mass NUMERIC(5,2),
  visceral_fat NUMERIC(4,2),
  water_percentage NUMERIC(4,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_daily_activities_user_date
  ON public.daily_activities(user_id, date);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_date
  ON public.hydration_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meals_user_date
  ON public.meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date
  ON public.workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date
  ON public.body_measurements(user_id, date);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. POLICIES
-- =====================================================

-- Policies for PROFILES
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies for DAILY_ACTIVITIES
CREATE POLICY "Users can view own activities"
  ON public.daily_activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON public.daily_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON public.daily_activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON public.daily_activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for HYDRATION_LOGS
CREATE POLICY "Users can view own hydration"
  ON public.hydration_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hydration"
  ON public.hydration_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hydration"
  ON public.hydration_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for MEALS
CREATE POLICY "Users can view own meals"
  ON public.meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON public.meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON public.meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON public.meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for WORKOUTS
CREATE POLICY "Users can view own workouts"
  ON public.workouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON public.workouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON public.workouts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON public.workouts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for BODY_MEASUREMENTS
CREATE POLICY "Users can view own measurements"
  ON public.body_measurements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements"
  ON public.body_measurements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own measurements"
  ON public.body_measurements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements"
  ON public.body_measurements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. FUNCTIONS
-- =====================================================

-- Function to create a profile automatically after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger to create a profile when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers to update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_activities_updated_at ON public.daily_activities;
CREATE TRIGGER update_daily_activities_updated_at
  BEFORE UPDATE ON public.daily_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_hydration_logs_updated_at ON public.hydration_logs;
CREATE TRIGGER update_hydration_logs_updated_at
  BEFORE UPDATE ON public.hydration_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ✅ SETUP COMPLETE!
-- =====================================================
-- Database schema created successfully.
--
-- Verify:
-- 1. Go to Table Editor - you should see 6 tables
-- 2. Go to Database → Functions - 2 functions
-- 3. Go to Authentication → Policies - policies active
--
-- Next steps:
-- 1. Configure Email Authentication in Supabase
-- 2. Restart the Next.js server
-- 3. Test the app at http://localhost:3000
-- =====================================================
