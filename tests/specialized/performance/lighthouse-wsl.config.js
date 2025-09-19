/**
 * GENESIS LUMINAL - LIGHTHOUSE WSL CONFIGURATION
 * Configuração especial para WSL/headless environment
 * 
 * @author Claude Sonnet 4
 * @version 2.0.0 - WSL COMPATIBLE
 */

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5173'
      ],
      startServerCommand: 'cd frontend && npm run dev',  // CORRIGIDO
      startServerReadyPattern: 'Local.*5173',
      numberOfRuns: 1,  // Reduzido para WSL
      settings: {
        // Configurações específicas para WSL
        chromeFlags: [
          '--headless',
          '--no-sandbox', 
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          '--remote-debugging-port=9222'
        ],
        // Timeouts aumentados para WSL
        maxWaitForLoad: 60000,
        maxWaitForFcp: 30000
      }
    },
    assert: {
      assertions: {
        // Performance budgets relaxados para WSL
        'categories:performance': ['warn', { minScore: 0.7 }],  // Relaxado
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['off'],  // Desabilitado para testes
        
        // Métricas relaxadas para WSL
        'first-contentful-paint': ['warn', { maxNumericValue: 4000 }],  // Relaxado
        'largest-contentful-paint': ['warn', { maxNumericValue: 6000 }], // Relaxado
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.2 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],  // Relaxado
        
        // Budgets de recursos relaxados
        'resource-summary:script:size': ['warn', { maxNumericValue: 1000000 }], // 1MB
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }]
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: './test-results/lighthouse'
    }
  }
};
