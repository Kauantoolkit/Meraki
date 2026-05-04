import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e-integration',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 15_000,
  },
})
