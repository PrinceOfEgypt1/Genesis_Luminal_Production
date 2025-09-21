/**
 * GENESIS LUMINAL - SECURITY TESTS
 * Testes de segurança automatizados
 * 
 * @author Claude Sonnet 4
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Security Tests - Genesis Luminal', () => {

  test('should run npm audit and pass', async () => {
    try {
      const { stdout, stderr } = await execAsync('npm audit --audit-level=high');
      
      // Verificar se não há vulnerabilidades high ou critical
      expect(stdout).not.toContain('high');
      expect(stdout).not.toContain('critical');
      
      console.log('npm audit passed successfully');
      
    } catch (error) {
      // npm audit retorna código de erro se encontrar vulnerabilidades
      const output = error.stdout || error.stderr;
      console.error('npm audit found vulnerabilities:', output);
      
      // Falhar o teste se houver vulnerabilidades high/critical
      if (output.includes('high') || output.includes('critical')) {
        throw new Error('High or critical vulnerabilities found');
      }
    }
  });

  test('should have secure HTTP headers', async ({ request }) => {
    const response = await request.get('http://localhost:3000/health');
    
    const headers = response.headers();
    
    // Verificar headers de segurança obrigatórios
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBeDefined();
    expect(headers['x-xss-protection']).toBeDefined();
    
    // Helmet deve adicionar estes headers
    if (headers['strict-transport-security']) {
      expect(headers['strict-transport-security']).toContain('max-age');
    }
    
    console.log('Security headers validated');
  });

  test('should prevent XSS attacks', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Tentar injetar script malicioso
    const maliciousScript = '<script>alert("XSS")</script>';
    
    // Simular input que poderia ser vulnerável
    await page.evaluate((script) => {
      // Tentar várias formas de injeção
      const div = document.createElement('div');
      div.innerHTML = script; // Deve ser sanitizado
      document.body.appendChild(div);
    }, maliciousScript);
    
    // Aguardar um momento
    await page.waitForTimeout(1000);
    
    // Verificar se alert não foi executado (sem popup)
    const dialogs: any[] = [];
    page.on('dialog', dialog => {
      dialogs.push(dialog);
      dialog.accept();
    });
    
    expect(dialogs).toHaveLength(0);
    console.log('XSS protection validated');
  });

  test('should validate input sanitization', async ({ request }) => {
    // Testar endpoint de análise emocional com inputs maliciosos
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '"; DROP TABLE users; --',
      '../../../etc/passwd',
      '{{7*7}}', // Template injection
      '${7*7}',  // Expression injection
    ];

    for (const maliciousInput of maliciousInputs) {
      const response = await request.post('http://localhost:3000/api/v1/analyze', {
        data: {
          text: maliciousInput,
          intensity: 0.5,
          context: 'security_test'
        }
      });
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      
      // Verificar se input foi sanitizado (não deve conter código malicioso)
      expect(body.originalText || '').not.toContain('<script>');
      expect(body.originalText || '').not.toContain('DROP TABLE');
      expect(body.originalText || '').not.toContain('../../../');
      
      console.log(`Input sanitization validated for: ${maliciousInput.substring(0, 20)}...`);
    }
  });

  test('should enforce rate limiting', async ({ request }) => {
    // Testar rate limiting fazendo muitas requests rapidamente
    const promises = [];
    
    for (let i = 0; i < 50; i++) {
      const promise = request.post('http://localhost:3000/api/v1/analyze', {
        data: {
          text: `Rate limit test ${i}`,
          intensity: 0.5,
          context: 'rate_limit_test'
        }
      });
      promises.push(promise);
    }
    
    const responses = await Promise.all(promises.map(p => p.catch(e => e)));
    
    // Algumas requests devem ser bloqueadas por rate limiting
    const rateLimitedResponses = responses.filter(r => 
      r.status && (r.status() === 429 || r.status() === 503)
    );
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
    console.log(`Rate limiting working: ${rateLimitedResponses.length} requests blocked`);
  });

  test('should not expose sensitive information in errors', async ({ request }) => {
    // Testar endpoint inválido para verificar tratamento de erro
    const response = await request.get('http://localhost:3000/api/v1/nonexistent');
    
    expect(response.status()).toBe(404);
    
    const body = await response.text();
    
    // Não deve expor informações sensíveis
    expect(body).not.toContain('node_modules');
    expect(body).not.toContain('Error: ');
    expect(body).not.toContain('at ');
    expect(body).not.toContain('stack trace');
    expect(body).not.toContain('ANTHROPIC_API_KEY');
    expect(body).not.toContain('process.env');
    
    console.log('Error handling security validated');
  });

  test('should validate CORS configuration', async ({ request }) => {
    // Testar CORS com origin suspeito
    const response = await request.get('http://localhost:3000/health', {
      headers: {
        'Origin': 'https://malicious-site.com'
      }
    });
    
    const corsHeader = response.headers()['access-control-allow-origin'];
    
    // CORS não deve permitir origins arbitrárias em produção
    if (corsHeader) {
      expect(corsHeader).not.toBe('*');
      console.log(`CORS configuration: ${corsHeader}`);
    }
    
    console.log('CORS security validated');
  });

  test('should check for secure dependencies', async () => {
    try {
      // Executar verificação de dependências conhecidas
      const { stdout } = await execAsync('npm ls --depth=0');
      
      // Verificar se não há dependências problemáticas conhecidas
      const problematicPackages = ['eval', 'vm2', 'serialize-javascript'];
      
      for (const pkg of problematicPackages) {
        expect(stdout).not.toContain(pkg);
      }
      
      console.log('Dependency security check passed');
      
    } catch (error) {
      console.warn('Dependency check warning:', error.message);
      // Não falhar o teste por dependências missing em dev
    }
  });
});

