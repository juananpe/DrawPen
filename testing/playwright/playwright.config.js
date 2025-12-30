const { defineConfig, devices } = require("@playwright/test");
const path = require("path");

/**
 * Playwright configuration for DrawPen Electron app E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // Test directory
  testDir: "./tests",

  // Global setup for authentication/state
  globalSetup: require.resolve("./global-setup.js"),

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test expectations timeout
  expect: {
    timeout: 5000,
  },

  // Run tests in files in parallel
  fullyParallel: false, // Electron apps work better with serial execution

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Number of workers (CI: 1, local: up to 2 for stability)
  workers: process.env.CI ? 1 : 2,

  // Reporter configuration
  reporter: [
    // Console output (always)
    ["list"],
    // HTML report (local and CI)
    [
      "html",
      {
        outputFolder: "test-results/html-report",
        open: process.env.CI ? "never" : "on-failure",
      },
    ],
    // JUnit XML for CI dashboards
    [
      "junit",
      {
        outputFile: "test-results/junit.xml",
      },
    ],
    // JSON for programmatic access
    [
      "json",
      {
        outputFile: "test-results/results.json",
      },
    ],
  ],

  // Output directory for artifacts
  outputDir: "test-results/artifacts",

  // Shared settings for all projects
  use: {
    // Base URL for navigation (not used for Electron, but helpful for future web tests)
    // baseURL: 'http://localhost:3000',

    // Collect trace on failure for debugging
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",

    // Context options
    viewport: null, // Use native viewport

    // Accept downloads automatically
    acceptDownloads: true,

    // Credentials from environment variables
    // storageState: 'testing/playwright/.auth/user.json', // Uncomment when auth is needed
  },

  // Project configurations
  projects: [
    {
      name: "electron",
      use: {
        ...devices["Desktop Chrome"],
        // Electron-specific launch options
        launchOptions: {
          executablePath: getElectronPath(),
          args: process.env.CI
            ? ["--no-sandbox", "--disable-dev-shm-usage"]
            : [],
          env: {
            ...process.env,
            NODE_ENV: "test",
            ELECTRON_ENABLE_LOGGING: "1",
          },
        },
        // Headed mode for local dev, headless for CI
        headless: !!process.env.CI,
      },
    },
  ],

  // Global teardown
  globalTeardown: require.resolve("./global-teardown.js"),

  // Web server configuration (if needed for future web version)
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  //   timeout: 120 * 1000,
  //   reuseExistingServer: !process.env.CI,
  // },
});

/**
 * Get Electron executable path based on platform
 */
function getElectronPath() {
  const { platform } = process;

  if (process.env.ELECTRON_EXEC_PATH) {
    return process.env.ELECTRON_EXEC_PATH;
  }

  // Path to packaged app (adjust based on your build output)
  const baseAppPath = path.join(__dirname, "../../out");
  const fs = require('fs');

  // Check if packaged app exists
  if (fs.existsSync(baseAppPath)) {
    if (platform === "darwin") {
      // Try both arm64 and x64 for macOS
      const arm64Path = path.join(
        baseAppPath,
        "DrawPen-darwin-arm64/DrawPen.app/Contents/MacOS/DrawPen"
      );
      const x64Path = path.join(
        baseAppPath,
        "DrawPen-darwin-x64/DrawPen.app/Contents/MacOS/DrawPen"
      );
      
      if (fs.existsSync(arm64Path)) return arm64Path;
      if (fs.existsSync(x64Path)) return x64Path;
    } else if (platform === "win32") {
      const exePath = path.join(baseAppPath, "DrawPen-win32-x64/DrawPen.exe");
      if (fs.existsSync(exePath)) return exePath;
    } else if (platform === "linux") {
      const linuxPath = path.join(baseAppPath, "DrawPen-linux-x64/DrawPen");
      if (fs.existsSync(linuxPath)) return linuxPath;
    }
  }

  // Fallback: Warn and use electron directly
  console.warn('\u26a0\ufe0f  Packaged app not found. Run "npm run package" before testing.');
  console.warn('   Attempting to use electron module as fallback...');
  return require("electron");
}
