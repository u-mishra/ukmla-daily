-- ═══════════════════════════════════════════════════════════════
-- Migration 004: Subscriber preferences & question history
-- ═══════════════════════════════════════════════════════════════
--
-- ⚠️  RUN THIS IN SUPABASE SQL EDITOR (Dashboard → SQL Editor → paste and run)
--
-- Adds:
-- 1. preferences (JSONB) column to subscribers — stores selected specialties
-- 2. preferences_token (UUID) column to subscribers — URL-safe identifier
-- 3. subscriber_question_history table — tracks which questions each subscriber received
-- ═══════════════════════════════════════════════════════════════

-- 1. Add preferences and token columns to subscribers
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"specialties": ["ENT", "Haematology", "Neurology", "Renal", "Infectious Diseases"]}'::jsonb,
  ADD COLUMN IF NOT EXISTS preferences_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Backfill existing subscribers with unique tokens and default preferences
UPDATE subscribers
SET preferences_token = gen_random_uuid()
WHERE preferences_token IS NULL;

UPDATE subscribers
SET preferences = '{"specialties": ["ENT", "Haematology", "Neurology", "Renal", "Infectious Diseases"]}'::jsonb
WHERE preferences IS NULL;

-- Make preferences_token NOT NULL after backfill
ALTER TABLE subscribers ALTER COLUMN preferences_token SET NOT NULL;
ALTER TABLE subscribers ALTER COLUMN preferences SET NOT NULL;

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_preferences_token ON subscribers(preferences_token);

-- 2. Create subscriber_question_history table
CREATE TABLE IF NOT EXISTS subscriber_question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  sent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(subscriber_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_sqh_subscriber ON subscriber_question_history(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_sqh_question ON subscriber_question_history(question_id);

-- 3. RLS policies
ALTER TABLE subscriber_question_history ENABLE ROW LEVEL SECURITY;

-- Allow public reads (for checking history)
CREATE POLICY "Allow public read subscriber_question_history"
  ON subscriber_question_history FOR SELECT
  USING (true);

-- Allow public inserts (for logging sends)
CREATE POLICY "Allow public insert subscriber_question_history"
  ON subscriber_question_history FOR INSERT
  WITH CHECK (true);

-- Allow public updates on subscribers (for preference saves)
-- (There should already be an update policy, but add one if not)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscribers' AND policyname = 'Allow public update subscribers'
  ) THEN
    CREATE POLICY "Allow public update subscribers"
      ON subscribers FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
