import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90000,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm.cmd run start -- -p 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 90000,
  },
});
