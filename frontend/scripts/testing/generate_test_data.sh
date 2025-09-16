#!/bin/bash

# Generate test data SQL for a specific user email
# Usage: ./generate_test_data.sh <user_email>

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if email argument is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: Please provide a user email${NC}"
    echo "Usage: $0 <user_email>"
    echo "Example: $0 test-user-1@habittracker.test"
    exit 1
fi

USER_EMAIL="$1"
OUTPUT_FILE="sample_tasks.sql"

echo -e "${YELLOW}Generating test data for user: ${USER_EMAIL}${NC}"
echo -e "${BLUE}Output file: ${OUTPUT_FILE}${NC}"

# Generate the SQL file
cat > "$OUTPUT_FILE" << EOF
-- Generated test data for user: ${USER_EMAIL}
-- Created on: $(date)

-- Find user and insert tasks
DO \$\$
DECLARE
    target_user_id UUID;
    target_user_email TEXT := '${USER_EMAIL}';
    existing_tasks_count INTEGER;
BEGIN
    -- Look up user ID by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = target_user_email;
    
    -- Check if user was found
    IF target_user_id IS NOT NULL THEN
        -- Check existing tasks count
        SELECT COUNT(*) INTO existing_tasks_count 
        FROM tasks 
        WHERE user_id = target_user_id;
        
        RAISE NOTICE 'Found user % with ID %, existing tasks: %', 
            target_user_email, target_user_id, existing_tasks_count;
        
        -- Delete any existing test tasks to start fresh
        DELETE FROM tasks WHERE user_id = target_user_id AND name IN (
            'Morning Exercise', 'Drink Water', 'Take Vitamins', 'Read 30 Minutes',
            'Practice Coding', 'Learn New Language', 'Check Emails', 'Plan Tomorrow',
            'Deep Work Session', 'Morning Meditation', 'Gratitude Journal', 
            'Evening Reflection', 'Call Family', 'Text Friends', 'Creative Writing',
            'Practice Guitar', 'Track Expenses', 'Skincare Routine', 'Old Habit'
        );
        
        -- Insert comprehensive test tasks
        INSERT INTO tasks (user_id, name, description, positive_points, negative_points, category, difficulty_level, is_active) 
        VALUES 
          -- Health & Fitness (4 tasks)
          (target_user_id, 'Morning Exercise', 'Complete 30 minutes of morning exercise routine', 15, 8, 'Health', 4, true),
          (target_user_id, 'Drink Water', 'Drink at least 8 glasses of water throughout the day', 5, 2, 'Health', 1, true),
          (target_user_id, 'Take Vitamins', 'Remember to take daily vitamins and supplements', 3, 1, 'Health', 1, true),
          (target_user_id, 'Healthy Meal Prep', 'Prepare nutritious meals for the day', 8, 4, 'Health', 2, true),
          
          -- Learning & Development (4 tasks)
          (target_user_id, 'Read 30 Minutes', 'Read at least 30 minutes of educational content', 10, 5, 'Learning', 2, true),
          (target_user_id, 'Practice Coding', 'Complete coding exercises or work on personal projects', 20, 10, 'Learning', 5, true),
          (target_user_id, 'Learn New Language', 'Practice foreign language for 20 minutes', 8, 4, 'Learning', 3, true),
          (target_user_id, 'Online Course', 'Complete a lesson from an online course', 12, 6, 'Learning', 3, true),
          
          -- Productivity & Work (4 tasks)
          (target_user_id, 'Check Emails', 'Process and respond to all emails', 5, 3, 'Productivity', 2, true),
          (target_user_id, 'Plan Tomorrow', 'Review and plan tasks for the next day', 7, 3, 'Productivity', 2, true),
          (target_user_id, 'Deep Work Session', 'Complete 2 hours of focused, uninterrupted work', 25, 15, 'Productivity', 5, true),
          (target_user_id, 'Organize Workspace', 'Clean and organize work area', 6, 2, 'Productivity', 1, true),
          
          -- Mindfulness & Mental Health (3 tasks)
          (target_user_id, 'Morning Meditation', 'Complete 15 minutes of mindfulness meditation', 12, 6, 'Mindfulness', 3, true),
          (target_user_id, 'Gratitude Journal', 'Write down 3 things you are grateful for', 6, 2, 'Mindfulness', 1, true),
          (target_user_id, 'Evening Reflection', 'Reflect on the day and lessons learned', 8, 3, 'Mindfulness', 2, true),
          
          -- Social & Relationships (2 tasks)
          (target_user_id, 'Call Family', 'Have a meaningful conversation with family member', 10, 5, 'Social', 2, true),
          (target_user_id, 'Text Friends', 'Check in with friends and maintain connections', 5, 2, 'Social', 1, true),
          
          -- Creativity & Hobbies (2 tasks)
          (target_user_id, 'Creative Writing', 'Write for 30 minutes - journal, story, or poem', 12, 4, 'Creativity', 3, true),
          (target_user_id, 'Practice Guitar', 'Practice guitar for at least 20 minutes', 8, 3, 'Creativity', 2, true),
          
          -- Finance & Personal (2 tasks)
          (target_user_id, 'Track Expenses', 'Log daily expenses and review budget', 6, 3, 'Finance', 2, true),
          (target_user_id, 'Skincare Routine', 'Complete morning and evening skincare routine', 4, 1, 'Personal', 1, true),
          
          -- One inactive task for testing filters
          (target_user_id, 'Old Habit', 'This is an inactive task that should not appear in daily view', 5, 2, 'Personal', 1, false);
          
        RAISE NOTICE 'SUCCESS: Inserted 20 tasks for user % (ID: %)', target_user_email, target_user_id;
        RAISE NOTICE 'Task breakdown:';
        RAISE NOTICE '  - Health: 4 tasks (3-15 points)';
        RAISE NOTICE '  - Learning: 4 tasks (8-20 points)';
        RAISE NOTICE '  - Productivity: 4 tasks (5-25 points)';
        RAISE NOTICE '  - Mindfulness: 3 tasks (6-12 points)';
        RAISE NOTICE '  - Social: 2 tasks (5-10 points)';
        RAISE NOTICE '  - Creativity: 2 tasks (8-12 points)';
        RAISE NOTICE '  - Finance/Personal: 2 tasks (4-6 points)';
        RAISE NOTICE '  - 1 inactive task for testing';
        
    ELSE
        RAISE NOTICE 'ERROR: User with email % does not exist', target_user_email;
        RAISE NOTICE 'Available users:';
        FOR target_user_id IN SELECT id FROM auth.users LOOP
            SELECT email INTO target_user_email FROM auth.users WHERE id = target_user_id;
            RAISE NOTICE '  - % (ID: %)', COALESCE(target_user_email, 'no-email'), target_user_id;
        END LOOP;
        RAISE NOTICE '';
        RAISE NOTICE 'To fix this:';
        RAISE NOTICE '1. Create a user account with email: ${USER_EMAIL}';
        RAISE NOTICE '2. Or run: ./generate_test_data.sh <existing-email>';
    END IF;
END \$\$;
EOF

echo
echo -e "${GREEN}✅ Test data SQL generated successfully!${NC}"
echo -e "${BLUE}File: ${OUTPUT_FILE}${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the generated SQL file: cat ${OUTPUT_FILE}"
echo "2. Run it against your database: ./run_sql.sh ${OUTPUT_FILE}"
echo
echo -e "${BLUE}📊 Generated test data includes:${NC}"
echo "  • 20 diverse tasks across all categories"
echo "  • Point values ranging from 3-25 points"
echo "  • Difficulty levels 1-5 stars"
echo "  • 1 inactive task for filter testing"
echo "  • Automatic cleanup of existing test tasks"