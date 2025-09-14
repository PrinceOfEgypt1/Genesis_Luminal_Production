import { AnalyzeEmotionalStateUseCase } from '../../application/usecases/AnalyzeEmotionalStateUseCase';
import { HealthCheckUseCase } from '../../application/usecases/HealthCheckUseCase';
import { EmotionalAnalyzerAdapter } from '../../infrastructure/adapters/EmotionalAnalyzerAdapter';
import { CacheServiceAdapter } from '../../infrastructure/adapters/CacheServiceAdapter';
import { LoggerAdapter } from '../../infrastructure/adapters/LoggerAdapter';

describe('Use Cases Integration', () => {
  let analyzeUseCase: AnalyzeEmotionalStateUseCase;
  let healthUseCase: HealthCheckUseCase;

  beforeEach(() => {
    const analyzer = new EmotionalAnalyzerAdapter();
    const cache = new CacheServiceAdapter();
    const logger = new LoggerAdapter();

    analyzeUseCase = new AnalyzeEmotionalStateUseCase(analyzer, cache, logger);
    healthUseCase = new HealthCheckUseCase(analyzer, cache, logger);
  });

  it('should execute emotional analysis use case', async () => {
    const request = {
      currentState: {
        joy: 0.7, nostalgia: 0.3, curiosity: 0.8, serenity: 0.4,
        ecstasy: 0.2, mystery: 0.6, power: 0.5
      },
      mousePosition: { x: 100, y: 200 },
      sessionDuration: 60000
    };

    const result = await analyzeUseCase.execute(request);

    expect(result).toHaveProperty('intensity');
    expect(result).toHaveProperty('dominantAffect');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('confidence');
  });

  it('should handle text analysis use case', async () => {
    const request = {
      text: 'This is a beautiful day full of possibilities!'
    } as any;

    const result = await analyzeUseCase.execute(request);

    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('timestamp');
  });

  it('should execute health check use case', async () => {
    const liveness = await healthUseCase.checkLiveness();
    
    expect(liveness).toHaveProperty('status');
    expect(liveness).toHaveProperty('timestamp');
    expect(liveness.status).toBe('alive');
  });

  it('should execute readiness check use case', async () => {
    const readiness = await healthUseCase.checkReadiness();
    
    expect(readiness).toHaveProperty('status');
    expect(readiness).toHaveProperty('ready');
    expect(readiness).toHaveProperty('timestamp');
    expect(typeof readiness.ready).toBe('boolean');
  });

  it('should execute detailed status use case', async () => {
    const status = await healthUseCase.getDetailedStatus();
    
    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('service');
    expect(status).toHaveProperty('uptime_seconds');
    expect(status).toHaveProperty('memory_mb');
  });

  it('should validate request correctly', async () => {
    // Teste com request inválido
    await expect(analyzeUseCase.execute(null as any))
      .rejects.toThrow('Request cannot be null or undefined');

    // Teste com request sem dados suficientes
    await expect(analyzeUseCase.execute({} as any))
      .rejects.toThrow('Request must contain either currentState or text input');
  });
});
