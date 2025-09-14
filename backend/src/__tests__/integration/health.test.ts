import request from 'supertest'
import express from 'express'

// Mock básico da app para teste
const app = express()

app.get('/api/liveness', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/readiness', (req, res) => {
  res.json({ status: 'ready', timestamp: new Date().toISOString() })
})

describe('Health Endpoints', () => {
  it('should return 200 for liveness check', async () => {
    const response = await request(app)
      .get('/api/liveness')
      .expect(200)
    
    expect(response.body).toHaveProperty('status', 'ok')
    expect(response.body).toHaveProperty('timestamp')
  })

  it('should return 200 for readiness check', async () => {
    const response = await request(app)
      .get('/api/readiness')
      .expect(200)
    
    expect(response.body).toHaveProperty('status', 'ready')
  })
})
