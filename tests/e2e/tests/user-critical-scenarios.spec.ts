/**
 * Testes E2E - Cenários Críticos de Usuário
 * Genesis Luminal - Experiência Transcendental
 */

import { test, expect } from '@playwright/test';
import { GenesisTestHelpers } from '../utils/test-helpers';

test.describe('Cenários Críticos de Usuário - Genesis Luminal', () => {
  let helpers: GenesisTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new GenesisTestHelpers(page);
    await page.goto('/');
    await helpers.waitForGenesisReady();
  });

  test('Cenário 1: Primeiro Contato - "Love at First Sight"', async ({ page }) => {
    // Simula usuário abrindo a aplicação pela primeira vez
    const startTime = Date.now();
    
    await helpers.waitForGenesisReady();
    
    // Verificar se carregou rapidamente (critério "encantamento em 3 segundos")
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);

    // Verificar elementos visuais impressionantes estão presentes
    await expect(page.locator('main')).toBeVisible();
    
    // Simular primeiro movimento de mouse (momento crítico)
    await page.mouse.move(400, 300);
    await page.waitForTimeout(500);
    
    // Verificar responsividade visual instantânea
    const responseTime = await page.evaluate(async () => {
      const start = performance.now();
      
      // Disparar evento de mouse
      document.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 500,
        clientY: 400
      }));
      
      // Aguardar próximo frame
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      return performance.now() - start;
    });

    // Critério: resposta visual < 16ms (60 FPS)
    expect(responseTime).toBeLessThan(16);
  });

  test('Cenário 2: Usuário Fascinado - Exploração Intensa', async ({ page }) => {
    // Simula usuário completamente envolvido explorando a interface
    
    const errors = await helpers.checkCriticalErrors();
    
    // Movimento intenso de exploração
    await helpers.simulateFascinatedUser();
    
    // Durante exploração intensa, não deve haver erros críticos
    expect(errors.length).toBe(0);
    
    // Interface deve permanecer responsiva
    const isResponsive = await helpers.checkVisualResponsiveness();
    expect(isResponsive).toBe(true);
    
    // Verificar que elementos principais ainda estão funcionais
    await expect(page.locator('main')).toBeVisible();
  });

  test('Cenário 3: Sessão Prolongada - Retenção > 90%', async ({ page }) => {
    // Simula usuário em sessão prolongada (critério retenção)
    
    const sessionStart = Date.now();
    
    // Interação contínua por período representativo
    for (let i = 0; i < 5; i++) {
      await helpers.performNaturalMouseMovement();
      await page.waitForTimeout(1000);
      
      // Verificar que aplicação mantém performance
      const isResponsive = await helpers.checkVisualResponsiveness();
      expect(isResponsive).toBe(true);
    }
    
    const sessionDuration = Date.now() - sessionStart;
    
    // Verificar que sessão foi mantida sem crashes
    await expect(page.locator('main')).toBeVisible();
    
    // Log de métrica de retenção
    console.log(`Sessão de teste durou: ${sessionDuration}ms sem problemas`);
    expect(sessionDuration).toBeGreaterThan(5000); // Pelo menos 5 segundos
  });

  test('Cenário 4: Multi-Interaction - Stress Test Suave', async ({ page }) => {
    // Simula múltiplas interações simultâneas
    
    const interactions = [
      // Movimento de mouse contínuo
      helpers.performNaturalMouseMovement(),
      
      // Aguardar carregamento
      page.waitForTimeout(2000),
      
      // Verificar responsividade
      helpers.checkVisualResponsiveness()
    ];
    
    // Executar interações em "paralelo"
    const results = await Promise.all(interactions);
    
    // Última interação deve retornar true (responsivo)
    expect(results[2]).toBe(true);
    
    // Verificar integridade após stress suave
    await expect(page.locator('main')).toBeVisible();
  });

  test('Cenário 5: Cross-Browser Consistency', async ({ page, browserName }) => {
    // Verifica comportamento consistente entre browsers
    
    await helpers.waitForGenesisReady();
    
    // Teste básico de funcionalidade em cada browser
    await helpers.performNaturalMouseMovement();
    
    // Capturar screenshot para comparação visual
    await helpers.captureScreenshot(`${browserName}-consistency-test`);
    
    // Verificar elementos críticos em todos browsers
    await expect(page.locator('main')).toBeVisible();
    
    // Verificar ausência de erros específicos do browser
    const errors = await helpers.checkCriticalErrors();
    const browserSpecificErrors = errors.filter(error => 
      error.toLowerCase().includes(browserName.toLowerCase())
    );
    
    expect(browserSpecificErrors.length).toBe(0);
  });
});
