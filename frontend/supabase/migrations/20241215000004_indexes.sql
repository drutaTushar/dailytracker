-- Performance indexes for tasks table
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_active ON tasks(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Performance indexes for task_completions table
CREATE INDEX IF NOT EXISTS idx_completions_user_id ON task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_date ON task_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON task_completions(user_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_completions_task_date ON task_completions(task_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_completions_user_task ON task_completions(user_id, task_id);

-- Performance indexes for daily_scores table
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_id ON daily_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_scores_date ON daily_scores(score_date);
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_date ON daily_scores(user_id, score_date);

-- Partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_tasks_active_only ON tasks(user_id, created_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_completions_completed ON task_completions(user_id, completion_date) WHERE is_completed = true;