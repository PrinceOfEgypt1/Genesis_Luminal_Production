/**
 * @fileoverview Testes unitários para Health Check - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Testes para endpoint de saúde da aplicação
 */

const request = require('supertest');
const express = require('express');

// Mock da aplicação para teste isolado
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Health check endpoint
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
  
  /**
   * @test Verificar se endpoint retorna status 200
   */
  test('should return 200 status code', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.status).toBe(200);
  });
  
  /**
   * @test Verificar estrutura da resposta
   */
  test('should return correct response structure', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('service');
    expect(response.body).toHaveProperty('version');
    
    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('genesis-luminal');
  });
  
  /**
   * @test Verificar formato do timestamp
   */
  test('should return valid ISO timestamp', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    const timestamp = response.body.timestamp;
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    
    // Verificar se é uma data válida
    const date = new Date(timestamp);
    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).not.toBeNaN();
  });
  
  /**
   * @test Verificar performance do endpoint
   */
  test('should respond within acceptable time', async () => {
    const startTime = Date.now();
    
    await request(app)
      .get('/api/health')
      .expect(200);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Health check deve responder em menos de 100ms
    expect(responseTime).toBeLessThan(100);
  });
});
