import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

// Import do middleware real (ajustado)
describe('Rate Limit Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  describe('rate limiting functionality', () => {
    it('should create and use rate limiter', () => {
      const limiter = rateLimit({
        windowMs: 60000,
        max: 10,
        message: 'Rate limit exceeded'
      });

      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });

    it('should allow requests under limit', async () => {
      const limiter = rateLimit({
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

    it('should include rate limit headers', async () => {
      const limiter = rateLimit({
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
    });

    it('should handle high traffic scenarios', async () => {
      const limiter = rateLimit({
        windowMs: 60000,
        max: 2
      });

      app.use(limiter);
      app.get('/test', (req, res) => res.json({ success: true }));

      // First request should pass
      await request(app).get('/test').expect(200);
      
      // Second request should pass
      await request(app).get('/test').expect(200);

      // Third request should be rate limited
      await request(app).get('/test').expect(429);
    });

    it('should reset after time window', async () => {
      const limiter = rateLimit({
        windowMs: 100, // Very short window for testing
        max: 1
      });

      app.use(limiter);
      app.get('/test', (req, res) => res.json({ success: true }));

      // First request should pass
      await request(app).get('/test').expect(200);

      // Second request should be limited
      await request(app).get('/test').expect(429);

      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should work again after reset
      await request(app).get('/test').expect(200);
    });
  });

  describe('middleware integration', () => {
    it('should work with express middleware chain', async () => {
      const limiter = rateLimit({
        windowMs: 60000,
        max: 10
      });

      app.use(limiter);
      app.use((req, res, next) => {
        res.locals.middleware = 'passed';
        next();
      });
      app.get('/test', (req, res) => {
        res.json({ 
          success: true,
          middleware: res.locals.middleware
        });
      });

      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.middleware).toBe('passed');
    });
  });
});
