/**
 * Quality Gates Configuration - Genesis Luminal
 * Configurações centralizadas para enforcement de qualidade
 */

module.exports = {
  // Coverage thresholds
  coverage: {
    global: {
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    },
    individual: {
      lines: 70,
      functions: 70,
      branches: 65,
      statements: 70
    }
  },

  // Performance budgets
  performance: {
    fps: {
      minimum: 45,
      target: 60,
      maximum: 62
    },
    latency: {
      mouseToVisual: 16, // ms
      audioVisualSync: 20, // ms
      initialLoad: 3000 // ms
    },
    bundle: {
      maxSizeMB: 5,
      maxAssets: 50,
      maxChunks: 10
    }
  },

  // Lint rules enforcement
  lint: {
    maxWarnings: 0,
    maxErrors: 0,
    enforceRules: [
      '@typescript-eslint/no-unused-vars',
      '@typescript-eslint/no-explicit-any',
      'react-hooks/exhaustive-deps',
      'prefer-const',
      'no-var'
    ]
  },

  // TypeScript strict checks
  typescript: {
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true
  },

  // Security thresholds
  security: {
    maxVulnerabilities: {
      critical: 0,
      high: 0,
      moderate: 2,
      low: 5
    }
  }
};
