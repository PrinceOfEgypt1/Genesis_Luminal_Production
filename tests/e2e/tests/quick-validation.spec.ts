/**
 * Teste de Validação - Genesis Luminal (CANVAS CORRIGIDO)
 * Fix: canvas → canvas.first() para múltiplos elementos
 */

import { test, expect } from '@playwright/test';
import { GenesisTestHelpers } from '../utils/test-helpers';

test.describe('Validação - Seletores Corretos (Canvas Fix)', () => {
  test('validar elementos reais da aplicação', async ({ page }) => {
    const helpers = new GenesisTestHelpers(page);
    
    console.log('🔍 Testando seletores com canvas múltiplo corrigido...');
    
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Verificar elementos únicos
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('#root > div')).toBeVisible();
    
    // FIX: canvas.first() para elementos múltiplos
    await expect(page.locator('canvas').first()).toBeVisible();
    
    // Verificar que há exatamente 2 canvas (diagnóstico confirmou)
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount).toBe(2);
    console.log(`📊 Canvas elements encontrados: ${canvasCount} (esperado: 2)`);
    
    // Confirmar que aplicação está funcionalmente carregada
    const isLoaded = await helpers.isApplicationLoaded();
    expect(isLoaded).toBe(true);
    
    // Teste básico de interatividade
    await helpers.performNaturalMouseMovement();
    
    // Verificar responsividade
    const isResponsive = await helpers.checkVisualResponsiveness();
    expect(isResponsive).toBe(true);
    
    console.log('✅ Validação concluída - aplicação funcional');
  });

  test('teste de performance - mantido funcionando', async ({ page }) => {
    const helpers = new GenesisTestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Medir FPS básico
    const performance = await helpers.measureBasicPerformance();
    
    console.log(`📊 FPS médio: ${performance.avgFps.toFixed(2)}`);
    console.log(`📊 FPS mínimo: ${performance.minFps.toFixed(2)}`);
    
    // Critérios realistas para aplicação visual
    expect(performance.avgFps).toBeGreaterThan(20);
    expect(performance.minFps).toBeGreaterThan(10);
  });

  test('análise completa da estrutura DOM', async ({ page }) => {
    await page.goto('/');
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Análise estrutural
    const domAnalysis = await page.evaluate(() => {
      const root = document.getElementById('root');
      const canvasElements = document.querySelectorAll('canvas');
      const totalElements = document.querySelectorAll('*').length;
      
      return {
        rootExists: !!root,
        rootHasChildren: root ? root.children.length > 0 : false,
        canvasCount: canvasElements.length,
        totalDOMElements: totalElements,
        canvasSizes: Array.from(canvasElements).map(canvas => ({
          width: canvas.width,
          height: canvas.height
        }))
      };
    });
    
    console.log('📊 ANÁLISE DOM COMPLETA:', JSON.stringify(domAnalysis, null, 2));
    
    // Validações estruturais
    expect(domAnalysis.rootExists).toBe(true);
    expect(domAnalysis.rootHasChildren).toBe(true);
    expect(domAnalysis.canvasCount).toBe(2);
    expect(domAnalysis.totalDOMElements).toBeGreaterThan(50);
    
    // Verificar tamanhos dos canvas
    domAnalysis.canvasSizes.forEach((size, index) => {
      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThan(0);
      console.log(`📊 Canvas ${index + 1}: ${size.width}x${size.height}`);
    });
  });
});
