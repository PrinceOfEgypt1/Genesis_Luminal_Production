/**
 * Testes E2E básicos - Genesis Luminal
 */

import { test, expect } from '@playwright/test';

test('aplicação carrega corretamente', async ({ page }) => {
  await page.goto('/');
  
  // Verificar se o título está presente
  await expect(page).toHaveTitle(/Genesis Luminal/);
  
  // Verificar se elementos principais estão visíveis
  await expect(page.locator('h1')).toBeVisible();
});

test('performance básica', async ({ page }) => {
  await page.goto('/');
  
  // Aguardar carregamento completo
  await page.waitForLoadState('networkidle');
  
  // Verificar se não há erros de console críticos
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Simular interação básica
  await page.mouse.move(100, 100);
  await page.waitForTimeout(1000);
  
  // Verificar ausência de erros críticos
  const criticalErrors = errors.filter(error => 
    !error.includes('404') && !error.includes('favicon')
  );
  expect(criticalErrors).toHaveLength(0);
});
