/**
 * @fileoverview Testes unitários para Sistema de Métricas - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Testes para sistema de métricas Prometheus
 */

const promClient = require('prom-client');

describe('Prometheus Metrics System', () => {
  let mockCounter;
  let mockHistogram;
  
  beforeEach(() => {
    // Reset do registry antes de cada teste
    promClient.register.clear();
    
    // Mock dos contadores
    mockCounter = new promClient.Counter({
      name: 'genesis_requests_total',
      help: 'Total number of requests to Genesis Luminal',
      labelNames: ['method', 'route', 'status_code']
    });
    
    mockHistogram = new promClient.Histogram({
      name: 'genesis_request_duration_seconds',
      help: 'Duration of requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5]
    });
  });
  
  afterEach(() => {
    promClient.register.clear();
  });
  
  /**
   * @test Verificar criação de contador
   */
  test('should create counter metric correctly', () => {
    expect(mockCounter).toBeDefined();
    expect(mockCounter.name).toBe('genesis_requests_total');
    expect(mockCounter.help).toBe('Total number of requests to Genesis Luminal');
  });
  
  /**
   * @test Verificar incremento de contador
   */
  test('should increment counter with labels', async () => {
    mockCounter.labels('GET', '/api/health', '200').inc();
    
    const metrics = await promClient.register.metrics();
    expect(metrics).toContain('genesis_requests_total');
    expect(metrics).toContain('method="GET"');
    expect(metrics).toContain('route="/api/health"');
    expect(metrics).toContain('status_code="200"');
  });
  
  /**
   * @test Verificar histogram de duração
   */
  test('should record histogram values correctly', async () => {
    const duration = 0.250; // 250ms
    mockHistogram.labels('POST', '/api/emotion').observe(duration);
    
    const metrics = await promClient.register.metrics();
    expect(metrics).toContain('genesis_request_duration_seconds');
    expect(metrics).toContain('method="POST"');
    expect(metrics).toContain('route="/api/emotion"');
  });
  
  /**
   * @test Verificar múltiplas métricas
   */
  test('should handle multiple metric observations', async () => {
    // Simular múltiplas requests
    for (let i = 0; i < 10; i++) {
      mockCounter.labels('GET', '/api/health', '200').inc();
      mockHistogram.labels('GET', '/api/health').observe(Math.random() * 0.5);
    }
    
    const metrics = await promClient.register.metrics();
    
    // Verificar se métricas foram coletadas
    expect(metrics).toContain('genesis_requests_total{method="GET",route="/api/health",status_code="200"} 10');
    expect(metrics).toContain('genesis_request_duration_seconds_count{method="GET",route="/api/health"} 10');
  });
  
  /**
   * @test Verificar buckets do histogram
   */
  test('should have correct histogram buckets', () => {
    const expectedBuckets = [0.1, 0.5, 1, 2, 5];
    expect(mockHistogram.buckets).toEqual(expectedBuckets);
  });
});
