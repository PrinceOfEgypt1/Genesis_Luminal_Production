/**
 * Testes de Integração - Rotas API
 * Usando Supertest para validar endpoints
 */

import request from 'supertest';
import express from 'express';
import { setupRoutes } from '../../routes';
import { config } from '../../config/environment';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/api', setupRoutes());

describe('API Routes Integration Tests', () => {
  
  describe('Health Endpoints', () => {
    it('GET /api/liveness should return healthy status', async () => {
      const response = await request(app)
        .get('/api/liveness')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('GET /api/readiness should return ready status', async () => {
      const response = await request(app)
        .get('/api/readiness')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('GET /api/status should return detailed status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
    });

    it('Health endpoints should not be rate limited', async () => {
      // Fazer múltiplas requisições rápidas
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/api/liveness')
      );

      const responses = await Promise.all(requests);
      
      // Todas devem ter sucesso
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status');
      });
    });
  });

  describe('Emotional Analysis API', () => {
    it('POST /api/emotional/analyze should process emotional state', async () => {
      const payload = {
        emotionalState: {
          joy: 0.8,
          nostalgia: 0.3,
          curiosity: 0.9,
          serenity: 0.5,
          ecstasy: 0.2,
          mystery: 0.7,
          power: 0.6
        },
        mousePosition: { x: 400, y: 300 },
        sessionDuration: 120000
      };

      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(payload)
        .expect(200);

      // Validar estrutura da resposta
      expect(response.body).toHaveProperty('intensity');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('dominantAffect');
      expect(response.body).toHaveProperty('recommendation');
      expect(response.body).toHaveProperty('emotionalShift');
      expect(response.body).toHaveProperty('morphogenicSuggestion');

      // Validar tipos de dados
      expect(typeof response.body.intensity).toBe('number');
      expect(typeof response.body.confidence).toBe('number');
      expect(typeof response.body.timestamp).toBe('string');
      expect(typeof response.body.dominantAffect).toBe('string');

      // Validar ranges
      expect(response.body.intensity).toBeGreaterThanOrEqual(0);
      expect(response.body.intensity).toBeLessThanOrEqual(1);
      expect(response.body.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.confidence).toBeLessThanOrEqual(1);
    });

    it('POST /api/emotional/analyze should handle text input', async () => {
      const payload = {
        text: 'I am feeling very happy and excited about this new project!'
      };

      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(payload)
        .expect(200);

      expect(response.body).toHaveProperty('intensity');
      expect(response.body).toHaveProperty('confidence');
      expect(typeof response.body.intensity).toBe('number');
    });

    it('POST /api/emotional/analyze should validate request size limits', async () => {
      // Criar payload muito grande (> 1MB)
      const largeText = 'x'.repeat(2 * 1024 * 1024); // 2MB
      const payload = { text: largeText };

      const response = await request(app)
        .post('/api/emotional/analyze')
        .send(payload);

      // Deve rejeitar payload muito grande
      expect(response.status).toBe(413);
    });

    it('POST /api/emotional/analyze should handle empty requests gracefully', async () => {
      const response = await request(app)
        .post('/api/emotional/analyze')
        .send({})
        .expect(200);

      // Mesmo com payload vazio, deve retornar resposta válida
      expect(response.body).toHaveProperty('intensity');
      expect(response.body.intensity).toBeGreaterThanOrEqual(0);
    });

    it('POST /api/emotional/analyze should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/emotional/analyze')
        .type('json')
        .send('{"malformed": json}')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid HTTP methods', async () => {
      const response = await request(app)
        .patch('/api/emotional/analyze')
        .expect(405);
    });

    it('should validate Content-Type headers', async () => {
      const response = await request(app)
        .post('/api/emotional/analyze')
        .type('text/plain')
        .send('plain text payload')
        .expect(415);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/api/liveness');

      // Verificar headers de segurança (Helmet)
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/emotional/analyze')
        .set('Origin', config.FRONTEND_URL);

      expect(response.headers['access-control-allow-origin']).toBe(config.FRONTEND_URL);
    });
  });
});
