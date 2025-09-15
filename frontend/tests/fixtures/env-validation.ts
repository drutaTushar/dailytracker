/**
 * Environment validation utilities for tests
 */

export function validateTestEnvironment(): void {
  const requiredEnvVars = [
    'PLAYWRIGHT_TEST_USER_EMAIL',
    'PLAYWRIGHT_TEST_USER_PASSWORD',
  ];
  
  const missingVars: string[] = [];
  const foundVars: Record<string, string> = {};
  
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else {
      foundVars[varName] = value;
    }
  }
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.log('Please ensure your .env.test.local file contains:');
    missingVars.forEach(varName => {
      console.log(`${varName}=your-value-here`);
    });
    throw new Error(`Missing required test environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ Test environment variables loaded successfully:');
  Object.entries(foundVars).forEach(([key, value]) => {
    // Mask password for security
    const displayValue = key.includes('PASSWORD') ? '***' : value;
    console.log(`  ${key}=${displayValue}`);
  });
}

export function getTestConfig() {
  return {
    baseUrl: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
    timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '30000'),
  };
}