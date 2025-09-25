export class FeatureRegistry {
  private static features = new Map<string, any>();
  
  static register(name: string, config: any): void {
    this.features.set(name, config);
  }
  
  static getAll(): Map<string, any> {
    return this.features;
  }
  
  static generateHonestyReport(): any {
    return { features: Array.from(this.features.entries()) };
  }
}

export enum FeatureStatus {
  IMPLEMENTED = 'IMPLEMENTED',
  SIMULATION = 'SIMULATION',
  PLANNED = 'PLANNED'
}

export enum ConfidenceLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM', 
  LOW = 'LOW',
  DEMO_ONLY = 'DEMO_ONLY'
}
