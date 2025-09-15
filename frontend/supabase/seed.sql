-- Seed data for testing
-- This file will populate the database with sample data for development

-- Note: auth.users table is managed by Supabase Auth
-- Sample tasks will be inserted after user registration

-- You can add sample data here after setting up authentication
-- For now, this file serves as a placeholder for future seed data

-- Example of how to insert tasks (will work after user authentication):
-- INSERT INTO tasks (user_id, name, description, positive_points, negative_points, category, difficulty_level) 
-- VALUES 
--   (auth.uid(), 'Morning Exercise', 'Complete 30 minutes of morning exercise', 10, -5, 'Health', 3),
--   (auth.uid(), 'Read 20 Pages', 'Read at least 20 pages of a book', 5, -2, 'Education', 2),
--   (auth.uid(), 'Meditate', 'Complete 10 minutes of meditation', 8, -3, 'Wellness', 2);