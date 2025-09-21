/**
 * @fileoverview Tipos para status do sistema - Genesis Luminal
 * @version 1.0.0
 */

export enum FeatureStatus {
  IMPLEMENTED = 'IMPLEMENTED',
  SIMULATION = 'SIMULATION', 
  PLANNED = 'PLANNED',
  DISABLED = 'DISABLED'
}

export enum ConfidenceLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM', 
  LOW = 'LOW',
  EXPERIMENTAL = 'EXPERIMENTAL',
  DEMO_ONLY = 'DEMO_ONLY'
}

export interface FeatureInfo {
  name: string;
  status: FeatureStatus;
  confidence: ConfidenceLevel;
  description: string;
  version?: string;
  dependencies?: string[];
  limitations?: string[];
  sinceVersion?: string;
  lastUpdated?: Date;
  technicalNotes?: string;  // ADICIONADO para resolver 8 erros
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  services: {
    [service: string]: {
      status: 'up' | 'down' | 'degraded';
      latency?: number;
      error?: string;
    };
  };
}

// Implementação FeatureRegistry com propriedades adicionais no retorno
export class FeatureRegistry {
  private static features = new Map<string, FeatureInfo>();

  static register(name: string, info: FeatureInfo): void {
    this.features.set(name, info);
  }

  static getFeature(name: string): FeatureInfo | undefined {
    return this.features.get(name);
  }

  static isImplemented(name: string): boolean {
    const feature = this.features.get(name);
    return feature?.status === FeatureStatus.IMPLEMENTED;
  }

  static getStatus(name: string): FeatureStatus {
    const feature = this.features.get(name);
    return feature?.status || FeatureStatus.PLANNED;
  }

  static getAll(): Map<string, FeatureInfo> {
    return new Map(this.features);
  }

  static generateHonestyReport(): {
    implemented: number;
    simulation: number;
    planned: number;
    total: number;
    simulated: number;      // ADICIONADO
    honestyScore: number;   // ADICIONADO
  } {
    const stats = {
      implemented: 0,
      simulation: 0,
      planned: 0,
      total: this.features.size,
      simulated: 0,           // ADICIONADO
      honestyScore: 0         // ADICIONADO
    };

    this.features.forEach(feature => {
      switch (feature.status) {
        case FeatureStatus.IMPLEMENTED:
          stats.implemented++;
          break;
        case FeatureStatus.SIMULATION:
          stats.simulation++;
          stats.simulated++;    // Count simulations
          break;
        case FeatureStatus.PLANNED:
          stats.planned++;
          break;
      }
    });

    // Calculate honesty score
    stats.honestyScore = stats.total > 0 ? 
      Math.round((stats.implemented / stats.total) * 100) : 0;

    return stats;
  }
}
