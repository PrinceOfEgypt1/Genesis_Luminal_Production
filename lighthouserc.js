module.exports = {
  ci: {
    collect: {
      startServerCommand: 'cd backend && npm start',
      startServerReadyPattern: 'Server running on port',
      url: ['http://localhost:3000'],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance budgets
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        
        // Best practices
        'errors-in-console': 'error',
        'uses-https': 'error',
        'viewport': 'error',
        
        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        
        // PWA
        'installable-manifest': 'warn',
        'splash-screen': 'warn',
        'themed-omnibox': 'warn'
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci'
    }
  }
};
