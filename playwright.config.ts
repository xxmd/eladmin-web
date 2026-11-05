import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:8013', browserName: 'chromium', channel: process.platform === 'win32' ? 'msedge' : undefined, headless: true, screenshot: 'only-on-failure' },
  webServer: { command: 'npm run preview -- --port 8013', url: 'http://127.0.0.1:8013', reuseExistingServer: !process.env.CI },
  reporter: 'list'
})
