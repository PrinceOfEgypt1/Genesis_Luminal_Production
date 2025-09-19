/**
 * GENESIS LUMINAL - SPECIALIZED TESTS CONFIGURATION
 * Configuração global para todos os testes especializados
 * 
 * @author Claude Sonnet 4
 * @version 1.0.0
 */

import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/specialized',
  
  // Configurações baseadas na performance real da aplicação
  timeout: 30000,
  expect: { timeout: 10000 },
  
  // Configurações de execução
  fullyParallel: false, // Testes de load não devem ser paralelos
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Configurações de relatório
  reporter: [
    ['html', { outputFolder: 'test-results/specialized' }],
    ['json', { outputFile: 'test-results/specialized-results.json' }],
    ['junit', { outputFile: 'test-results/specialized-junit.xml' }]
  ],
  
  outputDir: 'test-results/specialized-output',
  
  // Configurações globais
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Configurações específicas para Genesis Luminal
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Headers para testes de segurança
    extraHTTPHeaders: {
      'X-Test-Suite': 'Genesis-Luminal-Specialized'
    }
  },
  
  // Configuração de projetos separados
  projects: [
    {
      name: 'accessibility',
      testDir: './tests/specialized/accessibility',
      use: { 
        browserName: 'chromium',
        // Configurações específicas para testes de acessibilidade
        colorScheme: 'light'
      }
    },
    {
      name: 'performance',
      testDir: './tests/specialized/performance',
      use: { 
        browserName: 'chromium',
        // Configurações para testes de performance
        launchOptions: {
          args: ['--no-sandbox', '--disable-dev-shm-usage']
        }
      }
    },
    {
      name: 'load',
      testDir: './tests/specialized/load',
      use: { 
        browserName: 'chromium'
      }
    },
    {
      name: 'security',
      testDir: './tests/specialized/security',
      use: { 
        browserName: 'chromium'
      }
    }
  ],
  
  // Configuração de servidor web para testes
  webServer: [
    {
      command: 'npm run dev --workspace=apps/web',
      port: 5173,
      timeout: 30000,
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'npm run dev --workspace=apps/api',
      port: 3000,
      timeout: 30000,
      reuseExistingServer: !process.env.CI
    }
  ]
};

export default config;
