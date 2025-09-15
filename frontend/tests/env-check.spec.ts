import { test, expect } from '@playwright/test';
import { validateTestEnvironment, getTestConfig } from './fixtures/env-validation';
import { getTestUser } from './fixtures/test-users';

test.describe('Environment Configuration', () => {
  test('should load test environment variables correctly', async () => {
    // This will throw an error if environment variables are missing
    validateTestEnvironment();
    
    // Verify test user configuration
    const testUser = getTestUser('PRIMARY');
    expect(testUser.email).toBeTruthy();
    expect(testUser.password).toBeTruthy();
    expect(testUser.fullName).toBeTruthy();
    
    console.log('✅ Test user configuration:');
    console.log(`  Email: ${testUser.email}`);
    console.log(`  Name: ${testUser.fullName}`);
    console.log(`  Role: ${testUser.role}`);
  });

  test('should load test configuration correctly', async () => {
    const config = getTestConfig();
    
    expect(config.baseUrl).toBeTruthy();
    expect(config.timeout).toBeGreaterThan(0);
    
    console.log('✅ Test configuration:');
    console.log(`  Base URL: ${config.baseUrl}`);
    console.log(`  Headless: ${config.headless}`);
    console.log(`  Timeout: ${config.timeout}ms`);
  });

  test('should have access to environment variables', async () => {
    // Check that environment variables are loaded
    expect(process.env.PLAYWRIGHT_TEST_USER_EMAIL).toBeTruthy();
    expect(process.env.PLAYWRIGHT_TEST_USER_PASSWORD).toBeTruthy();
    
    console.log('✅ Environment variables loaded successfully');
  });
});