-- Migration: Add Progress Features (Goals, Achievements, Exams)
-- Date: 2024-11-22

-- User Goals Table
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'custom')),
  goal_category VARCHAR(50) NOT NULL CHECK (goal_category IN ('questions', 'accuracy', 'time', 'tests', 'sections', 'streak')),
  target_value DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'failed', 'archived')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_goals_user ON user_goals(user_id, status);
CREATE INDEX idx_user_goals_period ON user_goals(period_start, period_end);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50) NOT NULL CHECK (category IN ('milestone', 'performance', 'streak', 'coverage', 'speed')),
  requirement_type VARCHAR(50) NOT NULL CHECK (requirement_type IN ('tests_count', 'questions_count', 'accuracy', 'streak_days', 'sections_covered', 'perfect_score', 'improvement', 'consecutive_days')),
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- User Exams Table
CREATE TABLE IF NOT EXISTS user_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_name VARCHAR(200) NOT NULL,
  exam_date DATE NOT NULL,
  target_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_exams_user ON user_exams(user_id);
CREATE INDEX idx_user_exams_date ON user_exams(exam_date);

-- Seed default achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points) VALUES
  ('First Steps', 'Complete your first test', '🎯', 'milestone', 'tests_count', 1, 10),
  ('Getting Started', 'Complete 10 tests', '📝', 'milestone', 'tests_count', 10, 25),
  ('Dedicated Learner', 'Complete 50 tests', '📚', 'milestone', 'tests_count', 50, 50),
  ('Century Club', 'Complete 100 tests', '💯', 'milestone', 'tests_count', 100, 100),
  ('Question Master', 'Answer 100 questions', '❓', 'milestone', 'questions_count', 100, 20),
  ('Question Expert', 'Answer 500 questions', '❗', 'milestone', 'questions_count', 500, 50),
  ('Question Legend', 'Answer 1,000 questions', '⚡', 'milestone', 'questions_count', 1000, 100),
  ('Perfect Score', 'Score 100% on a test', '⭐', 'performance', 'perfect_score', 1, 50),
  ('High Achiever', 'Score 90% or higher on a test', '🏆', 'performance', 'accuracy', 90, 30),
  ('All-Rounder', 'Score above 75% in all sections', '🎓', 'performance', 'accuracy', 75, 75),
  ('Week Warrior', 'Maintain a 7-day study streak', '🔥', 'streak', 'streak_days', 7, 25),
  ('Month Master', 'Maintain a 30-day study streak', '🔥', 'streak', 'streak_days', 30, 75),
  ('Streak Legend', 'Maintain a 100-day study streak', '🔥', 'streak', 'streak_days', 100, 200),
  ('Explorer', 'Attempt all available sections', '🗂️', 'coverage', 'sections_covered', 100, 40),
  ('Consistent Learner', 'Practice every day for a week', '📅', 'coverage', 'consecutive_days', 7, 30)
ON CONFLICT DO NOTHING;
