/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/__tests__/**',
        '**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.config.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        },
        './src/core/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        './src/components/': {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@core': '/src/core',
      '@infrastructure': '/src/infrastructure',
      '@presentation': '/src/presentation',
      '@shared': '/src/shared'
    }
  }
})
