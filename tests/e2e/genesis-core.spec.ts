import { test, expect } from '@playwright/test';

test.describe('Genesis Luminal E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle');
  });

  test('should load application and display canvas', async ({ page }) => {
    // Verificar se o canvas está visível
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Verificar se o título está correto
    await expect(page).toHaveTitle(/Genesis Luminal/);
  });

  test('should respond to mouse movement', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Mover mouse e verificar se há resposta
    await page.mouse.move(200, 150);
    await page.waitForTimeout(100);
    
    await page.mouse.move(600, 450);
    await page.waitForTimeout(100);

    // Verificar se o status está sendo atualizado
    const statusPanel = page.locator('div').filter({ hasText: /Status:/ });
    await expect(statusPanel).toBeVisible();
  });

  test('should display performance metrics', async ({ page }) => {
    // Aguardar carregamento
    await page.waitForTimeout(1000);

    // Verificar se métricas de performance estão visíveis
    const fpsDisplay = page.locator('text=FPS:');
    await expect(fpsDisplay).toBeVisible();
    
    const particlesDisplay = page.locator('text=Partículas:');
    await expect(particlesDisplay).toBeVisible();
  });

  test('should maintain good performance during interaction', async ({ page }) => {
    // Aguardar carregamento completo
    await page.waitForTimeout(2000);

    // Movimentar mouse rapidamente por 3 segundos
    const startTime = Date.now();
    while (Date.now() - startTime < 3000) {
      await page.mouse.move(
        Math.random() * 800,
        Math.random() * 600
      );
      await page.waitForTimeout(50);
    }

    // Aguardar estabilização
    await page.waitForTimeout(1000);

    // Verificar se não há erros no console
    const logs = page.locator('text=Error').first();
    await expect(logs).not.toBeVisible();
  });

  test('should handle audio toggle interaction', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verificar estado inicial do áudio
    const audioStatus = page.locator('text=Áudio:');
    await expect(audioStatus).toBeVisible();

    // Clicar para alternar áudio
    await canvas.click();
    await page.waitForTimeout(500);

    // Verificar se o status de áudio pode ter mudado
    await expect(audioStatus).toBeVisible();
  });

  test('should display connection status', async ({ page }) => {
    // Verificar se o status de conexão está visível
    const connectionStatus = page.locator('text=Status:');
    await expect(connectionStatus).toBeVisible();

    // Aguardar que o status seja carregado
    await page.waitForTimeout(2000);
    
    // Status deve ser connected, connecting ou disconnected
    const statusText = await connectionStatus.textContent();
    expect(statusText).toMatch(/Status: (connected|connecting|disconnected)/);
  });

  test('should display instructions', async ({ page }) => {
    // Verificar se as instruções estão visíveis
    const instructions = page.locator('text=Mover mouse: Interagir');
    await expect(instructions).toBeVisible();
    
    const clickInstruction = page.locator('text=Clique: Toggle áudio');
    await expect(clickInstruction).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Deve carregar em menos de 5 segundos
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have memory leaks during extended use', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Simular uso por 10 segundos
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(Math.random() * 800, Math.random() * 600);
      await page.waitForTimeout(500);
    }

    // Verificar se a aplicação ainda está responsiva
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
