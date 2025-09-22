import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Configuração específica para standardized-audio-context
    dedupe: ['standardized-audio-context']
  },
  optimizeDeps: {
    // Forçar pré-bundling de dependências problemáticas
    include: ['standardized-audio-context'],
    exclude: []
  },
  build: {
    rollupOptions: {
      // Configuração específica para módulos problemáticos
      external: (id) => {
        // Se standardized-audio-context causar problemas, tratar como externo
        if (id.includes('standardized-audio-context') && id.includes('backup-offline')) {
          return true;
        }
        return false;
      }
    }
  },
  define: {
    // Definir variáveis globais se necessário
    global: 'globalThis',
  }
})
