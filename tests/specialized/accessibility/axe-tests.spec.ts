/**
 * GENESIS LUMINAL - ACCESSIBILITY TESTS
 * Testes de acessibilidade usando axe-core para compliance WCAG 2.1 AA
 * 
 * @author Claude Sonnet 4
 * @version 1.0.0
 * @compliance WCAG 2.1 AA
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests - Genesis Luminal', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('http://localhost:5173');
    
    // Aguardar carregamento completo (baseado na performance real)
    await page.waitForTimeout(2000);
    
    // Verificar se a aplicação carregou
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should not have accessibility violations on main page', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading structure', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['keyboard', 'focus-order-semantics'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-valid-attr', 'aria-valid-attr-value'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should work with screen readers', async ({ page }) => {
    // Verificar se elementos críticos têm labels apropriados
    const canvas = page.locator('canvas').first();
    await expect(canvas).toHaveAttribute('role', 'img');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-hidden-body'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
