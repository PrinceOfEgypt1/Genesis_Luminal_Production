/**
 * Bundle Analyzer Configuration - Genesis Luminal
 * Monitoramento de tamanho de bundle
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  // Configuração para Vite
  vite: {
    rollupOptions: {
      plugins: [
        {
          name: 'bundle-analyzer',
          generateBundle(options, bundle) {
            const bundleSize = Object.values(bundle).reduce(
              (total, chunk) => total + (chunk.code?.length || 0), 
              0
            );
            
            const budgetMB = 5;
            const currentMB = bundleSize / (1024 * 1024);
            
            console.log(`📦 Bundle size: ${currentMB.toFixed(2)}MB`);
            
            if (currentMB > budgetMB) {
              throw new Error(
                `❌ Bundle size ${currentMB.toFixed(2)}MB exceeds budget ${budgetMB}MB`
              );
            }
            
            console.log(`✅ Bundle size within budget (${budgetMB}MB)`);
          }
        }
      ]
    }
  },

  // Thresholds baseados no projeto Genesis Luminal
  budgets: {
    maxSize: '5MB',
    maxAssets: 50,
    maxChunks: 10,
    
    // Alertas por tipo de asset
    javascript: '3MB',
    css: '500KB',
    images: '1MB',
    fonts: '200KB'
  },

  // Relatórios
  reports: {
    html: true,
    json: true,
    static: './bundle-analysis.html'
  }
};

