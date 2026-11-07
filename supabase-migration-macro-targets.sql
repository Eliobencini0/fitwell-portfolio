-- =====================================================
-- Migration: Add Macro Targets to Profiles
-- =====================================================
-- Data: 2026-03-06
-- Descrizione: Aggiunge percentuali target per macro
--              (carboidrati, proteine, grassi)
-- =====================================================

-- Aggiungi colonne per percentuali macro target
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS macro_carbs_percentage INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS macro_protein_percentage INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS macro_fats_percentage INTEGER DEFAULT 20;

-- Aggiungi commenti per documentazione
COMMENT ON COLUMN public.profiles.macro_carbs_percentage IS 'Percentuale target giornaliera carboidrati (default 50%)';
COMMENT ON COLUMN public.profiles.macro_protein_percentage IS 'Percentuale target giornaliera proteine (default 30%)';
COMMENT ON COLUMN public.profiles.macro_fats_percentage IS 'Percentuale target giornaliera grassi (default 20%)';

-- Aggiungi constraint per validazione (totale deve essere 100%)
ALTER TABLE public.profiles
ADD CONSTRAINT check_macro_percentages
CHECK (macro_carbs_percentage + macro_protein_percentage + macro_fats_percentage = 100);

-- =====================================================
-- ✅ MIGRATION COMPLETATA!
-- =====================================================
-- Ora i profili utente hanno i target macro personalizzabili
-- Default: 50% carbs, 30% protein, 20% fats
--
-- Per personalizzare:
-- UPDATE profiles
-- SET macro_carbs_percentage = 40,
--     macro_protein_percentage = 30,
--     macro_fats_percentage = 30
-- WHERE id = 'user_id';
-- =====================================================
