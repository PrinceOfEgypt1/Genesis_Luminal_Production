/**
 * GENESIS LUMINAL - LIGHTHOUSE CI CONFIGURATION
 * Configuração de budgets de performance baseados na performance real
 * Baseline: 62 FPS médio, latência 5ms
 * 
 * @author Claude Sonnet 4
 * @version 1.0.0
 */

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5173',
        'http://localhost:5173/#/experience'
      ],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Local:',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        // Performance budgets baseados na aplicação real
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.80 }],
        
        // Métricas Core Web Vitals - baseadas na performance real
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Métricas específicas para Genesis Luminal
        'speed-index': ['warn', { maxNumericValue: 2500 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        
        // Budgets de recursos
        'resource-summary:document:size': ['warn', { maxNumericValue: 50000 }],
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }],
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 50000 }],
        'resource-summary:image:size': ['warn', { maxNumericValue: 200000 }],
        'resource-summary:font:size': ['warn', { maxNumericValue: 100000 }],
        
        // Performance específica para Canvas/WebGL
        'unused-javascript': ['warn', { maxNumericValue: 0.2 }],
        'efficient-animated-content': 'off', // Canvas animado é esperado
        'non-composited-animations': 'off'   // Animações WebGL são esperadas
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};

