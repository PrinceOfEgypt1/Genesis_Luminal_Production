/**
 * @fileoverview Testes de integração para API - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Testes end-to-end para endpoints da API
 */

const request = require('supertest');
const app = require('../../src/app'); // Assumindo que app.js exporta a instância Express

describe('API Integration Tests', () => {
  /**
   * @test Verificar endpoint de saúde integrado
   */
  describe('GET /api/health', () => {
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toMatchObject({
        status: 'healthy',
        service: 'genesis-luminal'
      });
      
      expect(response.body.timestamp).toBeDefined();
    });
  });
  
  /**
   * @test Verificar endpoint de métricas Prometheus
   */
  describe('GET /metrics', () => {
    test('should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      expect(response.text).toContain('# HELP');
      expect(response.text).toContain('# TYPE');
      expect(response.headers['content-type']).toMatch(/text\/plain/);
    });
    
    test('should include custom Genesis metrics', async () => {
      // Fazer algumas requests primeiro para gerar métricas
      await request(app).get('/api/health');
      await request(app).get('/api/health');
      
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      expect(response.text).toContain('genesis_requests_total');
      expect(response.text).toContain('genesis_request_duration_seconds');
    });
  });
  
  /**
   * @test Verificar Swagger UI
   */
  describe('GET /api-docs', () => {
    test('should serve Swagger UI', async () => {
      const response = await request(app)
        .get('/api-docs/')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.text).toContain('swagger-ui');
    });
  });
  
  /**
   * @test Verificar middleware de logging
   */
  describe('Request Logging Middleware', () => {
    test('should log requests with correlation ID', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      // Verificar se correlation ID foi adicionado
      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-correlation-id']).toMatch(/^[a-f0-9-]+$/);
    });
  });
  
  /**
   * @test Verificar headers de segurança
   */
  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });
  
  /**
   * @test Verificar rate limiting (se implementado)
   */
  describe('Rate Limiting', () => {
    test('should not rate limit health check', async () => {
      // Fazer múltiplas requests rapidamente
      const promises = Array(10).fill().map(() => 
        request(app).get('/api/health')
      );
      
      const responses = await Promise.all(promises);
      
      // Todas devem retornar 200 (health check não deve ter rate limit)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
  
  /**
   * @test Verificar CORS headers
   */
  describe('CORS Configuration', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
