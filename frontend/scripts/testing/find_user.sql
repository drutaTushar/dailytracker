-- Find user ID by email
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'test-user-1@habittracker.test';

-- Also show all users if the specific one doesn't exist
SELECT 'All users:' as info;
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;