/**
 * Test Helpers - Genesis Luminal (CORREÇÃO PRECISA)
 * Fix: Elemento é #main-content, não apenas main
 */

import { Page, expect } from '@playwright/test';

export class GenesisTestHelpers {
  constructor(private page: Page) {}

  /**
   * Aguarda carregamento da aplicação Genesis - SELETOR CORRETO
   */
  async waitForGenesisReady(): Promise<void> {
    // Aguardar carregamento da rede
    await this.page.waitForLoadState('networkidle');
    
    // CORREÇÃO: Elemento correto é #main-content baseado no código
    await this.page.waitForSelector('#main-content', { timeout: 15000 });
    
    console.log('✅ Elemento #main-content encontrado');
    
    // Aguardar estabilização da aplicação
    await this.page.waitForTimeout(2000);
  }

  /**
   * Simula movimento de mouse natural
   */
  async performNaturalMouseMovement(): Promise<void> {
    const movements = [
      { x: 200, y: 200 },
      { x: 400, y: 300 },
      { x: 600, y: 200 },
      { x: 800, y: 400 },
      { x: 400, y: 500 }
    ];

    for (const movement of movements) {
      await this.page.mouse.move(movement.x, movement.y);
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Verifica ausência de erros críticos
   */
  async checkCriticalErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (this.isCriticalError(text)) {
          errors.push(text);
        }
      }
    });

    return errors;
  }

  private isCriticalError(error: string): boolean {
    const criticalPatterns = [
      'WebGL',
      'Canvas',
      'Three.js',
      'Uncaught',
      'TypeError',
      'ReferenceError',
      'Failed to fetch'
    ];

    return criticalPatterns.some(pattern => 
      error.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Mede performance básica
   */
  async measureBasicPerformance(): Promise<{avgFps: number, minFps: number}> {
    return await this.page.evaluate(async () => {
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
          
          if (frameCount < 60) {
            requestAnimationFrame(measureFrame);
          } else {
            const avgFps = frames.reduce((a, b) => a + b, 0) / frames.length;
            const minFps = Math.min(...frames);
            resolve({ avgFps, minFps });
          }
        }
        
        requestAnimationFrame(measureFrame);
      });
    });
  }

  /**
   * Verifica responsividade visual
   */
  async checkVisualResponsiveness(): Promise<boolean> {
    try {
      await this.performNaturalMouseMovement();
      await expect(this.page.locator('#main-content')).toBeVisible();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Simula usuário fascinado
   */
  async simulateFascinatedUser(): Promise<void> {
    // Movimentos rápidos de exploração
    const rapidMovements = Array.from({ length: 15 }, (_, i) => ({
      x: 100 + (i * 50) % 800,
      y: 100 + (i * 40) % 600
    }));

    for (const move of rapidMovements) {
      await this.page.mouse.move(move.x, move.y);
      await this.page.waitForTimeout(50);
    }

    // Pausa contemplativa
    await this.page.waitForTimeout(1000);
  }

  /**
   * Captura screenshot
   */
  async captureScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `tests/e2e/screenshots/${name}.png`,
      fullPage: false
    });
  }
}
