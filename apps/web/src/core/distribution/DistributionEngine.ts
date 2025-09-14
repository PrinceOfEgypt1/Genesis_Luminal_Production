/**
 * Responsabilidade ÚNICA: Algoritmos de distribuição de partículas
 * Implementa Strategy Pattern (OCP) e SRP
 */

export interface IDistributionStrategy {
  generate(count: number, center: Vector2D): Vector2D[];
  name: string;
  description: string;
}

export class DistributionEngine {
  private strategies = new Map<string, IDistributionStrategy>();
  private currentStrategy: IDistributionStrategy;

  constructor() {
    // Registrar estratégias padrão
    this.registerStrategy(new FibonacciDistribution());
    this.registerStrategy(new SpiralDistribution());
    this.registerStrategy(new OrganicDistribution());
    this.registerStrategy(new RandomDistribution());
    
    this.currentStrategy = this.strategies.get('fibonacci')!;
  }

  registerStrategy(strategy: IDistributionStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  setStrategy(name: string): boolean {
    const strategy = this.strategies.get(name);
    if (strategy) {
      this.currentStrategy = strategy;
      return true;
    }
    return false;
  }

  generateDistribution(count: number, center: Vector2D): Vector2D[] {
    return this.currentStrategy.generate(count, center);
  }

  getCurrentStrategy(): IDistributionStrategy {
    return this.currentStrategy;
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}

// Implementações concretas das estratégias

export class FibonacciDistribution implements IDistributionStrategy {
  name = 'fibonacci';
  description = 'Distribuição baseada na sequência de Fibonacci';

  generate(count: number, center: Vector2D): Vector2D[] {
    const points: Vector2D[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 graus

    for (let i = 0; i < count; i++) {
      const radius = Math.sqrt(i) * 10;
      const angle = i * goldenAngle;
      
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }

    return points;
  }
}

export class SpiralDistribution implements IDistributionStrategy {
  name = 'spiral';
  description = 'Distribuição em espiral logarítmica';

  generate(count: number, center: Vector2D): Vector2D[] {
    const points: Vector2D[] = [];
    const spiralTightness = 0.2;
    
    for (let i = 0; i < count; i++) {
      const t = i * spiralTightness;
      const radius = t * 5;
      
      points.push({
        x: center.x + radius * Math.cos(t),
        y: center.y + radius * Math.sin(t)
      });
    }

    return points;
  }
}

export class OrganicDistribution implements IDistributionStrategy {
  name = 'organic';
  description = 'Distribuição orgânica com ruído Perlin';

  generate(count: number, center: Vector2D): Vector2D[] {
    const points: Vector2D[] = [];
    
    for (let i = 0; i < count; i++) {
      // Simulação simples de ruído orgânico
      const angle = (i / count) * Math.PI * 2;
      const radiusVariation = 1 + 0.3 * Math.sin(i * 0.1) * Math.cos(i * 0.07);
      const radius = (i / count) * 200 * radiusVariation;
      
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }

    return points;
  }
}

export class RandomDistribution implements IDistributionStrategy {
  name = 'random';
  description = 'Distribuição aleatória uniforme';

  generate(count: number, center: Vector2D): Vector2D[] {
    const points: Vector2D[] = [];
    const maxRadius = 300;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius;
      
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }

    return points;
  }
}

export interface Vector2D {
  x: number;
  y: number;
}
