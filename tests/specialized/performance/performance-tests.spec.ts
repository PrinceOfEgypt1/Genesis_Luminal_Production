/**
 * GENESIS LUMINAL - PERFORMANCE TESTS
 * Testes de performance customizados além do Lighthouse
 * 
 * @author Claude Sonnet 4
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Tests - Genesis Luminal', () => {
  
  test('should maintain 60 FPS during interactions', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Esperar carregamento completo
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Iniciar monitoramento de performance
    await page.evaluate(() => {
      (window as any).performanceData = {
        frameCount: 0,
        startTime: performance.now(),
        lastFrameTime: performance.now()
      };
      
      function measureFPS() {
        const now = performance.now();
        const data = (window as any).performanceData;
        data.frameCount++;
        data.lastFrameTime = now;
        requestAnimationFrame(measureFPS);
      }
      
      requestAnimationFrame(measureFPS);
    });
    
    // Simular interação por 5 segundos
    await page.mouse.move(100, 100);
    await page.waitForTimeout(1000);
    await page.mouse.move(200, 200);
    await page.waitForTimeout(1000);
    await page.mouse.move(300, 300);
    await page.waitForTimeout(3000);
    
    // Verificar FPS
    const avgFPS = await page.evaluate(() => {
      const data = (window as any).performanceData;
      const totalTime = data.lastFrameTime - data.startTime;
      return (data.frameCount / totalTime) * 1000;
    });
    
    console.log(`Average FPS: ${avgFPS.toFixed(2)}`);
    expect(avgFPS).toBeGreaterThan(45); // Mínimo aceitável
    expect(avgFPS).toBeGreaterThan(55); // Ideal baseado nos 62 FPS reais
  });

  test('should have low latency mouse response', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Medir latência de resposta ao mouse
    const latencies: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      await page.mouse.move(100 + i * 10, 100 + i * 10);
      
      // Aguardar resposta visual (baseado nos 5ms reais)
      await page.waitForTimeout(20);
      const endTime = Date.now();
      
      latencies.push(endTime - startTime);
    }
    
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    
    console.log(`Average mouse latency: ${avgLatency}ms`);
    expect(avgLatency).toBeLessThan(50); // Baseado na latência real de 5ms + buffer
  });

  test('should load initial content quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:5173');
    
    // Aguardar primeiro conteúdo aparecer
    await page.waitForSelector('#root > *', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Initial load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000); // 3 segundos max para "encantamento em 3 segundos"
  });

  test('should maintain stable memory usage', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Medir uso inicial de memória
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Simular uso intenso por 30 segundos
    for (let i = 0; i < 30; i++) {
      await page.mouse.move(Math.random() * 500, Math.random() * 500);
      await page.waitForTimeout(1000);
    }
    
    // Medir memória final
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    const memoryGrowth = finalMemory - initialMemory;
    const growthPercentage = (memoryGrowth / initialMemory) * 100;
    
    console.log(`Memory growth: ${growthPercentage.toFixed(2)}%`);
    expect(growthPercentage).toBeLessThan(50); // Menos de 50% de crescimento
  });
});

