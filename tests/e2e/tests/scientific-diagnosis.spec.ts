/**
 * DIAGNÓSTICO CIENTÍFICO - Genesis Luminal E2E
 * Objetivo: Descobrir causa raiz definitiva
 */

import { test, expect } from '@playwright/test';

test.describe('Diagnóstico Científico - DOM Analysis', () => {
  test('DIAGNÓSTICO 1: Análise completa do DOM real', async ({ page }) => {
    console.log('\n🔬 INICIANDO DIAGNÓSTICO CIENTÍFICO');
    
    // Passo 1: Navegar para aplicação
    console.log('📍 Navegando para http://localhost:3000');
    await page.goto('/');
    
    // Passo 2: Aguardar carregamento básico
    console.log('⏱️ Aguardando carregamento básico...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 3 segundos para carregamento completo
    
    // Passo 3: Capturar informações básicas
    const url = page.url();
    const title = await page.title();
    console.log(`📊 URL atual: ${url}`);
    console.log(`📊 Título: ${title}`);
    
    // Passo 4: Capturar HTML COMPLETO atual
    const htmlContent = await page.content();
    console.log(`📊 Tamanho do HTML: ${htmlContent.length} caracteres`);
    console.log('📊 Primeiros 1000 caracteres do HTML:');
    console.log(htmlContent.substring(0, 1000));
    console.log('\n📊 Últimos 500 caracteres do HTML:');
    console.log(htmlContent.substring(htmlContent.length - 500));
    
    // Passo 5: Análise específica do elemento ROOT
    const rootElement = await page.locator('#root').count();
    console.log(`📊 Elemento #root encontrado: ${rootElement > 0 ? 'SIM' : 'NÃO'}`);
    
    if (rootElement > 0) {
      const rootContent = await page.locator('#root').innerHTML();
      console.log(`📊 Conteúdo #root (primeiros 500 chars):`);
      console.log(rootContent.substring(0, 500));
    }
    
    // Passo 6: Busca sistemática por elementos principais
    const selectors = [
      '#main-content',
      'main',
      '[role="application"]',
      '.App',
      '.genesis-core',
      'canvas',
      'div[class*="App"]',
      '#root > div',
      '#root > *'
    ];
    
    console.log('\n🔍 ANÁLISE SISTEMÁTICA DE SELETORES:');
    const elementResults: Record<string, boolean> = {};
    
    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      const exists = count > 0;
      elementResults[selector] = exists;
      console.log(`📊 ${selector}: ${exists ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'} (${count} elementos)`);
    }
    
    // Passo 7: Verificar erros de console
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Aguardar mais um pouco para capturar erros
    await page.waitForTimeout(2000);
    
    console.log(`\n📊 Erros de console capturados: ${consoleErrors.length}`);
    consoleErrors.forEach((error, index) => {
      console.log(`❌ Erro ${index + 1}: ${error}`);
    });
    
    // Passo 8: Verificar network requests
    const networkRequests: string[] = [];
    page.on('request', request => {
      networkRequests.push(request.url());
    });
    
    await page.waitForTimeout(1000);
    console.log(`\n📊 Network requests: ${networkRequests.length}`);
    networkRequests.slice(0, 10).forEach((url, index) => {
      console.log(`🌐 Request ${index + 1}: ${url}`);
    });
    
    // Passo 9: Capturar screenshot para evidência visual
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/scientific-diagnosis-full-page.png', 
      fullPage: true 
    });
    
    // Passo 10: Análise de performance
    const performanceInfo = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domElements: document.querySelectorAll('*').length
      };
    });
    
    console.log(`\n📊 PERFORMANCE ANALYSIS:`);
    console.log(`📊 DOM Content Loaded: ${performanceInfo.domContentLoaded}ms`);
    console.log(`📊 Load Complete: ${performanceInfo.loadComplete}ms`);
    console.log(`📊 Total DOM Elements: ${performanceInfo.domElements}`);
    
    // CONCLUSÕES DO DIAGNÓSTICO
    console.log('\n🎯 CONCLUSÕES DO DIAGNÓSTICO:');
    console.log(`📊 HTML não está vazio: ${htmlContent.length > 1000}`);
    console.log(`📊 Título da página: ${title}`);
    console.log(`📊 Elemento #root existe: ${elementResults['#root > *']}`);
    console.log(`📊 Elementos principais encontrados: ${Object.values(elementResults).filter(Boolean).length}/${selectors.length}`);
    
    // GERAR RELATÓRIO ESTRUTURADO
    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      url,
      title,
      htmlLength: htmlContent.length,
      elementsFound: elementResults,
      consoleErrorsCount: consoleErrors.length,
      consoleErrors: consoleErrors.slice(0, 5), // Primeiros 5 erros
      networkRequestsCount: networkRequests.length,
      performance: performanceInfo,
      conclusion: elementResults['#main-content'] ? 'ELEMENTO_ENCONTRADO' : 'ELEMENTO_AUSENTE'
    };
    
    console.log('\n📋 RELATÓRIO COMPLETO:');
    console.log(JSON.stringify(diagnosticReport, null, 2));
    
    // TESTE CONDICIONAL: Se encontrou algum elemento principal, teste passou
    const foundMainElements = Object.entries(elementResults)
      .filter(([selector, found]) => found && (selector.includes('main') || selector.includes('App') || selector === '#root > *'))
      .length;
    
    expect(foundMainElements).toBeGreaterThan(0);
  });

  test('DIAGNÓSTICO 2: Teste de WebServer vs Manual', async ({ page }) => {
    console.log('\n🔬 DIAGNÓSTICO: WebServer vs Aplicação Manual');
    
    // Este teste assume que aplicação está rodando manualmente
    // Se falhar, problema é no webServer automático do Playwright
    
    try {
      await page.goto('http://localhost:3000', { timeout: 10000 });
      const title = await page.title({ timeout: 5000 });
      console.log(`📊 Aplicação manual - Título: ${title}`);
      
      const rootExists = await page.locator('#root').count() > 0;
      console.log(`📊 Aplicação manual - #root existe: ${rootExists}`);
      
      expect(rootExists).toBe(true);
    } catch (error) {
      console.log(`❌ Aplicação manual não acessível: ${error}`);
      throw error;
    }
  });
});

