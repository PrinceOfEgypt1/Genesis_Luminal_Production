import { describe, it, expect, beforeEach } from 'vitest';
import { 
  DistributionEngine, 
  IDistributionStrategy,
  FibonacciDistribution,
  SpiralDistribution,
  Vector2D
} from '../../core/distribution/DistributionEngine';

describe('DistributionEngine', () => {
  let engine: DistributionEngine;

  beforeEach(() => {
    engine = new DistributionEngine();
  });

  it('should have default strategies registered', () => {
    const strategies = engine.getAvailableStrategies();
    
    expect(strategies).toContain('fibonacci');
    expect(strategies).toContain('spiral');
    expect(strategies).toContain('organic');
    expect(strategies).toContain('random');
  });

  it('should switch strategies correctly (OCP test)', () => {
    const center: Vector2D = { x: 400, y: 300 };
    
    expect(() => {
      engine.setStrategy('fibonacci');
      engine.generateDistribution(10, center);
    }).not.toThrow();

    expect(() => {
      engine.setStrategy('spiral');
      engine.generateDistribution(10, center);
    }).not.toThrow();
  });

  it('should allow registering new strategies (OCP test)', () => {
    const customStrategy: IDistributionStrategy = {
      name: 'custom',
      description: 'Custom test strategy',
      generate: (count: number, center: Vector2D) => [{ x: center.x, y: center.y }]
    };

    engine.registerStrategy(customStrategy);
    const success = engine.setStrategy('custom');
    
    expect(success).toBe(true);
    expect(engine.getAvailableStrategies()).toContain('custom');
    
    const result = engine.generateDistribution(5, { x: 100, y: 100 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ x: 100, y: 100 });
  });

  it('should return false for unknown strategy', () => {
    const success = engine.setStrategy('nonexistent');
    expect(success).toBe(false);
  });

  it('should generate correct number of points', () => {
    const count = 25;
    const center: Vector2D = { x: 400, y: 300 };
    
    engine.setStrategy('fibonacci');
    const result = engine.generateDistribution(count, center);
    
    expect(result).toHaveLength(count);
    result.forEach(point => {
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
    });
  });
});

describe('FibonacciDistribution', () => {
  it('should generate golden ratio spiral', () => {
    const fibonacci = new FibonacciDistribution();
    const points = fibonacci.generate(10, { x: 0, y: 0 });
    
    expect(points).toHaveLength(10);
    
    // Verificar que os pontos seguem padrão de crescimento
    const distances = points.map(p => Math.sqrt(p.x * p.x + p.y * p.y));
    
    // Distâncias devem crescer (padrão fibonacci)
    for (let i = 1; i < distances.length; i++) {
      expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
    }
  });
});

describe('SpiralDistribution', () => {
  it('should generate logarithmic spiral', () => {
    const spiral = new SpiralDistribution();
    const points = spiral.generate(10, { x: 0, y: 0 });
    
    expect(points).toHaveLength(10);
    
    // Verificar crescimento espiral
    const distances = points.map(p => Math.sqrt(p.x * p.x + p.y * p.y));
    
    // Primeiros pontos devem estar no centro
    expect(distances[0]).toBeLessThan(10);
    
    // Últimos pontos devem estar mais distantes
    expect(distances[distances.length - 1]).toBeGreaterThan(distances[0]);
  });
});
