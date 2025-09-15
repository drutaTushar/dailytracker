import { test as setup, expect } from '@playwright/test';
import { getTestUser, validateTestUsers } from '../fixtures/test-users';
import { validateTestEnvironment } from '../fixtures/env-validation';

const authFile = 'tests/auth-states/user1-auth.json';

setup('authenticate primary test user', async ({ page }) => {
  // Validate test environment and user credentials are available
  validateTestEnvironment();
  validateTestUsers();
  
  const testUser = getTestUser('PRIMARY');
  
  console.log(`Authenticating test user: ${testUser.email}`);
  
  // Navigate to login page
  await page.goto('/login');
  
  // Fill in login form
  await page.getByRole('textbox', { name: /email/i }).fill(testUser.email);
  await page.getByRole('textbox', { name: /password/i }).fill(testUser.password);
  
  // Submit login form
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for successful authentication
  // This could be waiting for redirect to home page or dashboard
  await page.waitForURL(/^(\/|\/dashboard)$/);
  
  // Verify we're logged in by checking for user-specific content
  // This could be a user menu, welcome message, or logout button
  await expect(page.locator('[data-testid="user-menu"]').or(
    page.getByText('Welcome Back!').or(
      page.getByRole('button', { name: /sign out/i })
    )
  )).toBeVisible({ timeout: 10000 });
  
  console.log('Authentication successful, saving state...');
  
  // Save signed-in state to file
  await page.context().storageState({ path: authFile });
  
  console.log(`Authentication state saved to: ${authFile}`);
});

setup('authenticate secondary test user', async ({ page }) => {
  const testUser = getTestUser('SECONDARY');
  const authFile = 'tests/auth-states/user2-auth.json';
  
  console.log(`Authenticating secondary test user: ${testUser.email}`);
  
  await page.goto('/login');
  
  await page.getByRole('textbox', { name: /email/i }).fill(testUser.email);
  await page.getByRole('textbox', { name: /password/i }).fill(testUser.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  
  await page.waitForURL(/^(\/|\/dashboard)$/);
  await expect(page.locator('[data-testid="user-menu"]').or(
    page.getByText('Welcome Back!').or(
      page.getByRole('button', { name: /sign out/i })
    )
  )).toBeVisible({ timeout: 10000 });
  
  await page.context().storageState({ path: authFile });
  
  console.log(`Secondary user authentication state saved to: ${authFile}`);
});