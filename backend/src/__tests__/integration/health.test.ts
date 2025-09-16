/**
 * Testes de integração para health endpoints
 * CORRIGIDO: Campos correspondem à API real
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../index';

describe('Health Endpoints Integration', () => {
  let server: any;

  beforeAll(async () => {
    // Usar porta diferente para testes
    process.env.PORT = '3002';
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/liveness', () => {
    it('should return 200 and alive status', async () => {
      const response = await request(app)
        .get('/api/liveness')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/readiness', () => {
    it('should return 200 and ready status', async () => {
      const response = await request(app)
        .get('/api/readiness')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/status', () => {
    it('should return 200 and detailed status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      // Campos que realmente existem na API
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('uptime_seconds'); // Não 'uptime'
      expect(response.body).toHaveProperty('memory_mb');
      expect(response.body).toHaveProperty('claude_api_key');
    });
  });

  describe('Concurrent Health Checks', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() =>
        request(app).get('/api/liveness')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach((response: any) => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('alive');
      });
    });
  });
});
