/**
 * Testes E2E - Performance Testing Automatizado
 * Genesis Luminal - Validação de Métricas Críticas
 */

import { test, expect } from '@playwright/test';
import { GenesisTestHelpers } from '../utils/test-helpers';

test.describe('Performance Testing - Genesis Luminal', () => {
  let helpers: GenesisTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GenesisTestHelpers(page);
  });

  test('Performance 1: Core Web Vitals - Limites Críticos', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Medir Core Web Vitals
    const metrics = await helpers.measureBasicPerformance();
    
    // Largest Contentful Paint deve ser < 2.5s (critério "encantamento em 3s")
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500);
      console.log(`LCP: ${metrics.lcp}ms`);
    }
    
    // Cumulative Layout Shift deve ser mínimo (estabilidade visual)
    if (metrics.cls !== undefined) {
      expect(metrics.cls).toBeLessThan(0.1);
      console.log(`CLS: ${metrics.cls}`);
    }
    
    // Tempo total de carregamento
    const totalLoadTime = Date.now() - startTime;
    expect(totalLoadTime).toBeLessThan(3000);
    console.log(`Tempo total de carregamento: ${totalLoadTime}ms`);
  });

  test('Performance 2: FPS Monitoring - 60 FPS Target', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Monitorar FPS durante interação intensa
    const fpsData = await page.evaluate(async () => {
      return new Promise<{avgFps: number, minFps: number}>(resolve => {
        const frames: number[] = [];
        let lastTime = performance.now();
        let frameCount = 0;
        
        function measureFrame() {
          const now = performance.now();
          const fps = 1000 / (now - lastTime);
          frames.push(fps);
          lastTime = now;
          frameCount++;
          
          if (frameCount < 60) { // Medir por ~1 segundo
            requestAnimationFrame(measureFrame);
          } else {
            const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;
            const minFps = Math.min(...frames);
            resolve({ avgFps, minFps });
          }
        }
        
        requestAnimationFrame(measureFrame);
        
        // Simular carga durante medição
        document.dispatchEvent(new MouseEvent('mousemove', {
          clientX: Math.random() * 800,
          clientY: Math.random() * 600
        }));
      });
    });
    
    console.log(`FPS Médio: ${fpsData.avgFps.toFixed(2)}`);
    console.log(`FPS Mínimo: ${fpsData.minFps.toFixed(2)}`);
    
    // Critério: FPS médio > 45 (próximo de 60 FPS ideal)
    expect(fpsData.avgFps).toBeGreaterThan(45);
    
    // Critério: FPS mínimo > 30 (não deve travar)
    expect(fpsData.minFps).toBeGreaterThan(30);
  });

  test('Performance 3: Memory Usage - Estabilidade', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Medir uso de memória inicial
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null;
    });
    
    // Simular uso intenso
    for (let i = 0; i < 10; i++) {
      await helpers.performNaturalMouseMovement();
      await page.waitForTimeout(100);
    }
    
    // Medir memória após uso
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null;
    });
    
    if (initialMemory && finalMemory) {
      const memoryGrowth = finalMemory.used - initialMemory.used;
      const growthPercentage = (memoryGrowth / initialMemory.used) * 100;
      
      console.log(`Crescimento de memória: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB (${growthPercentage.toFixed(2)}%)`);
      
      // Critério: crescimento de memória deve ser razoável (< 50MB para teste curto)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('Performance 4: Response Time - Latência Mouse→Visual', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Medir latência de resposta visual
    const responseTimes: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const responseTime = await page.evaluate(() => {
        const start = performance.now();
        
        // Simular movimento de mouse
        const event = new MouseEvent('mousemove', {
          clientX: Math.random() * 800,
          clientY: Math.random() * 600
        });
        
        document.dispatchEvent(event);
        
        // Aguardar próximo frame de renderização
        return new Promise<number>(resolve => {
          requestAnimationFrame(() => {
            resolve(performance.now() - start);
          });
        });
      });
      
      responseTimes.push(responseTime);
      await page.waitForTimeout(100);
    }
    
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    
    console.log(`Latência média mouse→visual: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Latência máxima: ${maxResponseTime.toFixed(2)}ms`);
    
    // Critério crítico: latência média < 16ms (60 FPS)
    expect(avgResponseTime).toBeLessThan(16);
    
    // Critério: picos de latência < 33ms (30 FPS mínimo)
    expect(maxResponseTime).toBeLessThan(33);
  });

  test('Performance 5: Network Efficiency', async ({ page }) => {
    // Monitorar requests de rede
    const requests: string[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });
    
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Interação que pode gerar requests
    await helpers.performNaturalMouseMovement();
    await page.waitForTimeout(2000);
    
    // Analisar eficiência de rede
    const uniqueRequests = new Set(requests);
    const duplicateRequests = requests.length - uniqueRequests.size;
    
    console.log(`Total requests: ${requests.length}`);
    console.log(`Requests únicos: ${uniqueRequests.size}`);
    console.log(`Requests duplicados: ${duplicateRequests}`);
    
    // Critério: não deve haver muitos requests duplicados (eficiência)
    const duplicateRatio = duplicateRequests / requests.length;
    expect(duplicateRatio).toBeLessThan(0.3); // Máximo 30% de duplicatas
    
    // Critério: número total de requests deve ser razoável
    expect(requests.length).toBeLessThan(50);
  });
});
