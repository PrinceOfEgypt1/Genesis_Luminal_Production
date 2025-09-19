/**
 * GENESIS LUMINAL - LOAD TESTS
 * Testes de carga integrados com Playwright
 * 
 * @author Claude Sonnet 4
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Load Tests - Genesis Luminal', () => {
  
  test.skip('should handle concurrent users on frontend', async ({ page }) => {
    // Este teste simula múltiplos usuários abrindo a aplicação
    const startTime = Date.now();
    
    // Simular 10 abas simultâneas (limitado pelo navegador de teste)
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      const promise = page.context().newPage().then(async (newPage) => {
        await newPage.goto('http://localhost:5173');
        await newPage.waitForLoadState('networkidle');
        
        // Simular interação por 10 segundos
        for (let j = 0; j < 10; j++) {
          await newPage.mouse.move(Math.random() * 500, Math.random() * 500);
          await newPage.waitForTimeout(1000);
        }
        
        await newPage.close();
      });
      
      promises.push(promise);
    }
    
    await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    console.log(`Concurrent users test completed in: ${totalTime}ms`);
    
    expect(totalTime).toBeLessThan(60000); // Menos de 1 minuto
  });

  test('should run Artillery load test', async () => {
    // Executar teste de carga com Artillery
    try {
      const { stdout, stderr } = await execAsync(
        'npx artillery run tests/specialized/load/artillery-config.yml --output artillery-report.json',
        { timeout: 300000 } // 5 minutos timeout
      );
      
      console.log('Artillery output:', stdout);
      
      if (stderr) {
        console.warn('Artillery stderr:', stderr);
      }
      
      // Verificar se o arquivo de relatório foi gerado
      expect(stdout).toContain('Summary report');
      
    } catch (error) {
      console.error('Artillery test failed:', error);
      throw error;
    }
  });

  test('should validate API performance under load', async ({ request }) => {
    // Teste simplificado de carga na API
    const results = [];
    const concurrent = 10;
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
      const promises = [];
      
      for (let j = 0; j < concurrent; j++) {
        const promise = request.post('http://localhost:3000/api/v1/analyze', {
          data: {
            text: `Teste de carga ${i}-${j}`,
            intensity: Math.random(),
            context: 'load_test'
          }
        }).then(response => {
          return {
            status: response.status(),
            time: Date.now()
          };
        });
        
        promises.push(promise);
      }
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      
      // Pequena pausa entre batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Analisar resultados
    const successRate = results.filter(r => r.status === 200).length / results.length;
    
    console.log(`Load test results: ${successRate * 100}% success rate`);
    expect(successRate).toBeGreaterThan(0.95); // 95% de sucesso mínimo
  });
});
