-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;

-- Tasks policies (drop first to handle existing policies)
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
CREATE POLICY "Users can create their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Task completions policies
DROP POLICY IF EXISTS "Users can view their own completions" ON task_completions;
CREATE POLICY "Users can view their own completions" ON task_completions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own completions" ON task_completions;
CREATE POLICY "Users can create their own completions" ON task_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own completions" ON task_completions;
CREATE POLICY "Users can update their own completions" ON task_completions
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND completion_date >= CURRENT_DATE - INTERVAL '7 days'
    );

DROP POLICY IF EXISTS "Users can delete recent completions" ON task_completions;
CREATE POLICY "Users can delete recent completions" ON task_completions
    FOR DELETE USING (
        auth.uid() = user_id 
        AND completion_date >= CURRENT_DATE - INTERVAL '1 day'
    );

-- Daily scores policies (read-only, computed data)
DROP POLICY IF EXISTS "Users can view their own daily scores" ON daily_scores;
CREATE POLICY "Users can view their own daily scores" ON daily_scores
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage daily scores" ON daily_scores;
CREATE POLICY "System can manage daily scores" ON daily_scores
    FOR ALL USING (current_user = 'service_role');