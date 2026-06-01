import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 15_000,
  retries: 0,
  workers: 1, // serial — evita conflitos de dados no banco real

  use: {
    // Serviços locais — ajuste se rodar em outro host/porta
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
    ignoreHTTPSErrors: true,
  },

  reporter: [['list'], ['html', { open: 'never' }]],
});
