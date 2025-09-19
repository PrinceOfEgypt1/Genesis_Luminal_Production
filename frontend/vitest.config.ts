/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                     // ✅ CRÍTICO: Enable globals
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules/**',
      'dist/**', 
      'build/**',
      '**/*.d.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'src/**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70, 
          lines: 75,
          statements: 75
        }
      }
    }
  },
  // ✅ CRÍTICO: Define globals for TypeScript
  define: {
    'import.meta.vitest': false,
  },
})
