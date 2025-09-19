/**
 * GENESIS LUMINAL - DEMO TESTS CONFIGURATION
 * Configuração simplificada sem dependência de servidores
 */

import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/specialized',
  testMatch: '**/demo-tests.spec.ts',
  
  timeout: 30000,
  expect: { timeout: 5000 },
  
  // Configurações simplificadas
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/demo' }]
  ],
  
  outputDir: 'test-results/demo-output',
  
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  
  // SEM webServer - não depende de aplicações rodando
  projects: [
    {
      name: 'demo',
      use: { browserName: 'chromium' }
    }
  ]
};

export default config;
