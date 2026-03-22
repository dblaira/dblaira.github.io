-- SAVY: Emotion check-in logs
-- Run this in the Supabase SQL Editor for the shared project

CREATE TABLE IF NOT EXISTS emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  emotion TEXT NOT NULL,
  energy TEXT NOT NULL CHECK (energy IN ('high', 'low')),
  valence TEXT NOT NULL CHECK (valence IN ('pleasant', 'unpleasant')),
  trigger_tag TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE emotion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emotion logs"
  ON emotion_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emotion logs"
  ON emotion_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emotion logs"
  ON emotion_logs FOR DELETE
  USING (auth.uid() = user_id);
