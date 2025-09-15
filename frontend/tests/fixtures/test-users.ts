/**
 * Test User Management System
 * 
 * This module manages test users for Playwright tests.
 * Test users should be created in your Supabase project before running tests.
 */

export interface TestUser {
  email: string;
  password: string;
  fullName: string;
  displayName?: string;
  role: 'primary' | 'secondary' | 'admin';
}

export const TEST_USERS: Record<string, TestUser> = {
  PRIMARY: {
    email: process.env.PLAYWRIGHT_TEST_USER_EMAIL || 'test-user-1@habittracker.test',
    password: process.env.PLAYWRIGHT_TEST_USER_PASSWORD || 'test123',
    fullName: 'Test User One',
    displayName: 'TestUser1',
    role: 'primary',
  },
  SECONDARY: {
    email: process.env.PLAYWRIGHT_TEST_USER_2_EMAIL || 'test-user-2@habittracker.test',
    password: process.env.PLAYWRIGHT_TEST_USER_2_PASSWORD || 'test123',
    fullName: 'Test User Two',
    displayName: 'TestUser2',
    role: 'secondary',
  },
  ADMIN: {
    email: process.env.PLAYWRIGHT_ADMIN_EMAIL || 'test-admin@habittracker.test',
    password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || 'test123',
    fullName: 'Test Admin User',
    displayName: 'AdminUser',
    role: 'admin',
  },
};

/**
 * Get test user by role
 */
export function getTestUser(role: keyof typeof TEST_USERS = 'PRIMARY'): TestUser {
  return TEST_USERS[role];
}

/**
 * Validate that test user credentials are available
 */
export function validateTestUsers(): void {
  const missingVars: string[] = [];
  
  if (!process.env.PLAYWRIGHT_TEST_USER_EMAIL) {
    missingVars.push('PLAYWRIGHT_TEST_USER_EMAIL');
  }
  if (!process.env.PLAYWRIGHT_TEST_USER_PASSWORD) {
    missingVars.push('PLAYWRIGHT_TEST_USER_PASSWORD');
  }
  
  if (missingVars.length > 0) {
    console.warn(
      `Warning: Missing test user environment variables: ${missingVars.join(', ')}. ` +
      'Using default test user credentials. Make sure test users exist in your database.'
    );
  }
}

/**
 * Generate random test data for tasks
 */
export const TEST_DATA = {
  SAMPLE_TASKS: [
    {
      name: 'Morning Exercise',
      description: 'Complete 30-minute workout routine',
      positivePoints: 5,
      negativePoints: -2,
      category: 'Health',
      difficultyLevel: 3,
    },
    {
      name: 'Read for 20 minutes',
      description: 'Read educational or fiction books',
      positivePoints: 3,
      negativePoints: -1,
      category: 'Learning',
      difficultyLevel: 2,
    },
    {
      name: 'Drink 8 glasses of water',
      description: 'Stay hydrated throughout the day',
      positivePoints: 2,
      negativePoints: 0,
      category: 'Health',
      difficultyLevel: 1,
    },
  ],
  
  CATEGORIES: [
    'Health',
    'Learning',
    'Productivity',
    'Social',
    'Creativity',
    'Mindfulness',
  ],
  
  DIFFICULTY_LEVELS: [1, 2, 3, 4, 5] as const,
} as const;

/**
 * Generate a random task for testing
 */
export function generateRandomTask() {
  const categories = TEST_DATA.CATEGORIES;
  const difficulties = TEST_DATA.DIFFICULTY_LEVELS;
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  return {
    name: `Test Task ${randomSuffix}`,
    description: `Automated test task created at ${new Date().toISOString()}`,
    positivePoints: Math.floor(Math.random() * 5) + 1,
    negativePoints: Math.floor(Math.random() * 3),
    category: categories[Math.floor(Math.random() * categories.length)],
    difficultyLevel: difficulties[Math.floor(Math.random() * difficulties.length)],
  };
}