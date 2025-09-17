import request from 'supertest';
import express from 'express';
import { createRateLimiter } from '../../../middleware/rateLimit';

describe('Rate Limit Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  describe('createRateLimiter', () => {
    it('should create rate limiter with custom config', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 10,
        message: 'Custom limit exceeded'
      });

      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });

    it('should allow requests under limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 5
      });

      app.use(limiter);
      app.get('/test', (req, res) => res.json({ success: true }));

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should block requests over limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 2
      });

      app.use(limiter);
      app.get('/test', (req, res) => res.json({ success: true }));

      // First two requests should pass
      await request(app).get('/test').expect(200);
      await request(app).get('/test').expect(200);

      // Third request should be rate limited
      await request(app).get('/test').expect(429);
    });

    it('should include rate limit headers', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 5
      });

      app.use(limiter);
      app.get('/test', (req, res) => res.json({ success: true }));

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should handle custom message', async () => {
      const customMessage = 'Too many requests, please slow down';
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 1,
        message: customMessage
      });

      app.use(limiter);
      app.get('/test', (req, res) => res.json({ success: true }));

      // First request passes
      await request(app).get('/test').expect(200);

      // Second request should be limited with custom message
      const response = await request(app)
        .get('/test')
        .expect(429);

      expect(response.text).toContain(customMessage);
    });
  });
});
