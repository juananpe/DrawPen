const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);

/**
 * Global teardown for Playwright tests
 * Handles cleanup of resources, processes, and temporary files
 */
async function globalTeardown(config) {
  console.log("🧹 Running global teardown...");

  try {
    // Kill any lingering Electron processes
    await killElectronProcesses();

    // Clean up temporary test files
    await cleanupTempFiles();

    // Clean up auth state if needed
    // const authDir = path.join(__dirname, '.auth');
    // if (fs.existsSync(authDir)) {
    //   fs.rmSync(authDir, { recursive: true, force: true });
    //   console.log('✅ Cleaned up auth directory');
    // }

    console.log("✅ Global teardown complete");
  } catch (error) {
    console.error("❌ Error during global teardown:", error);
    // Don't throw to prevent masking test failures
  }
}

/**
 * Kill any lingering Electron processes
 */
async function killElectronProcesses() {
  const platform = process.platform;

  try {
    if (platform === "darwin" || platform === "linux") {
      // Kill Electron processes on macOS/Linux
      try {
        await execPromise('pkill -f "DrawPen|Electron" || true');
        console.log("✅ Killed lingering Electron processes (Unix)");
      } catch (error) {
        // Ignore errors - process may not exist
      }
    } else if (platform === "win32") {
      // Kill Electron processes on Windows
      try {
        await execPromise("taskkill /F /IM DrawPen.exe /T 2>nul || exit 0");
        await execPromise("taskkill /F /IM electron.exe /T 2>nul || exit 0");
        console.log("✅ Killed lingering Electron processes (Windows)");
      } catch (error) {
        // Ignore errors - process may not exist
      }
    }
  } catch (error) {
    console.warn("⚠️  Could not kill Electron processes:", error.message);
  }
}

/**
 * Clean up temporary files created during tests
 */
async function cleanupTempFiles() {
  const tempDirs = [
    // Add paths to temporary directories created during tests
    // e.g., path.join(__dirname, 'temp'),
  ];

  for (const dir of tempDirs) {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Cleaned up temp directory: ${dir}`);
      } catch (error) {
        console.warn(`⚠️  Could not clean up ${dir}:`, error.message);
      }
    }
  }

  // Optional: Clean up old screenshots/videos (keep only last N days)
  // await cleanupOldArtifacts(7); // Keep last 7 days
}

/**
 * Clean up old test artifacts
 */
async function cleanupOldArtifacts(daysToKeep = 7) {
  const artifactsDir = path.join(__dirname, "test-results", "artifacts");

  if (!fs.existsSync(artifactsDir)) {
    return;
  }

  const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(artifactsDir);

  let cleanedCount = 0;
  for (const file of files) {
    const filePath = path.join(artifactsDir, file);
    const stats = fs.statSync(filePath);

    if (stats.mtimeMs < cutoffTime) {
      fs.rmSync(filePath, { recursive: true, force: true });
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`✅ Cleaned up ${cleanedCount} old artifact(s)`);
  }
}

module.exports = globalTeardown;
