/**
 * Testes de integração para API endpoints
 * Usa app.ts sem inicialização do servidor
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app';

describe('API Integration Tests', () => {
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
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('recommendation');
      expect(response.body).toHaveProperty('emotionalShift');
      expect(response.body).toHaveProperty('morphogenicSuggestion');
    });

    it('should handle malformed requests gracefully', async () => {
      const malformedPayload = {
        invalid: 'data'
      };

      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(malformedPayload)
        .expect(200);

      expect(response.body).toHaveProperty('intensity');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('recommendation');
    });
  });

  describe('Rate Limiting', () => {
    it('should not rate limit health endpoints', async () => {
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

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });
});
