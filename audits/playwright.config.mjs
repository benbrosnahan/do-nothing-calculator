// Playwright suite for the Do-Nothing Calculator. Runs against a production build on port 3205, started from the
// repo root unless AUDIT_URL points somewhere else (the live site, a preview deployment, another port).
// Adapted from the Loan Desk audit kit.
import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.AUDIT_PORT || 3205);
const baseURL = process.env.AUDIT_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  expect: { timeout: 4000 },
  reporter: [
    ['list'],
    ['json', { outputFile: 'results/latest/playwright.json' }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 5000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: process.env.AUDIT_URL
    ? undefined
    : {
        command: `cd .. && npx next start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
