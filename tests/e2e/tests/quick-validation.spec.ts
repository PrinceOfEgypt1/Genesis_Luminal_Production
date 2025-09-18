/**
 * Teste de Validação Rápida - Genesis Luminal
 * Confirma que seletores corretos funcionam
 */

import { test, expect } from '@playwright/test';
import { GenesisTestHelpers } from '../utils/test-helpers';

test.describe('Validação Rápida - Seletores Corretos', () => {
  test('validar elementos reais da aplicação', async ({ page }) => {
    const helpers = new GenesisTestHelpers(page);
    
    console.log('🔍 Testando seletores baseados em evidência científica...');
    
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Verificar elementos que realmente existem
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('#root > div')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    
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

  test('teste de performance básica', async ({ page }) => {
    const helpers = new GenesisTestHelpers(page);
    
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Medir FPS básico
    const performance = await helpers.measureBasicPerformance();
    
    console.log(`📊 FPS médio: ${performance.avgFps.toFixed(2)}`);
    console.log(`📊 FPS mínimo: ${performance.minFps.toFixed(2)}`);
    
    // Critérios realistas para aplicação visual
    expect(performance.avgFps).toBeGreaterThan(20); // Mínimo aceitável
    expect(performance.minFps).toBeGreaterThan(10);  // Não deve travar
  });
});
