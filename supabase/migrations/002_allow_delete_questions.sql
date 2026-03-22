-- Allow deleting questions (needed for rejecting pending questions from admin panel)
CREATE POLICY "Allow delete questions" ON questions FOR DELETE USING (true);
