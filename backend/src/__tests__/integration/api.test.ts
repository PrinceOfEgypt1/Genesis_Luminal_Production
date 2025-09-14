import request from 'supertest'
import app from '../../index'

describe('API Integration Tests', () => {
  describe('Health Endpoints', () => {
    it('should return 200 for liveness check', async () => {
      const response = await request(app)
        .get('/api/liveness')
        .expect(200)
      
      expect(response.body).toHaveProperty('status', 'ok')
    })

    it('should return 200 for readiness check', async () => {
      const response = await request(app)
        .get('/api/readiness')
        .expect(200)
      
      expect(response.body).toHaveProperty('status', 'ready')
    })

    it('should return system status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200)
      
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('uptime')
    })
  })

  describe('Emotional Analysis', () => {
    it('should handle valid analysis request', async () => {
      const requestBody = {
        text: 'I am feeling great today!',
        metadata: { sessionId: 'test-session' }
      }

      const response = await request(app)
        .post('/api/analyze')
        .send(requestBody)
        .expect(200)
      
      expect(response.body).toHaveProperty('analysis')
    })

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({}) // Empty body
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should handle rate limiting', async () => {
      // Fazer múltiplas requisições para testar rate limit
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/analyze')
          .send({ text: 'test', metadata: {} })
      )

      const responses = await Promise.all(promises)
      
      // Pelo menos uma requisição deve passar
      const successfulRequests = responses.filter(r => r.status === 200)
      expect(successfulRequests.length).toBeGreaterThan(0)
    })
  })
})
