/**
 * Teste Simples - Verificação de Elemento
 */

import { test, expect } from '@playwright/test';

test('verificar elemento main-content', async ({ page }) => {
  await page.goto('/');
  
  // Aguardar carregamento
  await page.waitForLoadState('networkidle');
  
  // Verificar elemento específico
  await expect(page.locator('#main-content')).toBeVisible({ timeout: 15000 });
  
  console.log('✅ Elemento #main-content encontrado e visível');
});

