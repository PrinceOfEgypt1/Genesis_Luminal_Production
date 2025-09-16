/**
 * Testes de integração para API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../index';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup do teste
  });

  afterAll(async () => {
    // Cleanup do teste
  });

  describe('Emotional Analysis Endpoint', () => {
    it('should accept valid emotional analysis request', async () => {
      const validPayload = {
        currentState: {
          joy: 0.5,
          sadness: 0.2,
          anger: 0.1,
          fear: 0.1,
          surprise: 0.1,
          disgust: 0.0,
          valence: 0.3,
          arousal: 0.4,
          dominantAffect: 'joy',
          intensity: 0.5
        },
        mousePosition: {
          x: 100,
          y: 200
        },
        sessionDuration: 1000,
        text: 'Test emotional state'
      };

      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(validPayload)
        .expect(200);

      expect(response.body).toHaveProperty('intensity');
      expect(response.body).toHaveProperty('dominantAffect');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle malformed requests gracefully', async () => {
      const malformedPayload = {
        invalid: 'data'
      };

      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(malformedPayload)
        .expect(200); // API should handle gracefully

      expect(response.body).toHaveProperty('intensity');
      expect(response.body).toHaveProperty('dominantAffect');
    });
  });

  describe('Rate Limiting', () => {
    it('should not rate limit health endpoints', async () => {
      // Fazer múltiplas requisições para health
      const promises = Array(10).fill(null).map(() =>
        request(app).get('/api/liveness')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach((response: any) => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('CORS and Security', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/liveness')
        .expect(200);

      // Verificar headers de segurança
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
