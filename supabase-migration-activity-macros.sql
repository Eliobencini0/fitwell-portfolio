-- =====================================================
-- Migration: Add Macros to Daily Activities
-- =====================================================
-- Date: 2026-03-06
-- Description: Adds macro fields (carbs, protein, fats)
--              to daily_activities to track them when
--              a meal activity is completed
-- =====================================================

-- Add columns for macros
ALTER TABLE public.daily_activities
ADD COLUMN IF NOT EXISTS carbs NUMERIC(6,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS protein NUMERIC(6,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fats NUMERIC(6,2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.daily_activities.carbs IS 'Carbs in grams (if activity_type=meal)';
COMMENT ON COLUMN public.daily_activities.protein IS 'Protein in grams (if activity_type=meal)';
COMMENT ON COLUMN public.daily_activities.fats IS 'Fats in grams (if activity_type=meal)';

-- =====================================================
-- ✅ MIGRATION COMPLETE!
-- =====================================================
-- daily_activities can now have associated macros
-- When an activity of type 'meal' is completed,
-- its macros count toward the daily total
--
-- Insert example:
-- INSERT INTO daily_activities (
--   user_id, date, title, activity_type,
--   calories, carbs, protein, fats
-- ) VALUES (
--   'user-id', '2026-03-06', 'Breakfast',
--   'meal', 450, 50, 25, 15
-- );
-- =====================================================
