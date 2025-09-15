-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Task completions policies
CREATE POLICY "Users can view their own completions" ON task_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions" ON task_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions" ON task_completions
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND completion_date >= CURRENT_DATE - INTERVAL '7 days'
    );

CREATE POLICY "Users can delete recent completions" ON task_completions
    FOR DELETE USING (
        auth.uid() = user_id 
        AND completion_date >= CURRENT_DATE - INTERVAL '1 day'
    );

-- Daily scores policies (read-only, computed data)
CREATE POLICY "Users can view their own daily scores" ON daily_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage daily scores" ON daily_scores
    FOR ALL USING (current_user = 'service_role');