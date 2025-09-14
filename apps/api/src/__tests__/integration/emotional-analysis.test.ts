import request from 'supertest';
import express from 'express';
import { setupRoutes } from '../../routes';

const app = express();
app.use(express.json());
app.use('/api', setupRoutes());

describe('Emotional Analysis Integration', () => {
  it('should analyze emotional state successfully', async () => {
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

    expect(response.body).toHaveProperty('intensity');
    expect(response.body).toHaveProperty('confidence');
    expect(response.body).toHaveProperty('timestamp');
    expect(typeof response.body.intensity).toBe('number');
    expect(typeof response.body.confidence).toBe('number');
  });

  it('should handle text-based analysis', async () => {
    const payload = {
      text: 'I am feeling very happy and excited today!'
    };

    const response = await request(app)
      .post('/api/emotional/analyze')
      .send(payload)
      .expect(200);

    expect(response.body).toHaveProperty('intensity');
    expect(response.body).toHaveProperty('confidence');
  });

  it('should handle empty requests gracefully', async () => {
    const response = await request(app)
      .post('/api/emotional/analyze')
      .send({})
      .expect(200);

    expect(response.body).toHaveProperty('intensity');
    expect(response.body.intensity).toBe(0.5); // Fallback value
  });

  it('should validate health endpoints are not rate limited', async () => {
    // Fazer múltiplas requisições rapidamente
    const promises = Array(5).fill(null).map(() =>
      request(app).get('/api/liveness').expect(200)
    );

    const responses = await Promise.all(promises);
    
    // Todas devem ter sucesso (não rate limited)
    responses.forEach(response => {
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('alive');
    });
  });

  it('should return detailed status information', async () => {
    const response = await request(app)
      .get('/api/status')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('service');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('uptime_seconds');
    expect(response.body).toHaveProperty('memory_mb');
  });
});
