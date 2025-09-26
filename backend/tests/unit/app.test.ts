import request from 'supertest';
import app from '../../src/app';

describe('Genesis Luminal Backend - Unit Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'Genesis Luminal Backend');
    });
    
    it('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      const timestamp = response.body.timestamp;
      expect(new Date(timestamp)).toBeInstanceOf(Date);
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });
});
