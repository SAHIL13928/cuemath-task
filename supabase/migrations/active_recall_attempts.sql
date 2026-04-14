-- Run this in your Supabase SQL editor to enable Active Recall tracking
CREATE TABLE IF NOT EXISTS active_recall_attempts (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users(id)  ON DELETE CASCADE,
  card_id    uuid        REFERENCES cards(id)        ON DELETE CASCADE,
  deck_id    uuid        REFERENCES decks(id)        ON DELETE CASCADE,
  user_answer text,
  score      integer     CHECK (score >= 0 AND score <= 100),
  grade      text        CHECK (grade IN ('excellent','good','partial','incorrect')),
  created_at timestamptz DEFAULT now()
);

-- Index for fast per-deck/user queries
CREATE INDEX IF NOT EXISTS active_recall_attempts_deck_user_idx
  ON active_recall_attempts (deck_id, user_id, created_at DESC);

-- RLS: users can only see/write their own attempts
ALTER TABLE active_recall_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own attempts"
  ON active_recall_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own attempts"
  ON active_recall_attempts FOR SELECT
  USING (auth.uid() = user_id);
