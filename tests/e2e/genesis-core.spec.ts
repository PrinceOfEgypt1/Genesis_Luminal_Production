import { test, expect } from '@playwright/test'

test.describe('Genesis Core E2E Tests', () => {
  test('should load the application successfully', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se a página carrega
    await expect(page).toHaveTitle(/Genesis Luminal/i)
    
    // Verificar se o container principal existe
    await expect(page.locator('main')).toBeVisible()
  })

  test('should respond to mouse movement', async ({ page }) => {
    await page.goto('/')
    
    // Aguardar carregamento completo
    await page.waitForLoadState('networkidle')
    
    // Mover mouse
    await page.mouse.move(400, 300)
    await page.mouse.move(500, 400)
    
    // Verificar se não há erros de console críticos
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Aguardar um pouco para processar movimentos
    await page.waitForTimeout(1000)
    
    // Não deve haver erros críticos de renderização
    const criticalErrors = errors.filter(err => 
      err.includes('WebGL') || err.includes('Canvas') || err.includes('Three.js')
    )
    expect(criticalErrors.length).toBe(0)
  })

  test('should maintain performance', async ({ page }) => {
    await page.goto('/')
    
    // Medir Core Web Vitals básicos
    const performance = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint')
          if (lcp) {
            resolve({ lcp: lcp.startTime })
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // Timeout após 5 segundos
        setTimeout(() => resolve({ lcp: null }), 5000)
      })
    })
    
    // LCP deve ser razoável (< 2.5s)
    if (performance.lcp) {
      expect(performance.lcp).toBeLessThan(2500)
    }
  })
})

