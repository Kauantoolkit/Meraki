import { defineConfig } from '@playwright/test'

/**
 * Config do motor de fluxos (híbrido: grafo curado + crawler).
 * Pré-requisito: backend real no ar (backend/start-all.ps1) — o front fala com o gateway :3000.
 * Screenshots LIGADOS em toda etapa (o recorder anexa um print por passo) + trace + vídeo em falha.
 */
export default defineConfig({
  testDir: './e2e-flows/journeys',
  outputDir: './test-results/flows',
  timeout: 90_000,
  retries: 0,
  workers: 1, // determinístico e sem burst no throttler do login
  reporter: [
    ['html', { outputFolder: 'playwright-report-flows', open: 'never' }],
    ['line'],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1440, height: 900 },
    screenshot: 'on',
    trace: 'on',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
