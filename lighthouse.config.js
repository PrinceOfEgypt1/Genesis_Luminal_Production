/**
 * Lighthouse CI Configuration - Genesis Luminal
 * Performance budget enforcement
 */

module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-gpu --headless',
        preset: 'desktop'
      }
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Performance budgets baseados no baseline 62 FPS
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        
        // Bundle size constraints
        'total-byte-weight': ['error', { maxNumericValue: 5242880 }], // 5MB
        'unused-javascript': ['warn', { maxNumericValue: 102400 }], // 100KB
        'legacy-javascript': ['warn', { maxNumericValue: 51200 }] // 50KB
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};

