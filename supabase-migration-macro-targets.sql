-- =====================================================
-- Migration: Add Macro Targets to Profiles
-- =====================================================
-- Date: 2026-03-06
-- Description: Adds target percentages for macros
--              (carbs, protein, fats)
-- =====================================================

-- Add columns for macro target percentages
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS macro_carbs_percentage INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS macro_protein_percentage INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS macro_fats_percentage INTEGER DEFAULT 20;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.macro_carbs_percentage IS 'Daily target percentage of carbs (default 50%)';
COMMENT ON COLUMN public.profiles.macro_protein_percentage IS 'Daily target percentage of protein (default 30%)';
COMMENT ON COLUMN public.profiles.macro_fats_percentage IS 'Daily target percentage of fats (default 20%)';

-- Add constraint for validation (total must be 100%)
ALTER TABLE public.profiles
ADD CONSTRAINT check_macro_percentages
CHECK (macro_carbs_percentage + macro_protein_percentage + macro_fats_percentage = 100);

-- =====================================================
-- ✅ MIGRATION COMPLETE!
-- =====================================================
-- User profiles now have customizable macro targets
-- Default: 50% carbs, 30% protein, 20% fats
--
-- To customize:
-- UPDATE profiles
-- SET macro_carbs_percentage = 40,
--     macro_protein_percentage = 30,
--     macro_fats_percentage = 30
-- WHERE id = 'user_id';
-- =====================================================
