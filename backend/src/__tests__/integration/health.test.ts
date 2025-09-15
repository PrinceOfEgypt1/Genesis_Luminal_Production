/**
 * Testes específicos de health checks
 * CORREÇÃO: Tipagem TypeScript adequada
 */

import request from 'supertest';
import app from '../../index';

describe('Health Check Endpoints', () => {
  describe('Liveness Probe', () => {
    test('should return alive status', async () => {
      const response = await request(app)
        .get('/api/liveness')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        status: 'alive',
        timestamp: expect.any(String)
      });
    });

    test('should respond quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/liveness')
        .expect(200);
        
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Menos de 1 segundo
    });
  });

  describe('Readiness Probe', () => {
    test('should return readiness status', async () => {
      const response = await request(app)
        .get('/api/readiness');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('ready');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.ready).toBe('boolean');
    });
  });

  describe('Status Endpoint', () => {
    test('should return detailed system status', async () => {
      const response = await request(app)
        .get('/api/status');

      expect([200, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('timestamp');
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('status');
      }
    });
  });

  describe('Rate Limiting Exemption', () => {
    test('health endpoints should not be rate limited', async () => {
      // Fazer 20 requests rápidas consecutivas
      const promises = Array.from({ length: 20 }, (_, i) =>
        request(app)
          .get('/api/liveness')
          .timeout(5000)
      );

      const responses = await Promise.all(promises);
      
      // Todas devem retornar 200 (nenhuma deve ser rate limited)
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'alive');
      });
    });
  });

  describe('Response Headers', () => {
    test('should include required headers', async () => {
      const response = await request(app)
        .get('/api/liveness');

      // Headers de segurança
      expect(response.headers).toHaveProperty('x-request-id');
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
      
      // Content-Type correto
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
