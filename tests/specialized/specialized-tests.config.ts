/**
 * GENESIS LUMINAL - SPECIALIZED TESTS CONFIGURATION (CORRIGIDO)
 * Configuração corrigida para estrutura frontend/ e backend/
 * Compatível com WSL/Ubuntu
 * 
 * @author Claude Sonnet 4
 * @version 2.0.0 - ESTRUTURA CORRIGIDA
 */

import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/specialized',
  
  // Configurações baseadas na performance real da aplicação
  timeout: 60000,       // Aumentado para WSL
  expect: { timeout: 15000 },  // Aumentado para WSL
  
  // Configurações de execução
  fullyParallel: false, // Testes de load não devem ser paralelos
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,  // Retry em WSL
  workers: 1,  // Forçar sequencial em WSL
  
  // Configurações de relatório
  reporter: [
    ['html', { outputFolder: 'test-results/specialized' }],
    ['json', { outputFile: 'test-results/specialized-results.json' }],
    ['junit', { outputFile: 'test-results/specialized-junit.xml' }],
    ['list']  // Adicionar output no console
  ],
  
  outputDir: 'test-results/specialized-output',
  
  // Configurações globais para WSL
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
    },
    
    // Configurações para WSL/headless
    launchOptions: {
      headless: true,  // Forçar headless em WSL
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gpu',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    }
  },
  
  // Configuração de projetos separados
  projects: [
    {
      name: 'accessibility',
      testDir: './tests/specialized/accessibility',
      use: { 
        browserName: 'chromium',
        colorScheme: 'light'
      }
    },
    {
      name: 'performance-custom',  // Renomeado para evitar conflito com Lighthouse
      testDir: './tests/specialized/performance',
      testMatch: '**/performance-tests.spec.ts',  // Apenas testes customizados
      use: { 
        browserName: 'chromium'
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
  
  // CORREÇÃO: Usar estrutura real frontend/ e backend/
  webServer: [
    {
      command: 'cd frontend && npm run dev',  // CORRIGIDO: era apps/web
      port: 5173,
      timeout: 60000,  // Aumentado para WSL
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe'
    },
    {
      command: 'cd backend && npm run dev',   // CORRIGIDO: era apps/api  
      port: 3001,  // CORRIGIDO: backend usa porta 3001
      timeout: 60000,  // Aumentado para WSL
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ]
};

export default config;
