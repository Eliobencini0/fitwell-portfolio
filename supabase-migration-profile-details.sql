-- =====================================================
-- Migration: Profile details (sex, height)
-- =====================================================
-- Required by the editable profile page.
-- height_cm already exists if supabase-migration-personal-plan.sql was run.
-- =====================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,2);
