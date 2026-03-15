-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMPTZ
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('medium', 'hard')),
  vignette TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  option_e TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
  explanation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'sent')),
  sent_date DATE,
  day_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create answer_clicks table
CREATE TABLE IF NOT EXISTS answer_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  subscriber_email TEXT,
  got_it_right BOOLEAN,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_sent_date ON questions(sent_date);
CREATE INDEX IF NOT EXISTS idx_answer_clicks_question ON answer_clicks(question_id);

-- Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_clicks ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by our API routes via supabase-js with anon key + RLS policies)
-- For the anon key, we allow specific operations:

-- Subscribers: allow insert (signup) and select (for checking existing)
CREATE POLICY "Allow public subscribe" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read subscribers" ON subscribers FOR SELECT USING (true);
CREATE POLICY "Allow update subscribers" ON subscribers FOR UPDATE USING (true);

-- Questions: allow read for answer pages, allow insert/update for API routes
CREATE POLICY "Allow read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow insert questions" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update questions" ON questions FOR UPDATE USING (true);

-- Answer clicks: allow insert (tracking) and select (stats)
CREATE POLICY "Allow insert clicks" ON answer_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read clicks" ON answer_clicks FOR SELECT USING (true);
