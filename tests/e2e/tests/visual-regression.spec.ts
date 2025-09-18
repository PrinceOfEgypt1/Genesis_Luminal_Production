/**
 * Testes E2E - Visual Regression Testing
 * Genesis Luminal - Validação de Consistência Visual
 */

import { test, expect } from '@playwright/test';
import { GenesisTestHelpers } from '../utils/test-helpers';

test.describe('Visual Regression - Genesis Luminal', () => {
  let helpers: GenesisTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GenesisTestHelpers(page);
    
    // Configurar viewport consistente para screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Visual 1: Estado Inicial - Baseline Screenshot', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Aguardar estabilização visual
    await page.waitForTimeout(1000);
    
    // Screenshot do estado inicial
    await expect(page).toHaveScreenshot('genesis-initial-state.png', {
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    });
  });

  test('Visual 2: Estado Após Interação - Mouse Movement', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Movimento padronizado de mouse para teste consistente
    await page.mouse.move(400, 300);
    await page.waitForTimeout(500);
    await page.mouse.move(600, 400);
    await page.waitForTimeout(500);
    
    // Screenshot após interação
    await expect(page).toHaveScreenshot('genesis-after-interaction.png', {
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    });
  });

  test('Visual 3: Cross-Browser Consistency Check', async ({ page, browserName }) => {
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Interação padronizada
    await helpers.performNaturalMouseMovement();
    await page.waitForTimeout(1000);
    
    // Screenshot específico do browser
    await expect(page).toHaveScreenshot(`genesis-${browserName}-consistency.png`, {
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    });
  });

  test('Visual 4: Mobile Viewport - Responsive Design', async ({ page }) => {
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Interação mobile (touch simulation)
    await page.touchscreen.tap(200, 300);
    await page.waitForTimeout(500);
    
    // Screenshot mobile
    await expect(page).toHaveScreenshot('genesis-mobile-view.png', {
      fullPage: false,
      clip: { x: 0, y: 0, width: 375, height: 667 }
    });
  });

  test('Visual 5: Error State Handling', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForGenesisReady();
    
    // Simular condição que pode causar erro visual
    await page.evaluate(() => {
      // Forçar erro não crítico para testar handling
      window.dispatchEvent(new Event('resize'));
    });
    
    await page.waitForTimeout(1000);
    
    // Verificar que interface ainda está visualmente estável
    await expect(page).toHaveScreenshot('genesis-error-handling.png', {
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    });
    
    // Verificar que elementos críticos ainda estão presentes
    await expect(page.locator('main')).toBeVisible();
  });
});

// Configuração específica para testes visuais
test.use({
  // Desabilitar animações para screenshots consistentes
  reducedMotion: 'reduce'
});
