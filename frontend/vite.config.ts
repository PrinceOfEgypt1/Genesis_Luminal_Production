/**
 * @fileoverview Configuração Vite + Vitest para frontend - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // Configuração de desenvolvimento
  server: {
    port: 3000,
    host: true,
  },
  
  // Resolução de aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'src/__tests__'),
    },
  },
  
  // Configuração de testes com Vitest
  test: {
    // Ambiente de teste
    environment: 'jsdom',
    
    // Setup files
    setupFiles: ['./src/__tests__/setup.ts'],
    
    // Padrões de arquivos de teste
    include: [
      'src/**/__tests__/**/*.{js,ts,jsx,tsx}',
      'src/**/*.(test|spec).{js,ts,jsx,tsx}'
    ],
    
    // Exclusões
    exclude: [
      'node_modules',
      'dist',
      'build',
    ],
    
    // Configuração de cobertura
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json-summary'],
      reportsDirectory: 'coverage',
      
      // Arquivos incluídos na cobertura
      include: [
        'src/**/*.{ts,tsx,js,jsx}',
      ],
      
      // Exclusões da cobertura
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/**/node_modules/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      
      // Thresholds de cobertura (Meta: 80%)
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    
    // Globals para testes
    globals: true,
    
    // Timeout
    testTimeout: 10000,
  },
});
