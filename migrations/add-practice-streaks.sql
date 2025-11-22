-- Add practice streak tracking tables

-- Practice Streaks table
CREATE TABLE IF NOT EXISTS practice_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_practice_date DATE,
  streak_start_date DATE,
  total_practice_days INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Practice Calendar table
CREATE TABLE IF NOT EXISTS practice_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  questions_answered INTEGER DEFAULT 0 NOT NULL,
  correct_answers INTEGER DEFAULT 0 NOT NULL,
  practice_minutes INTEGER DEFAULT 0 NOT NULL,
  sessions_completed INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, practice_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_streaks_user_id ON practice_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_calendar_user_id ON practice_calendar(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_calendar_date ON practice_calendar(practice_date);
CREATE INDEX IF NOT EXISTS idx_practice_calendar_user_date ON practice_calendar(user_id, practice_date);

-- Enable RLS
ALTER TABLE practice_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_calendar ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practice_streaks
CREATE POLICY "Users can view their own streaks"
  ON practice_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
  ON practice_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON practice_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for practice_calendar
CREATE POLICY "Users can view their own calendar"
  ON practice_calendar FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar entries"
  ON practice_calendar FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar entries"
  ON practice_calendar FOR UPDATE
  USING (auth.uid() = user_id);
