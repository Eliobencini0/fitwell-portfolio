-- =====================================================
-- Migration: Add Macros to Daily Activities
-- =====================================================
-- Data: 2026-03-06
-- Descrizione: Aggiunge campi macro (carbs, protein, fats)
--              a daily_activities per tracking quando
--              un'attività meal viene completata
-- =====================================================

-- Aggiungi colonne per macro
ALTER TABLE public.daily_activities
ADD COLUMN IF NOT EXISTS carbs NUMERIC(6,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS protein NUMERIC(6,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fats NUMERIC(6,2) DEFAULT 0;

-- Aggiungi commenti per documentazione
COMMENT ON COLUMN public.daily_activities.carbs IS 'Carboidrati in grammi (se activity_type=meal)';
COMMENT ON COLUMN public.daily_activities.protein IS 'Proteine in grammi (se activity_type=meal)';
COMMENT ON COLUMN public.daily_activities.fats IS 'Grassi in grammi (se activity_type=meal)';

-- =====================================================
-- ✅ MIGRATION COMPLETATA!
-- =====================================================
-- Ora le daily_activities possono avere macro associati
-- Quando un'attività di tipo 'meal' viene completata,
-- i macro vengono conteggiati nel totale giornaliero
--
-- Esempio inserimento:
-- INSERT INTO daily_activities (
--   user_id, date, title, activity_type,
--   calories, carbs, protein, fats
-- ) VALUES (
--   'user-id', '2026-03-06', 'Colazione',
--   'meal', 450, 50, 25, 15
-- );
-- =====================================================
