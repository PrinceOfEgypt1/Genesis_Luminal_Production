/**
 * Configuração Playwright - DIAGNÓSTICO CIENTÍFICO
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000, // 1 minuto para diagnóstico
  expect: { timeout: 30000 },
  fullyParallel: false, // Sequencial para diagnóstico
  forbidOnly: !!process.env.CI,
  retries: 0, // Sem retries para diagnóstico limpo
  workers: 1, // Single worker para diagnóstico
  reporter: [['html'], ['line']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'diagnostic-chrome',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  // CRÍTICO: WebServer configurado corretamente
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true, // Use servidor existente se estiver rodando
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
