/**
 * Test Helpers para E2E Tests - Genesis Luminal
 * Utilitários para testes críticos de experiência transcendental
 */

import { Page, expect } from '@playwright/test';

export class GenesisTestHelpers {
  constructor(private page: Page) {}

  /**
   * Aguarda carregamento completo da aplicação Genesis
   */
  async waitForGenesisReady(): Promise<void> {
    // Aguardar carregamento da rede
    await this.page.waitForLoadState('networkidle');
    
    // Aguardar elementos críticos
    await this.page.waitForSelector('main', { timeout: 10000 });
    
    // Aguardar pelo menos 2 segundos para inicialização dos sistemas
    await this.page.waitForTimeout(2000);
  }

  /**
   * Simula movimento de mouse natural para ativar responsividade visual
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
      await this.page.waitForTimeout(200); // 200ms entre movimentos
    }
  }

  /**
   * Verifica ausência de erros críticos de console
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

  /**
   * Determina se um erro de console é crítico
   */
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
   * Mede performance básica da aplicação
   */
  async measureBasicPerformance(): Promise<{
    lcp?: number;
    fid?: number;
    cls?: number;
  }> {
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics: any = {};
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries[entries.length - 1];
          if (lcp) {
            metrics.lcp = lcp.startTime;
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let cls = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            }
          }
          metrics.cls = cls;
        }).observe({ entryTypes: ['layout-shift'] });

        // Timeout para coletar métricas
        setTimeout(() => resolve(metrics), 3000);
      });
    });
  }

  /**
   * Verifica responsividade visual básica
   */
  async checkVisualResponsiveness(): Promise<boolean> {
    try {
      // Simular movimento e verificar se não há travamentos
      await this.performNaturalMouseMovement();
      
      // Verificar se elementos ainda estão visíveis
      await expect(this.page.locator('main')).toBeVisible();
      
      // Verificar se não há overlays de erro
      const errorOverlays = await this.page.locator('[data-testid="error-overlay"]').count();
      return errorOverlays === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Captura screenshot para comparação visual
   */
  async captureScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `tests/e2e/screenshots/${name}.png`,
      fullPage: false
    });
  }

  /**
   * Simula interação típica de usuário fascinado
   */
  async simulateFascinatedUser(): Promise<void> {
    // Usuário move mouse rapidamente explorando
    const rapidMovements = Array.from({ length: 20 }, (_, i) => ({
      x: 100 + (i * 50) % 800,
      y: 100 + (i * 30) % 600
    }));

    for (const move of rapidMovements) {
      await this.page.mouse.move(move.x, move.y);
      await this.page.waitForTimeout(50); // Movimento rápido
    }

    // Pausa como se estivesse admirando
    await this.page.waitForTimeout(1000);

    // Movimento mais lento, contemplativo
    await this.page.mouse.move(400, 300);
    await this.page.waitForTimeout(500);
    await this.page.mouse.move(500, 350);
    await this.page.waitForTimeout(500);
  }
}

/**
 * Matcher customizado para verificar performance
 */
export const performanceMatchers = {
  toBeFast: (received: number, threshold: number = 2500) => {
    const pass = received < threshold;
    return {
      pass,
      message: () => 
        `Expected ${received}ms to be ${pass ? 'not ' : ''}less than ${threshold}ms`
    };
  },

  toBeResponsive: (received: number, threshold: number = 100) => {
    const pass = received < threshold;
    return {
      pass,
      message: () => 
        `Expected response time ${received}ms to be ${pass ? 'not ' : ''}less than ${threshold}ms`
    };
  }
};
