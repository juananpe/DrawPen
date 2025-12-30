const { _electron: electron } = require('playwright');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * Global setup for Playwright tests
 * Handles authentication state, test data preparation, etc.
 */
async function globalSetup(config) {
  console.log('🔧 Running global setup...');
  
  // Create auth directory if it doesn't exist
  const authDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
  
  // Check for required environment variables
  const requiredEnvVars = [
    // Add any required env vars here, e.g.:
    // 'TEST_USER_EMAIL',
    // 'TEST_USER_PASSWORD',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('   Tests requiring authentication may fail.');
  }
  
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.ELECTRON_ENABLE_LOGGING = '1';
  
  // Optional: Prepare authentication state
  // Uncomment and modify when authentication is needed
  // Example:
  // const browser = await chromium.launch();
  // const context = await browser.newContext();
  // const page = await context.newPage();
  // await page.goto('https://your-auth-url.com/login');
  // await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL);
  // await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD);
  // await page.click('button[type="submit"]');
  // await page.waitForURL('**/dashboard');
  // await context.storageState({ path: path.join(authDir, 'user.json') });
  // await browser.close();
  
  // Optional: Set up test database or fixtures
  // await setupTestDatabase();
  
  // Optional: Clear any existing test artifacts
  const artifactsDir = path.join(__dirname, 'test-results');
  if (fs.existsSync(artifactsDir)) {
    console.log('🧹 Clearing previous test artifacts...');
    // Note: Be careful with recursive deletion in production
    // fs.rmSync(artifactsDir, { recursive: true, force: true });
  }
  
  console.log('✅ Global setup complete');
  
  // Return a teardown function (optional)
  return async () => {
    console.log('🧹 Global setup teardown...');
    // Cleanup if needed
  };
}

module.exports = globalSetup;
