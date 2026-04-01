-- ═══════════════════════════════════════════════════════════════
-- Migration 005: Detailed question response tracking
-- ═══════════════════════════════════════════════════════════════
--
-- ⚠️  RUN THIS IN SUPABASE SQL EDITOR (Dashboard → SQL Editor → paste and run)
--
-- Creates question_responses table for detailed per-user answer analytics
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  subscriber_email TEXT,
  selected_answer TEXT NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D', 'E')),
  is_correct BOOLEAN NOT NULL,
  eliminated_options JSONB DEFAULT '[]'::jsonb,
  time_to_answer_seconds INTEGER,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(question_id, subscriber_email)
);

CREATE INDEX IF NOT EXISTS idx_qr_question ON question_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_qr_email ON question_responses(subscriber_email);
CREATE INDEX IF NOT EXISTS idx_qr_answered_at ON question_responses(answered_at);

-- RLS policies
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read question_responses"
  ON question_responses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert question_responses"
  ON question_responses FOR INSERT
  WITH CHECK (true);
