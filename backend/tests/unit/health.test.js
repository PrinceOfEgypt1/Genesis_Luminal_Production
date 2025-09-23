const request = require('supertest');
const express = require('express');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'genesis-luminal',
      version: '1.0.0'
    });
  });
  
  return app;
};

describe('Health Check Endpoint', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  test('should return 200 status code', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.status).toBe(200);
  });
  
  test('should return correct response structure', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body.status).toBe('healthy');
  });
});
