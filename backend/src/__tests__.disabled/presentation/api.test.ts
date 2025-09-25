/**
 * @fileoverview Testes de integração para API endpoints
 * @description Testa todos os endpoints REST do Genesis Luminal
 */

import request from 'supertest';
import app from '../../app';

describe('Genesis Luminal API Endpoints', () => {
  describe('Health Check', () => {
    it('GET /api/health should return status 200', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'genesis-luminal-backend'
      });
    });

    it('GET /api/health should not be rate limited', async () => {
      // Test multiple rapid requests
      const promises = Array(20).fill(null).map(() => 
        request(app).get('/api/health').expect(200)
      );

      await Promise.all(promises);
    });
  });

  describe('Emotional Processing API', () => {
    it('POST /api/emotions/process should process emotional input', async () => {
      const emotionalInput = {
        intensity: 0.8,
        valence: 0.6,
        arousal: 0.7,
        timestamp: Date.now()
      };

      const response = await request(app)
        .post('/api/emotions/process')
        .send(emotionalInput)
        .expect(200);

      expect(response.body).toMatchObject({
        processedEmotion: expect.any(Object),
        confidence: expect.any(Number),
        timestamp: expect.any(Number)
      });

      expect(response.body.confidence).toBeGreaterThan(0);
      expect(response.body.confidence).toBeLessThanOrEqual(1);
    });

    it('POST /api/emotions/process should validate input', async () => {
      const invalidInput = {
        intensity: -0.5, // Invalid
        valence: 0.6,
        arousal: 0.7
      };

      await request(app)
        .post('/api/emotions/process')
        .send(invalidInput)
        .expect(400);
    });

    it('POST /api/emotions/process should handle missing fields', async () => {
      const incompleteInput = {
        intensity: 0.8
        // Missing valence, arousal, timestamp
      };

      await request(app)
        .post('/api/emotions/process')
        .send(incompleteInput)
        .expect(400);
    });
  });

  describe('Morphogenesis API', () => {
    it('POST /api/morphogenesis/generate should generate visual data', async () => {
      const emotionalDNA = {
        joy: 0.8,
        sadness: 0.1,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.3,
        disgust: 0.1,
        trust: 0.7
      };

      const response = await request(app)
        .post('/api/morphogenesis/generate')
        .send({ emotionalDNA })
        .expect(200);

      expect(response.body).toMatchObject({
        vertices: expect.any(Array),
        colors: expect.any(Array),
        transformationMatrix: expect.any(Array),
        generationTime: expect.any(Number)
      });

      expect(response.body.generationTime).toBeLessThan(50); // Performance requirement
    });
  });

  describe('Audio Synthesis API', () => {
    it('POST /api/audio/synthesize should generate audio parameters', async () => {
      const emotionalDNA = {
        joy: 0.6,
        sadness: 0.2,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.3,
        disgust: 0.1,
        trust: 0.5
      };

      const response = await request(app)
        .post('/api/audio/synthesize')
        .send({ emotionalDNA })
        .expect(200);

      expect(response.body).toMatchObject({
        frequency: expect.any(Number),
        harmonics: expect.any(Array),
        timbre: expect.any(Object),
        duration: expect.any(Number)
      });
    });
  });

  describe('Metrics and Monitoring', () => {
    it('GET /metrics should return Prometheus metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('genesis_requests_total');
      expect(response.text).toContain('genesis_request_duration_seconds');
    });

    it('should track custom metrics correctly', async () => {
      // Make some API calls to generate metrics
      await request(app).get('/api/health');
      await request(app).post('/api/emotions/process').send({
        intensity: 0.5,
        valence: 0.5,
        arousal: 0.5,
        timestamp: Date.now()
      });

      const response = await request(app).get('/metrics');
      
      expect(response.text).toContain('genesis_requests_total{method="GET",route="/api/health"}');
      expect(response.text).toContain('genesis_requests_total{method="POST",route="/api/emotions/process"}');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/api/non-existent')
        .expect(404);
    });

    it('should handle server errors gracefully', async () => {
      // This would test error middleware
      // Implementation depends on actual error handling setup
    });
  });

  describe('CORS and Security', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });
});
