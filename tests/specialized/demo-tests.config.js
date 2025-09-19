// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * GENESIS LUMINAL - DEMO TESTS CONFIGURATION (FUNCIONAL)
 * Baseada na configuração mínima que comprovadamente funciona
 */
module.exports = defineConfig({
  testDir: './tests/specialized',
  testMatch: ['**/demo-tests.spec.ts', '**/demo-simple.spec.js'],
  
  timeout: 30000,
  expect: { timeout: 5000 },
  
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
  
  projects: [
    {
      name: 'demo',
      use: { browserName: 'chromium' }
    }
  ]
});
