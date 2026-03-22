-- Add 'rejected' to the allowed question statuses.
-- This lets the admin panel reject questions via UPDATE (which has an RLS
-- policy) instead of DELETE (which did not have an RLS policy and silently
-- failed).
--
-- ⚠️  RUN THIS MIGRATION against your Supabase database:
--     Go to Supabase Dashboard → SQL Editor → paste and run this file.

ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_status_check;
ALTER TABLE questions ADD CONSTRAINT questions_status_check
  CHECK (status IN ('pending', 'approved', 'sent', 'rejected'));
